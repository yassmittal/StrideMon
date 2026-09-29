// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerNft} from "../src/SneakerNft.sol";
import {SoleToken} from "../src/SoleToken.sol";

/// @notice Deploys SneakerNft, SoleToken and SneakerGame, wires every role, and on a real
/// broadcast writes the addresses to `deployments/<chainId>.json`.
/// @dev Reads `DEPLOYER_PRIVATE_KEY` and `GAME_SERVER_ADDRESS` from the environment
/// (`packages/contracts/.env`). The deployer becomes admin and pauser.
contract DeployGame is Script {
    string public constant SNEAKER_NFT_NAME = "StrideMon Sneaker";
    string public constant SNEAKER_NFT_SYMBOL = "SNEAKER";
    string public constant SOLE_TOKEN_NAME = "Sole";
    string public constant SOLE_TOKEN_SYMBOL = "SOLE";

    uint256 private constant ONE_SOLE_WEI = 1e18;

    struct GameDeployment {
        SneakerNft sneakerNft;
        SoleToken soleToken;
        SneakerGame sneakerGame;
    }

    /// @notice Entry point for `forge script`.
    /// @return deployment The deployed contracts.
    function run() external returns (GameDeployment memory deployment) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address gameServerAddress = vm.envAddress("GAME_SERVER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        deployment = deployGame(deployerAddress, gameServerAddress);
        vm.stopBroadcast();

        // A dry run must not overwrite the addresses of the live deployment.
        if (vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            writeDeploymentJson(deployment, deployerAddress, gameServerAddress);
        }
    }

    /// @notice The rules the game launches with, from `docs/architecture/game-rules.md`.
    /// @dev Must equal `gameConfig` in `game-rule-fixtures.json` (pinned by DeployGame.t.sol).
    /// @return The initial game config.
    function buildInitialGameConfig() public pure returns (GameConfig memory) {
        return GameConfig({
            maxLevel: 30,
            maxEnergy: 10,
            maxDurability: 100,
            starterEfficiency: 10,
            efficiencyGainPerLevel: 2,
            durabilityLossPerMinuteBasisPoints: 3000,
            energyRegenerationSeconds: 30 minutes,
            rewardPerEfficiencyMinuteWei: ONE_SOLE_WEI / 2,
            repairCostPerPointWei: (ONE_SOLE_WEI * 7) / 10,
            repairCostPerPointIncreasePerLevelWei: ONE_SOLE_WEI / 10,
            upgradeCostPerLevelWei: 50 * ONE_SOLE_WEI
        });
    }

    function deployGame(address adminAddress, address gameServerAddress)
        private
        returns (GameDeployment memory deployment)
    {
        deployment.sneakerNft = new SneakerNft(SNEAKER_NFT_NAME, SNEAKER_NFT_SYMBOL, adminAddress);
        deployment.soleToken = new SoleToken(SOLE_TOKEN_NAME, SOLE_TOKEN_SYMBOL, adminAddress);
        deployment.sneakerGame = new SneakerGame(
            adminAddress, deployment.sneakerNft, deployment.soleToken, buildInitialGameConfig()
        );

        address sneakerGameAddress = address(deployment.sneakerGame);
        deployment.sneakerNft.grantRole(deployment.sneakerNft.GAME_ROLE(), sneakerGameAddress);
        deployment.soleToken.grantRole(deployment.soleToken.MINTER_ROLE(), sneakerGameAddress);
        deployment.soleToken.grantRole(deployment.soleToken.BURNER_ROLE(), sneakerGameAddress);
        deployment.sneakerGame
            .grantRole(deployment.sneakerGame.GAME_SERVER_ROLE(), gameServerAddress);
        deployment.sneakerGame.grantRole(deployment.sneakerGame.PAUSER_ROLE(), adminAddress);
    }

    function writeDeploymentJson(
        GameDeployment memory deployment,
        address deployerAddress,
        address gameServerAddress
    ) private {
        string memory objectKey = "deployment";
        vm.serializeUint(objectKey, "chainId", block.chainid);
        vm.serializeAddress(objectKey, "deployer", deployerAddress);
        vm.serializeAddress(objectKey, "gameServer", gameServerAddress);
        vm.serializeAddress(objectKey, "sneakerNft", address(deployment.sneakerNft));
        vm.serializeAddress(objectKey, "soleToken", address(deployment.soleToken));
        string memory deploymentJson =
            vm.serializeAddress(objectKey, "sneakerGame", address(deployment.sneakerGame));
        vm.writeJson(
            deploymentJson,
            string.concat(vm.projectRoot(), "/deployments/", vm.toString(block.chainid), ".json")
        );
    }
}
