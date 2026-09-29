// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {DeployGame} from "../../script/DeployGame.s.sol";
import {GameConfig} from "../../src/libraries/GameMath.sol";
import {SessionSettlement, SneakerGame} from "../../src/SneakerGame.sol";
import {SneakerAttributes, SneakerNft} from "../../src/SneakerNft.sol";
import {SoleToken} from "../../src/SoleToken.sol";

/// @notice Deploys the game through the real `DeployGame` script, so every test runs
/// against production role wiring and the initial game config.
abstract contract GameTestBase is Test {
    uint256 internal constant DEPLOYER_PRIVATE_KEY = 0xA11CE;
    uint256 internal constant REALISTIC_START_TIMESTAMP = 1_790_000_000;
    uint256 internal constant ONE_SOLE_WEI = 1e18;

    address internal deployer = vm.addr(DEPLOYER_PRIVATE_KEY);
    address internal gameServer = makeAddr("gameServer");
    address internal player = makeAddr("player");
    address internal otherPlayer = makeAddr("otherPlayer");

    SneakerNft internal sneakerNft;
    SoleToken internal soleToken;
    SneakerGame internal sneakerGame;
    GameConfig internal gameConfig;

    uint256 private sessionCounter;

    function setUp() public virtual {
        vm.warp(REALISTIC_START_TIMESTAMP);
        vm.setEnv("DEPLOYER_PRIVATE_KEY", vm.toString(DEPLOYER_PRIVATE_KEY));
        vm.setEnv("GAME_SERVER_ADDRESS", vm.toString(gameServer));

        DeployGame.GameDeployment memory deployment = new DeployGame().run();
        sneakerNft = deployment.sneakerNft;
        soleToken = deployment.soleToken;
        sneakerGame = deployment.sneakerGame;
        gameConfig = sneakerGame.getGameConfig();
    }

    function mintStarterSneakerFor(address walletAddress) internal returns (uint256 tokenId) {
        vm.prank(gameServer);
        return sneakerGame.mintStarterSneaker(walletAddress);
    }

    function settleActivitySession(uint256 tokenId, address walletAddress, uint32 activeMinutes)
        internal
        returns (bytes32 sessionId)
    {
        sessionId = buildNextSessionId();
        vm.prank(gameServer);
        sneakerGame.settleSession(
            buildSessionSettlement(sessionId, tokenId, walletAddress, activeMinutes)
        );
    }

    function buildSessionSettlement(
        bytes32 sessionId,
        uint256 tokenId,
        address walletAddress,
        uint32 activeMinutes
    ) internal pure returns (SessionSettlement memory) {
        return SessionSettlement({
            sessionId: sessionId,
            tokenId: tokenId,
            player: walletAddress,
            activeMinutes: activeMinutes,
            // Distance doesn't change the reward; roughly a 5 km/h walk.
            distanceMeters: activeMinutes * 83
        });
    }

    function buildNextSessionId() internal returns (bytes32) {
        sessionCounter++;
        return keccak256(abi.encode("activity-session", sessionCounter));
    }

    function readAttributes(uint256 tokenId) internal view returns (SneakerAttributes memory) {
        return sneakerNft.getAttributes(tokenId);
    }

    /// @dev Mints SOLE through a real minter so totalSupply stays consistent.
    function fundWithSole(address walletAddress, uint256 amountWei) internal {
        bytes32 minterRole = soleToken.MINTER_ROLE();
        vm.prank(deployer);
        soleToken.grantRole(minterRole, address(this));
        soleToken.mint(walletAddress, amountWei);
    }
}
