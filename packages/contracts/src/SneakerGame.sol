// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {GameConfig, GameMath} from "./libraries/GameMath.sol";
import {SneakerAttributes, SneakerNft} from "./SneakerNft.sol";
import {StrideToken} from "./StrideToken.sol";

/// @notice What the game server reports when an activity session ends.
struct SessionSettlement {
    bytes32 sessionId; // keccak256 of the Mongo activitySession id
    uint256 tokenId;
    address player; // wallet that ran the activity session
    uint32 activeMinutes; // validated by the API
    uint32 distanceMeters; // validated by the API, recorded in the event
}

/// @title SneakerGame
/// @notice The game rules: starter Sneakers, activity-session settlement, repair and
/// upgrade. Holds `GAME_ROLE` on `SneakerNft` and `MINTER_ROLE`/`BURNER_ROLE` on
/// `StrideToken`; replace the rules by deploying a new `SneakerGame` and moving the roles.
contract SneakerGame is AccessControl, Pausable, ReentrancyGuardTransient {
    bytes32 public constant GAME_SERVER_ROLE = keccak256("GAME_SERVER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint16 public constant STARTER_LEVEL = 1;

    SneakerNft public immutable sneakerNft;
    StrideToken public immutable strideToken;

    GameConfig private gameConfig;

    /// @notice Whether an activity session has already been settled.
    mapping(bytes32 sessionId => bool isSettled) public isSessionSettled;

    /// @notice Whether a wallet has received its one starter Sneaker.
    mapping(address player => bool hasClaimed) public hasClaimedStarterSneaker;

    /// @notice Emitted when an activity session pays out.
    event SessionSettled(
        bytes32 indexed sessionId,
        uint256 indexed tokenId,
        address indexed player,
        uint16 rewardedMinutes,
        uint32 distanceMeters,
        uint256 rewardAmountWei,
        uint16 durabilityLoss
    );

    /// @notice Emitted when a Sneaker is repaired to full durability.
    event SneakerRepaired(
        uint256 indexed tokenId,
        address indexed owner,
        uint16 durabilityRestored,
        uint256 repairCostWei
    );

    /// @notice Emitted when a Sneaker gains a level.
    event SneakerUpgraded(
        uint256 indexed tokenId,
        address indexed owner,
        uint16 newLevel,
        uint16 newEfficiency,
        uint256 upgradeCostWei
    );

    /// @notice Emitted whenever the game config is set, including at deployment.
    event GameConfigUpdated(GameConfig config);

    error SessionAlreadySettled(bytes32 sessionId);
    error NotSneakerOwner(uint256 tokenId, address caller);
    error SneakerAtMaxLevel(uint256 tokenId);
    error StarterSneakerAlreadyClaimed(address player);
    error NothingToRepair(uint256 tokenId);
    error InvalidGameConfig();

    /// @param admin Receives `DEFAULT_ADMIN_ROLE`.
    /// @param sneakerNftAddress The Sneaker NFT this game grants `GAME_ROLE` access to.
    /// @param strideTokenAddress The reward token this game mints and burns.
    /// @param initialGameConfig The starting rules.
    constructor(
        address admin,
        SneakerNft sneakerNftAddress,
        StrideToken strideTokenAddress,
        GameConfig memory initialGameConfig
    ) {
        sneakerNft = sneakerNftAddress;
        strideToken = strideTokenAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        applyGameConfig(initialGameConfig);
    }

    /// @notice Mints a wallet's one starter Sneaker at full energy and durability.
    /// @param player The wallet to receive it.
    /// @return tokenId The new Sneaker's id.
    function mintStarterSneaker(address player)
        external
        nonReentrant
        onlyRole(GAME_SERVER_ROLE)
        whenNotPaused
        returns (uint256 tokenId)
    {
        if (hasClaimedStarterSneaker[player]) {
            revert StarterSneakerAlreadyClaimed(player);
        }
        hasClaimedStarterSneaker[player] = true;
        SneakerAttributes memory starterAttributes = SneakerAttributes({
            level: STARTER_LEVEL,
            efficiency: gameConfig.starterEfficiency,
            durability: gameConfig.maxDurability,
            storedEnergy: gameConfig.maxEnergy,
            energyUpdatedAt: readCurrentTimestamp()
        });
        return sneakerNft.mint(player, starterAttributes);
    }

    /// @notice Pays out a validated activity session: spends energy, wears durability
    /// and mints the reward. Each `sessionId` settles at most once.
    /// @param settlement The API's validated summary of the activity session.
    function settleSession(SessionSettlement calldata settlement)
        external
        nonReentrant
        onlyRole(GAME_SERVER_ROLE)
        whenNotPaused
    {
        if (isSessionSettled[settlement.sessionId]) {
            revert SessionAlreadySettled(settlement.sessionId);
        }
        isSessionSettled[settlement.sessionId] = true;
        // A Sneaker transferred mid-run doesn't pay out.
        if (sneakerNft.ownerOf(settlement.tokenId) != settlement.player) {
            revert NotSneakerOwner(settlement.tokenId, settlement.player);
        }

        SessionOutcome memory outcome =
            calculateSessionOutcome(settlement.tokenId, settlement.activeMinutes);
        emit SessionSettled(
            settlement.sessionId,
            settlement.tokenId,
            settlement.player,
            outcome.rewardedMinutes,
            settlement.distanceMeters,
            outcome.rewardAmountWei,
            outcome.durabilityLoss
        );

        sneakerNft.setAttributes(settlement.tokenId, outcome.attributesAfterSession);
        if (outcome.rewardAmountWei > 0) {
            strideToken.mint(settlement.player, outcome.rewardAmountWei);
        }
    }

    /// @notice Restores a Sneaker to max durability, burning `quoteRepairCost` from the caller.
    /// @param tokenId The caller's Sneaker.
    function repair(uint256 tokenId) external nonReentrant whenNotPaused {
        SneakerAttributes memory attributes = readOwnedSneakerAttributes(tokenId);
        if (attributes.durability >= gameConfig.maxDurability) revert NothingToRepair(tokenId);

        uint256 repairCostWei =
            GameMath.calculateRepairCost(attributes.level, attributes.durability, gameConfig);
        uint16 durabilityRestored = gameConfig.maxDurability - attributes.durability;
        attributes.durability = gameConfig.maxDurability;
        emit SneakerRepaired(tokenId, msg.sender, durabilityRestored, repairCostWei);

        sneakerNft.setAttributes(tokenId, attributes);
        strideToken.burnFrom(msg.sender, repairCostWei);
    }

    /// @notice Raises a Sneaker one level and adds efficiency, burning `quoteUpgradeCost`
    /// from the caller. Durability is unchanged.
    /// @param tokenId The caller's Sneaker.
    function upgrade(uint256 tokenId) external nonReentrant whenNotPaused {
        SneakerAttributes memory attributes = readOwnedSneakerAttributes(tokenId);
        if (attributes.level >= gameConfig.maxLevel) revert SneakerAtMaxLevel(tokenId);

        uint256 upgradeCostWei = GameMath.calculateUpgradeCost(attributes.level, gameConfig);
        attributes.level += 1;
        attributes.efficiency += gameConfig.efficiencyGainPerLevel;
        emit SneakerUpgraded(
            tokenId, msg.sender, attributes.level, attributes.efficiency, upgradeCostWei
        );

        sneakerNft.setAttributes(tokenId, attributes);
        strideToken.burnFrom(msg.sender, upgradeCostWei);
    }

    /// @notice Replaces the game config.
    /// @param newGameConfig The new rules.
    function setGameConfig(GameConfig calldata newGameConfig)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        applyGameConfig(newGameConfig);
    }

    /// @notice Stops starter mints, settlement, repair and upgrade.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resumes the game.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice The rules in force.
    /// @return The current game config.
    function getGameConfig() external view returns (GameConfig memory) {
        return gameConfig;
    }

    /// @notice Energy available now, with regeneration applied.
    /// @param tokenId The Sneaker to read.
    /// @return The current energy.
    function currentEnergy(uint256 tokenId) external view returns (uint16) {
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        return GameMath.calculateCurrentEnergy(
            attributes.storedEnergy, attributes.energyUpdatedAt, readCurrentTimestamp(), gameConfig
        );
    }

    /// @notice STRIDE that `repair` would burn now. 0 at full durability.
    /// @param tokenId The Sneaker to quote.
    /// @return repairCostWei The repair cost.
    function quoteRepairCost(uint256 tokenId) external view returns (uint256 repairCostWei) {
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        return GameMath.calculateRepairCost(attributes.level, attributes.durability, gameConfig);
    }

    /// @notice STRIDE that `upgrade` would burn now. Reverts at max level.
    /// @param tokenId The Sneaker to quote.
    /// @return upgradeCostWei The upgrade cost.
    function quoteUpgradeCost(uint256 tokenId) external view returns (uint256 upgradeCostWei) {
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        if (attributes.level >= gameConfig.maxLevel) revert SneakerAtMaxLevel(tokenId);
        return GameMath.calculateUpgradeCost(attributes.level, gameConfig);
    }

    /// @notice What `settleSession` would pay and cost right now, without side effects.
    /// @param tokenId The Sneaker to preview.
    /// @param activeMinutes Validated active minutes.
    /// @return rewardAmountWei STRIDE the activity session would mint.
    /// @return durabilityLoss Durability it would cost.
    /// @return rewardedMinutes Active minutes that would earn, after the energy cap.
    function previewSessionReward(uint256 tokenId, uint32 activeMinutes)
        external
        view
        returns (uint256 rewardAmountWei, uint16 durabilityLoss, uint16 rewardedMinutes)
    {
        SessionOutcome memory outcome = calculateSessionOutcome(tokenId, activeMinutes);
        return (outcome.rewardAmountWei, outcome.durabilityLoss, outcome.rewardedMinutes);
    }

    struct SessionOutcome {
        uint16 rewardedMinutes;
        uint256 rewardAmountWei;
        uint16 durabilityLoss;
        SneakerAttributes attributesAfterSession;
    }

    /// @dev The one implementation behind both `settleSession` and `previewSessionReward`.
    function calculateSessionOutcome(uint256 tokenId, uint32 activeMinutes)
        private
        view
        returns (SessionOutcome memory outcome)
    {
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        uint64 currentTimestamp = readCurrentTimestamp();
        uint16 energyNow = GameMath.calculateCurrentEnergy(
            attributes.storedEnergy, attributes.energyUpdatedAt, currentTimestamp, gameConfig
        );

        outcome.rewardedMinutes = GameMath.calculateRewardedMinutes(activeMinutes, energyNow);
        outcome.rewardAmountWei = GameMath.calculateSessionReward(
            outcome.rewardedMinutes, attributes.efficiency, gameConfig
        );
        outcome.durabilityLoss = GameMath.calculateDurabilityLoss(
            outcome.rewardedMinutes, attributes.durability, gameConfig
        );

        (uint16 storedEnergyAfterSession, uint64 energyUpdatedAtAfterSession) = GameMath.calculateEnergyAfterSpending(
            attributes.storedEnergy,
            attributes.energyUpdatedAt,
            currentTimestamp,
            outcome.rewardedMinutes,
            gameConfig
        );
        attributes.storedEnergy = storedEnergyAfterSession;
        attributes.energyUpdatedAt = energyUpdatedAtAfterSession;
        attributes.durability -= outcome.durabilityLoss;
        outcome.attributesAfterSession = attributes;
    }

    function readOwnedSneakerAttributes(uint256 tokenId)
        private
        view
        returns (SneakerAttributes memory)
    {
        if (sneakerNft.ownerOf(tokenId) != msg.sender) {
            revert NotSneakerOwner(tokenId, msg.sender);
        }
        return sneakerNft.getAttributes(tokenId);
    }

    function readCurrentTimestamp() private view returns (uint64) {
        // casting to 'uint64' is safe because seconds since 1970 fit in 64 bits for ~584 billion years
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint64(block.timestamp);
    }

    function applyGameConfig(GameConfig memory newGameConfig) private {
        if (!isPlayableGameConfig(newGameConfig)) revert InvalidGameConfig();
        gameConfig = newGameConfig;
        emit GameConfigUpdated(newGameConfig);
    }

    function isPlayableGameConfig(GameConfig memory candidateGameConfig)
        private
        pure
        returns (bool)
    {
        return candidateGameConfig.energyRegenerationSeconds != 0
            && candidateGameConfig.maxEnergy != 0 && candidateGameConfig.maxDurability != 0
            && candidateGameConfig.starterEfficiency != 0
            && candidateGameConfig.maxLevel >= STARTER_LEVEL;
    }
}
