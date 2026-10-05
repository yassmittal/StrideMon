// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {GameConfig, GameMath} from "../../src/libraries/GameMath.sol";
import {SessionSettlement, SneakerGame} from "../../src/SneakerGame.sol";
import {SneakerAttributes, SneakerNft} from "../../src/SneakerNft.sol";
import {SoleToken} from "../../src/SoleToken.sol";

/// @notice Drives random starter mints, settlements, repairs, upgrades, Sneaker transfers
/// and time jumps. Expected rewards and costs come from `GameMath` directly, not from the
/// contract's own quote functions, so the ghosts are an independent ledger.
contract SoleSupplyHandler is Test {
    uint256 private constant MAX_SECONDS_PER_WARP = 6 hours;
    uint32 private constant MAX_ACTIVE_MINUTES = 240;

    SneakerGame private immutable sneakerGame;
    SneakerNft private immutable sneakerNft;
    SoleToken private immutable soleToken;
    address private immutable gameServer;

    address[] public actors;
    uint256[] public tokenIds;

    uint256 public ghostMintedRewardWei;
    uint256 public ghostBurnedCostWei;
    bool public hasBurnedFromNonCaller;

    uint256 private sessionCounter;

    constructor(SneakerGame sneakerGameAddress, address gameServerAddress) {
        sneakerGame = sneakerGameAddress;
        sneakerNft = sneakerGameAddress.sneakerNft();
        soleToken = sneakerGameAddress.soleToken();
        gameServer = gameServerAddress;
        for (uint256 actorIndex; actorIndex < 4; actorIndex++) {
            actors.push(makeAddr(string.concat("actor", vm.toString(actorIndex))));
        }
    }

    function actorCount() external view returns (uint256) {
        return actors.length;
    }

    function tokenCount() external view returns (uint256) {
        return tokenIds.length;
    }

    function mintStarterSneaker(uint256 actorSeed) external {
        address actor = pickActor(actorSeed);
        if (sneakerGame.hasClaimedStarterSneaker(actor)) return;
        vm.prank(gameServer);
        tokenIds.push(sneakerGame.mintStarterSneaker(actor));
    }

    function settleSession(
        uint256 tokenSeed,
        uint256 playerSeed,
        uint32 activeMinutes,
        bool shouldUseOwner
    ) external {
        if (tokenIds.length == 0) return;
        uint256 tokenId = pickTokenId(tokenSeed);
        address owner = sneakerNft.ownerOf(tokenId);
        address reportedPlayer = shouldUseOwner ? owner : pickActor(playerSeed);
        activeMinutes = uint32(bound(activeMinutes, 0, MAX_ACTIVE_MINUTES));
        uint256 expectedRewardWei = calculateExpectedRewardWei(tokenId, activeMinutes);
        SessionSettlement memory settlement = SessionSettlement({
            sessionId: keccak256(abi.encode("invariant-session", ++sessionCounter)),
            tokenId: tokenId,
            player: reportedPlayer,
            activeMinutes: activeMinutes,
            distanceMeters: activeMinutes * 83
        });

        vm.prank(gameServer);
        try sneakerGame.settleSession(settlement) {
            assertEq(reportedPlayer, owner, "settled for a wallet that doesn't own the Sneaker");
            ghostMintedRewardWei += expectedRewardWei;
        } catch {
            assertTrue(reportedPlayer != owner, "settlement for the owner reverted");
        }
    }

    function repair(uint256 actorSeed, uint256 tokenSeed) external {
        if (tokenIds.length == 0) return;
        address caller = pickActor(actorSeed);
        uint256 tokenId = pickTokenId(tokenSeed);
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        uint256 expectedCostWei = GameMath.calculateRepairCost(
            attributes.level, attributes.durability, sneakerGame.getGameConfig()
        );
        uint256[] memory balancesBefore = readActorBalances();

        vm.prank(caller);
        try sneakerGame.repair(tokenId) {
            ghostBurnedCostWei += expectedCostWei;
        } catch {}

        recordBurnsFromNonCallers(caller, balancesBefore);
    }

    function upgrade(uint256 actorSeed, uint256 tokenSeed) external {
        if (tokenIds.length == 0) return;
        address caller = pickActor(actorSeed);
        uint256 tokenId = pickTokenId(tokenSeed);
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        uint256 expectedCostWei =
            GameMath.calculateUpgradeCost(attributes.level, sneakerGame.getGameConfig());
        uint256[] memory balancesBefore = readActorBalances();

        vm.prank(caller);
        try sneakerGame.upgrade(tokenId) {
            ghostBurnedCostWei += expectedCostWei;
        } catch {}

        recordBurnsFromNonCallers(caller, balancesBefore);
    }

    function transferSneaker(uint256 tokenSeed, uint256 recipientSeed) external {
        if (tokenIds.length == 0) return;
        uint256 tokenId = pickTokenId(tokenSeed);
        address owner = sneakerNft.ownerOf(tokenId);
        vm.prank(owner);
        sneakerNft.transferFrom(owner, pickActor(recipientSeed), tokenId);
    }

    function warp(uint256 secondsToAdvance) external {
        skip(bound(secondsToAdvance, 1, MAX_SECONDS_PER_WARP));
    }

    function calculateExpectedRewardWei(uint256 tokenId, uint32 activeMinutes)
        private
        view
        returns (uint256)
    {
        GameConfig memory gameConfig = sneakerGame.getGameConfig();
        SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
        uint16 energyNow = GameMath.calculateCurrentEnergy(
            attributes.storedEnergy, attributes.energyUpdatedAt, uint64(block.timestamp), gameConfig
        );
        uint16 rewardedMinutes = GameMath.calculateRewardedMinutes(activeMinutes, energyNow);
        return GameMath.calculateSessionReward(rewardedMinutes, attributes.efficiency, gameConfig);
    }

    function readActorBalances() private view returns (uint256[] memory balances) {
        balances = new uint256[](actors.length);
        for (uint256 actorIndex; actorIndex < actors.length; actorIndex++) {
            balances[actorIndex] = soleToken.balanceOf(actors[actorIndex]);
        }
    }

    function recordBurnsFromNonCallers(address caller, uint256[] memory balancesBefore) private {
        for (uint256 actorIndex; actorIndex < actors.length; actorIndex++) {
            address actor = actors[actorIndex];
            if (actor == caller) continue;
            if (soleToken.balanceOf(actor) != balancesBefore[actorIndex]) {
                hasBurnedFromNonCaller = true;
            }
        }
    }

    function pickActor(uint256 seed) private view returns (address) {
        return actors[seed % actors.length];
    }

    function pickTokenId(uint256 seed) private view returns (uint256) {
        return tokenIds[seed % tokenIds.length];
    }
}
