// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {DeployFoundingPass} from "../../script/DeployFoundingPass.s.sol";
import {DeployGame} from "../../script/DeployGame.s.sol";
import {FoundingPass} from "../../src/FoundingPass.sol";
import {GameConfig} from "../../src/libraries/GameMath.sol";
import {SessionSettlement, SneakerGame} from "../../src/SneakerGame.sol";
import {SneakerAttributes, SneakerNft} from "../../src/SneakerNft.sol";
import {StrideToken} from "../../src/StrideToken.sol";

/// @notice Deploys the Founding Pass and the game through the real `DeployFoundingPass` and
/// `DeployGame` scripts, in the testnet order, so every test runs against production role
/// wiring and the initial game config.
abstract contract GameTestBase is Test {
    uint256 internal constant DEPLOYER_PRIVATE_KEY = 0xA11CE;
    uint256 internal constant REALISTIC_START_TIMESTAMP = 1_790_000_000;
    uint256 internal constant ONE_STRIDE_WEI = 1e18;

    address internal deployer = vm.addr(DEPLOYER_PRIVATE_KEY);
    address internal gameServer = makeAddr("gameServer");
    address internal player = makeAddr("player");
    address internal otherPlayer = makeAddr("otherPlayer");

    SneakerNft internal sneakerNft;
    StrideToken internal strideToken;
    SneakerGame internal sneakerGame;
    FoundingPass internal foundingPass;
    GameConfig internal gameConfig;

    uint256 private sessionCounter;

    function setUp() public virtual {
        vm.warp(REALISTIC_START_TIMESTAMP);
        vm.setEnv("DEPLOYER_PRIVATE_KEY", vm.toString(DEPLOYER_PRIVATE_KEY));
        vm.setEnv("GAME_SERVER_ADDRESS", vm.toString(gameServer));

        foundingPass = new DeployFoundingPass().run().foundingPass;
        vm.setEnv("FOUNDING_PASS_ADDRESS", vm.toString(address(foundingPass)));
        DeployGame.GameDeployment memory deployment = new DeployGame().run();
        sneakerNft = deployment.sneakerNft;
        strideToken = deployment.strideToken;
        sneakerGame = deployment.sneakerGame;
        gameConfig = sneakerGame.getGameConfig();
    }

    function mintStarterSneakerFor(address walletAddress) internal returns (uint256 tokenId) {
        vm.prank(gameServer);
        return sneakerGame.mintStarterSneaker(walletAddress);
    }

    /// @dev As the API will: the game server holds `MINTER_ROLE` on the pass.
    function mintFoundingPassFor(address walletAddress, uint256 designNumber) internal {
        vm.prank(gameServer);
        foundingPass.mint(walletAddress, designNumber);
    }

    function mintFounderSneakerFor(uint256 foundingPassTokenId) internal returns (uint256 tokenId) {
        vm.prank(gameServer);
        return sneakerGame.mintFounderSneaker(foundingPassTokenId);
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

    /// @dev Mints STRIDE through a real minter so totalSupply stays consistent.
    function fundWithStride(address walletAddress, uint256 amountWei) internal {
        bytes32 minterRole = strideToken.MINTER_ROLE();
        vm.prank(deployer);
        strideToken.grantRole(minterRole, address(this));
        strideToken.mint(walletAddress, amountWei);
    }
}
