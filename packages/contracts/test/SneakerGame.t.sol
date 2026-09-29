// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {SessionSettlement, SneakerGame} from "../src/SneakerGame.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

/// @notice Starter mints, settlement, views, config and pausing. Repair and upgrade live in
/// SneakerGameRepairUpgrade.t.sol.
contract SneakerGameTest is GameTestBase {
    // ---------------------------------------------------------------------------------
    // Deployment
    // ---------------------------------------------------------------------------------

    function test_ConstructorStoresConfigAndEmitsGameConfigUpdated() public {
        vm.expectEmit();
        emit SneakerGame.GameConfigUpdated(gameConfig);
        SneakerGame newSneakerGame = new SneakerGame(deployer, sneakerNft, soleToken, gameConfig);

        assertEq(abi.encode(newSneakerGame.getGameConfig()), abi.encode(gameConfig));
        assertEq(address(newSneakerGame.sneakerNft()), address(sneakerNft));
        assertEq(address(newSneakerGame.soleToken()), address(soleToken));
        assertTrue(newSneakerGame.hasRole(newSneakerGame.DEFAULT_ADMIN_ROLE(), deployer));
    }

    function test_RevertWhen_ConstructedWithInvalidConfig() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.energyRegenerationSeconds = 0;

        vm.expectRevert(SneakerGame.InvalidGameConfig.selector);
        new SneakerGame(deployer, sneakerNft, soleToken, invalidGameConfig);
    }

    // ---------------------------------------------------------------------------------
    // mintStarterSneaker
    // ---------------------------------------------------------------------------------

    function test_MintStarterSneakerMintsFullStarterStats() public {
        uint256 tokenId = mintStarterSneakerFor(player);

        SneakerAttributes memory attributes = readAttributes(tokenId);
        assertEq(sneakerNft.ownerOf(tokenId), player);
        assertEq(attributes.level, 1);
        assertEq(attributes.efficiency, 10);
        assertEq(attributes.durability, 100);
        assertEq(attributes.storedEnergy, 10);
        assertEq(attributes.energyUpdatedAt, block.timestamp);
        assertTrue(sneakerGame.hasClaimedStarterSneaker(player));
        assertEq(sneakerGame.currentEnergy(tokenId), 10);
    }

    function test_RevertWhen_StarterSneakerClaimedTwice() public {
        mintStarterSneakerFor(player);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.StarterSneakerAlreadyClaimed.selector, player)
        );
        vm.prank(gameServer);
        sneakerGame.mintStarterSneaker(player);
    }

    function test_RevertWhen_MintStarterSneakerCalledByNonGameServer() public {
        expectUnauthorized(player, sneakerGame.GAME_SERVER_ROLE());
        vm.prank(player);
        sneakerGame.mintStarterSneaker(player);
    }

    function test_RevertWhen_MintStarterSneakerWhilePaused() public {
        pauseGame();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(gameServer);
        sneakerGame.mintStarterSneaker(player);
    }

    // ---------------------------------------------------------------------------------
    // settleSession
    // ---------------------------------------------------------------------------------

    function test_SettleSessionPaysTheMvpExample() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        bytes32 sessionId = buildNextSessionId();

        vm.expectEmit(address(sneakerGame));
        emit SneakerGame.SessionSettled(sessionId, tokenId, player, 10, 830, 50 * ONE_SOLE_WEI, 3);
        vm.prank(gameServer);
        sneakerGame.settleSession(buildSessionSettlement(sessionId, tokenId, player, 10));

        SneakerAttributes memory attributes = readAttributes(tokenId);
        assertEq(soleToken.balanceOf(player), 50 * ONE_SOLE_WEI);
        assertEq(attributes.durability, 97);
        assertEq(attributes.storedEnergy, 0);
        assertEq(sneakerGame.currentEnergy(tokenId), 0);
        assertTrue(sneakerGame.isSessionSettled(sessionId));
    }

    function test_SettleSessionCapsRewardedMinutesAtCurrentEnergy() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        settleActivitySession(tokenId, player, 6);

        settleActivitySession(tokenId, player, 25);

        assertEq(soleToken.balanceOf(player), 50 * ONE_SOLE_WEI, "6 + 4 minutes at efficiency 10");
        assertEq(sneakerGame.currentEnergy(tokenId), 0);
    }

    function test_SettleSessionWithNoEnergyMintsNothingButIsStillSettled() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        settleActivitySession(tokenId, player, 10);
        uint256 supplyBefore = soleToken.totalSupply();

        bytes32 sessionId = settleActivitySession(tokenId, player, 10);

        assertEq(soleToken.totalSupply(), supplyBefore);
        assertEq(readAttributes(tokenId).durability, 97);
        assertTrue(sneakerGame.isSessionSettled(sessionId));
    }

    function test_EnergyRegeneratesAfterSettlementWithoutLosingPartialProgress() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        skip(20 minutes);
        settleActivitySession(tokenId, player, 10);

        skip(10 minutes);

        assertEq(sneakerGame.currentEnergy(tokenId), 1, "20 + 10 minutes is one interval");
    }

    function test_RevertWhen_SessionIsSettledTwice() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        bytes32 sessionId = settleActivitySession(tokenId, player, 5);
        SessionSettlement memory replayedSettlement =
            buildSessionSettlement(sessionId, tokenId, player, 5);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.SessionAlreadySettled.selector, sessionId)
        );
        vm.prank(gameServer);
        sneakerGame.settleSession(replayedSettlement);
    }

    function test_RevertWhen_SneakerTransferredMidSession() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        vm.prank(player);
        sneakerNft.transferFrom(player, otherPlayer, tokenId);
        SessionSettlement memory settlement =
            buildSessionSettlement(buildNextSessionId(), tokenId, player, 10);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.NotSneakerOwner.selector, tokenId, player)
        );
        vm.prank(gameServer);
        sneakerGame.settleSession(settlement);
    }

    function test_RevertWhen_SettlingANonexistentSneaker() public {
        SessionSettlement memory settlement =
            buildSessionSettlement(buildNextSessionId(), 42, player, 10);

        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 42));
        vm.prank(gameServer);
        sneakerGame.settleSession(settlement);
    }

    function test_RevertWhen_SettleSessionCalledByNonGameServer() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        SessionSettlement memory settlement =
            buildSessionSettlement(buildNextSessionId(), tokenId, player, 10);

        expectUnauthorized(player, sneakerGame.GAME_SERVER_ROLE());
        vm.prank(player);
        sneakerGame.settleSession(settlement);
    }

    function test_RevertWhen_SettleSessionWhilePaused() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        SessionSettlement memory settlement =
            buildSessionSettlement(buildNextSessionId(), tokenId, player, 10);
        pauseGame();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(gameServer);
        sneakerGame.settleSession(settlement);
    }

    function test_PreviewSessionRewardMatchesSettlement() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        (uint256 previewRewardWei, uint16 previewDurabilityLoss, uint16 previewRewardedMinutes) =
            sneakerGame.previewSessionReward(tokenId, 7);
        uint16 durabilityBefore = readAttributes(tokenId).durability;

        settleActivitySession(tokenId, player, 7);

        assertEq(previewRewardWei, 35 * ONE_SOLE_WEI);
        assertEq(previewRewardedMinutes, 7);
        assertEq(soleToken.balanceOf(player), previewRewardWei);
        assertEq(durabilityBefore - readAttributes(tokenId).durability, previewDurabilityLoss);
    }

    // ---------------------------------------------------------------------------------
    // currentEnergy
    // ---------------------------------------------------------------------------------

    function test_CurrentEnergyRegeneratesUpToMaxEnergy() public {
        uint256 tokenId = mintStarterSneakerFor(player);
        settleActivitySession(tokenId, player, 10);

        skip(3 * 30 minutes);
        assertEq(sneakerGame.currentEnergy(tokenId), 3);

        skip(100 * 30 minutes);
        assertEq(sneakerGame.currentEnergy(tokenId), 10);
    }

    // ---------------------------------------------------------------------------------
    // setGameConfig
    // ---------------------------------------------------------------------------------

    function test_AdminUpdatesGameConfig() public {
        GameConfig memory newGameConfig = gameConfig;
        newGameConfig.energyRegenerationSeconds = 5 minutes;

        vm.expectEmit(address(sneakerGame));
        emit SneakerGame.GameConfigUpdated(newGameConfig);
        vm.prank(deployer);
        sneakerGame.setGameConfig(newGameConfig);

        assertEq(abi.encode(sneakerGame.getGameConfig()), abi.encode(newGameConfig));
    }

    function test_RevertWhen_SetGameConfigCalledByNonAdmin() public {
        expectUnauthorized(gameServer, sneakerGame.DEFAULT_ADMIN_ROLE());
        vm.prank(gameServer);
        sneakerGame.setGameConfig(gameConfig);
    }

    function test_RevertWhen_ConfigHasZeroEnergyRegenerationSeconds() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.energyRegenerationSeconds = 0;
        expectInvalidGameConfig(invalidGameConfig);
    }

    function test_RevertWhen_ConfigHasZeroMaxEnergy() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.maxEnergy = 0;
        expectInvalidGameConfig(invalidGameConfig);
    }

    function test_RevertWhen_ConfigHasZeroMaxDurability() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.maxDurability = 0;
        expectInvalidGameConfig(invalidGameConfig);
    }

    function test_RevertWhen_ConfigHasZeroStarterEfficiency() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.starterEfficiency = 0;
        expectInvalidGameConfig(invalidGameConfig);
    }

    function test_RevertWhen_ConfigMaxLevelIsBelowStarterLevel() public {
        GameConfig memory invalidGameConfig = gameConfig;
        invalidGameConfig.maxLevel = 0;
        expectInvalidGameConfig(invalidGameConfig);
    }

    // ---------------------------------------------------------------------------------
    // pause / unpause
    // ---------------------------------------------------------------------------------

    function test_PauserPausesAndUnpauses() public {
        pauseGame();
        assertTrue(sneakerGame.paused());

        vm.prank(deployer);
        sneakerGame.unpause();

        assertFalse(sneakerGame.paused());
        mintStarterSneakerFor(player);
    }

    function test_RevertWhen_PauseCalledByNonPauser() public {
        expectUnauthorized(gameServer, sneakerGame.PAUSER_ROLE());
        vm.prank(gameServer);
        sneakerGame.pause();
    }

    function test_RevertWhen_UnpauseCalledByNonPauser() public {
        pauseGame();

        expectUnauthorized(gameServer, sneakerGame.PAUSER_ROLE());
        vm.prank(gameServer);
        sneakerGame.unpause();
    }

    function pauseGame() private {
        vm.prank(deployer);
        sneakerGame.pause();
    }

    function expectUnauthorized(address caller, bytes32 neededRole) private {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, caller, neededRole
            )
        );
    }

    function expectInvalidGameConfig(GameConfig memory invalidGameConfig) private {
        vm.expectRevert(SneakerGame.InvalidGameConfig.selector);
        vm.prank(deployer);
        sneakerGame.setGameConfig(invalidGameConfig);
    }
}
