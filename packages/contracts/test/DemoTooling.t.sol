// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {DeployGame} from "../script/DeployGame.s.sol";
import {DemoEnergyConfig} from "../script/DemoEnergyConfig.s.sol";
import {PrepareDemoWallets} from "../script/PrepareDemoWallets.s.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

contract DemoToolingTest is GameTestBase {
    address internal walletA = player;
    address internal walletB = otherPlayer;
    uint256 internal walletATokenId;

    function setUp() public override {
        super.setUp();
        vm.setEnv("SNEAKER_GAME_ADDRESS", vm.toString(address(sneakerGame)));
        vm.setEnv("SNEAKER_NFT_ADDRESS", vm.toString(address(sneakerNft)));
        vm.setEnv("SOLE_TOKEN_ADDRESS", vm.toString(address(soleToken)));
        vm.setEnv("DEMO_WALLET_A_ADDRESS", vm.toString(walletA));
        vm.setEnv("DEMO_WALLET_B_ADDRESS", vm.toString(walletB));
        vm.deal(deployer, 10 ether);
        walletATokenId = mintStarterSneakerFor(walletA);
    }

    function test_PrepareTopsWalletAUpToAnUpgradeAndARepair() public {
        settleActivitySession(walletATokenId, walletA, 3);
        uint256 targetBalanceWei = sneakerGame.quoteUpgradeCost(walletATokenId)
            + new PrepareDemoWallets().REPAIR_ALLOWANCE_WEI();

        new PrepareDemoWallets().run();

        assertEq(soleToken.balanceOf(walletA), targetBalanceWei);
        assertEq(soleToken.balanceOf(walletB), 0);
        assertFalse(soleToken.hasRole(soleToken.MINTER_ROLE(), deployer));
        assertEq(walletA.balance, 1 ether);
        assertEq(walletB.balance, 1 ether);
    }

    function test_PrepareSendsNothingWhenTheWalletsAreReady() public {
        new PrepareDemoWallets().run();
        uint256 deployerBalanceWei = deployer.balance;
        uint256 walletASoleBalanceWei = soleToken.balanceOf(walletA);

        new PrepareDemoWallets().run();

        assertEq(deployer.balance, deployerBalanceWei);
        assertEq(soleToken.balanceOf(walletA), walletASoleBalanceWei);
    }

    function test_EnergyConfigAppliesAndRestoresOnlyRegeneration() public {
        DemoEnergyConfig demoEnergyConfig = new DemoEnergyConfig();

        demoEnergyConfig.applyDemoEnergyConfig();
        GameConfig memory expectedDemoConfig = gameConfig;
        expectedDemoConfig.energyRegenerationSeconds = 60;
        assertEq(abi.encode(sneakerGame.getGameConfig()), abi.encode(expectedDemoConfig));

        demoEnergyConfig.restoreLaunchEnergyConfig();
        assertEq(
            abi.encode(sneakerGame.getGameConfig()),
            abi.encode(new DeployGame().buildInitialGameConfig())
        );
    }
}
