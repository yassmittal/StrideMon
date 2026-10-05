// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

contract SneakerGameRepairUpgradeTest is GameTestBase {
    uint256 private playerTokenId;

    function setUp() public override {
        super.setUp();
        playerTokenId = mintStarterSneakerFor(player);
    }

    // ---------------------------------------------------------------------------------
    // repair
    // ---------------------------------------------------------------------------------

    function test_RepairRestoresMaxDurabilityAndBurnsTheQuote() public {
        settleActivitySession(playerTokenId, player, 10);
        uint256 quotedCostWei = sneakerGame.quoteRepairCost(playerTokenId);
        uint256 balanceBefore = soleToken.balanceOf(player);

        vm.expectEmit(address(sneakerGame));
        emit SneakerGame.SneakerRepaired(playerTokenId, player, 3, quotedCostWei);
        vm.prank(player);
        sneakerGame.repair(playerTokenId);

        assertEq(quotedCostWei, (21 * ONE_SOLE_WEI) / 10, "3 points at 0.7 SOLE");
        assertEq(readAttributes(playerTokenId).durability, 100);
        assertEq(soleToken.balanceOf(player), balanceBefore - quotedCostWei);
        assertEq(sneakerGame.quoteRepairCost(playerTokenId), 0);
    }

    function test_RepairKeepsLevelEfficiencyAndEnergy() public {
        settleActivitySession(playerTokenId, player, 4);
        SneakerAttributes memory attributesBefore = readAttributes(playerTokenId);

        vm.prank(player);
        sneakerGame.repair(playerTokenId);

        SneakerAttributes memory attributesAfter = readAttributes(playerTokenId);
        assertEq(attributesAfter.level, attributesBefore.level);
        assertEq(attributesAfter.efficiency, attributesBefore.efficiency);
        assertEq(attributesAfter.storedEnergy, attributesBefore.storedEnergy);
        assertEq(attributesAfter.energyUpdatedAt, attributesBefore.energyUpdatedAt);
    }

    function test_RevertWhen_RepairingAFullDurabilitySneaker() public {
        vm.expectRevert(abi.encodeWithSelector(SneakerGame.NothingToRepair.selector, playerTokenId));
        vm.prank(player);
        sneakerGame.repair(playerTokenId);
    }

    function test_RevertWhen_RepairCalledByNonOwner() public {
        settleActivitySession(playerTokenId, player, 10);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.NotSneakerOwner.selector, playerTokenId, otherPlayer)
        );
        vm.prank(otherPlayer);
        sneakerGame.repair(playerTokenId);
    }

    function test_RevertWhen_RepairCostExceedsBalance() public {
        settleActivitySession(playerTokenId, player, 10);
        uint256 balanceWei = soleToken.balanceOf(player);
        vm.prank(player);
        soleToken.transfer(otherPlayer, balanceWei);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                player,
                0,
                sneakerGame.quoteRepairCost(playerTokenId)
            )
        );
        vm.prank(player);
        sneakerGame.repair(playerTokenId);
    }

    function test_RevertWhen_RepairWhilePaused() public {
        settleActivitySession(playerTokenId, player, 10);
        pauseGame();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(player);
        sneakerGame.repair(playerTokenId);
    }

    function test_RepairBurnsOnlyFromTheCaller() public {
        uint256 otherTokenId = mintStarterSneakerFor(otherPlayer);
        settleActivitySession(playerTokenId, player, 10);
        settleActivitySession(otherTokenId, otherPlayer, 10);
        uint256 otherBalanceBefore = soleToken.balanceOf(otherPlayer);

        vm.prank(player);
        sneakerGame.repair(playerTokenId);

        assertEq(soleToken.balanceOf(otherPlayer), otherBalanceBefore);
    }

    // ---------------------------------------------------------------------------------
    // upgrade
    // ---------------------------------------------------------------------------------

    function test_UpgradeRaisesLevelAndEfficiencyAndBurnsTheQuote() public {
        settleActivitySession(playerTokenId, player, 10);
        uint256 quotedCostWei = sneakerGame.quoteUpgradeCost(playerTokenId);

        vm.expectEmit(address(sneakerGame));
        emit SneakerGame.SneakerUpgraded(playerTokenId, player, 2, 12, 50 * ONE_SOLE_WEI);
        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);

        SneakerAttributes memory attributes = readAttributes(playerTokenId);
        assertEq(quotedCostWei, 50 * ONE_SOLE_WEI);
        assertEq(attributes.level, 2);
        assertEq(attributes.efficiency, 12);
        assertEq(attributes.durability, 97, "upgrading doesn't repair");
        assertEq(soleToken.balanceOf(player), 0);
        assertEq(sneakerGame.quoteUpgradeCost(playerTokenId), 100 * ONE_SOLE_WEI);
    }

    function test_UpgradedEfficiencyRaisesTheNextReward() public {
        fundWithSole(player, 50 * ONE_SOLE_WEI);
        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);

        settleActivitySession(playerTokenId, player, 10);

        assertEq(soleToken.balanceOf(player), 60 * ONE_SOLE_WEI, "10 minutes at efficiency 12");
    }

    function test_RevertWhen_UpgradingAtMaxLevel() public {
        setMaxLevel(1);
        fundWithSole(player, 50 * ONE_SOLE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.SneakerAtMaxLevel.selector, playerTokenId)
        );
        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);
    }

    function test_RevertWhen_QuotingAnUpgradeAtMaxLevel() public {
        setMaxLevel(1);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.SneakerAtMaxLevel.selector, playerTokenId)
        );
        sneakerGame.quoteUpgradeCost(playerTokenId);
    }

    function test_RevertWhen_UpgradeCalledByNonOwner() public {
        fundWithSole(otherPlayer, 50 * ONE_SOLE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.NotSneakerOwner.selector, playerTokenId, otherPlayer)
        );
        vm.prank(otherPlayer);
        sneakerGame.upgrade(playerTokenId);
    }

    function test_RevertWhen_UpgradeCostExceedsBalance() public {
        settleActivitySession(playerTokenId, player, 9);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                player,
                45 * ONE_SOLE_WEI,
                50 * ONE_SOLE_WEI
            )
        );
        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);
    }

    function test_RevertWhen_UpgradeWhilePaused() public {
        fundWithSole(player, 50 * ONE_SOLE_WEI);
        pauseGame();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);
    }

    function test_UpgradeBurnsOnlyFromTheCaller() public {
        fundWithSole(player, 50 * ONE_SOLE_WEI);
        fundWithSole(otherPlayer, 500 * ONE_SOLE_WEI);

        vm.prank(player);
        sneakerGame.upgrade(playerTokenId);

        assertEq(soleToken.balanceOf(otherPlayer), 500 * ONE_SOLE_WEI);
        assertEq(soleToken.balanceOf(player), 0);
    }

    function pauseGame() private {
        vm.prank(deployer);
        sneakerGame.pause();
    }

    function setMaxLevel(uint16 maxLevel) private {
        GameConfig memory newGameConfig = gameConfig;
        newGameConfig.maxLevel = maxLevel;
        vm.prank(deployer);
        sneakerGame.setGameConfig(newGameConfig);
    }
}
