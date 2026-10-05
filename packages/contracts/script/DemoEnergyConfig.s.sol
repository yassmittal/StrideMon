// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {DeployGame} from "./DeployGame.s.sol";

/// @notice Switches energy regeneration between the demo pace and the launch pace (D-033).
/// Every other `GameConfig` field is left as it is on-chain.
/// @dev Run through `scripts/demo-energy-config apply|revert`. Signs with `DEPLOYER_PRIVATE_KEY`
/// (`DEFAULT_ADMIN_ROLE`).
contract DemoEnergyConfig is Script {
    uint32 public constant DEMO_ENERGY_REGENERATION_SECONDS = 60;

    /// @notice One energy point a minute, so a Sneaker refills during the demo.
    function applyDemoEnergyConfig() external {
        setEnergyRegenerationSeconds(DEMO_ENERGY_REGENERATION_SECONDS);
    }

    /// @notice Back to the launch pace from `DeployGame.buildInitialGameConfig()`.
    function restoreLaunchEnergyConfig() external {
        // Created before the broadcast starts, so it is never deployed.
        DeployGame deployScript = new DeployGame();
        setEnergyRegenerationSeconds(
            deployScript.buildInitialGameConfig().energyRegenerationSeconds
        );
    }

    function setEnergyRegenerationSeconds(uint32 energyRegenerationSeconds) private {
        SneakerGame sneakerGame = SneakerGame(vm.envAddress("SNEAKER_GAME_ADDRESS"));
        GameConfig memory gameConfig = sneakerGame.getGameConfig();
        if (gameConfig.energyRegenerationSeconds == energyRegenerationSeconds) {
            console.log("Already set. energyRegenerationSeconds:", energyRegenerationSeconds);
            return;
        }
        gameConfig.energyRegenerationSeconds = energyRegenerationSeconds;

        vm.startBroadcast(vm.envUint("DEPLOYER_PRIVATE_KEY"));
        sneakerGame.setGameConfig(gameConfig);
        vm.stopBroadcast();
        console.log("Setting energyRegenerationSeconds to", energyRegenerationSeconds);
    }
}
