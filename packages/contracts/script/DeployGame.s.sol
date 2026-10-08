// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {FoundingPass} from "../src/FoundingPass.sol";
import {GameConfig} from "../src/libraries/GameMath.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerNft} from "../src/SneakerNft.sol";
import {StrideToken} from "../src/StrideToken.sol";

/// @notice Deploys SneakerArtRenderer, SneakerNft, StrideToken and SneakerGame, wires every role, and on a real
/// broadcast writes the addresses to `deployments/<chainId>.json`, the Founding Pass's included.
/// @dev Reads `DEPLOYER_PRIVATE_KEY`, `GAME_SERVER_ADDRESS` and `FOUNDING_PASS_ADDRESS` from the
/// environment (`packages/contracts/.env`; the pass comes from `DeployFoundingPass.s.sol`, run
/// first). The deployer becomes admin, pauser and recovery (D-041).
contract DeployGame is Script {
    string public constant SNEAKER_NFT_NAME = "StrideMon Sneaker";
    string public constant SNEAKER_NFT_SYMBOL = "SNEAKER";
    string public constant STRIDE_TOKEN_NAME = "Stride";
    string public constant STRIDE_TOKEN_SYMBOL = "STRIDE";

    uint256 private constant ONE_STRIDE_WEI = 1e18;

    struct GameDeployment {
        SneakerArtRenderer sneakerArtRenderer;
        SneakerNft sneakerNft;
        StrideToken strideToken;
        SneakerGame sneakerGame;
    }

    /// @notice Entry point for `forge script`.
    /// @return deployment The deployed contracts.
    function run() external returns (GameDeployment memory deployment) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address gameServerAddress = vm.envAddress("GAME_SERVER_ADDRESS");
        FoundingPass foundingPass = FoundingPass(vm.envAddress("FOUNDING_PASS_ADDRESS"));

        vm.startBroadcast(deployerPrivateKey);
        deployment = deployGame(deployerAddress, gameServerAddress, foundingPass);
        vm.stopBroadcast();

        // A dry run must not overwrite the addresses of the live deployment.
        if (vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            writeDeploymentJson(deployment, deployerAddress, gameServerAddress, foundingPass);
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
            rewardPerEfficiencyMinuteWei: ONE_STRIDE_WEI / 2,
            repairCostPerPointWei: (ONE_STRIDE_WEI * 7) / 10,
            repairCostPerPointIncreasePerLevelWei: ONE_STRIDE_WEI / 10,
            upgradeCostPerLevelWei: 50 * ONE_STRIDE_WEI
        });
    }

    function deployGame(address adminAddress, address gameServerAddress, FoundingPass foundingPass)
        private
        returns (GameDeployment memory deployment)
    {
        deployment.sneakerArtRenderer = new SneakerArtRenderer(foundingPass);
        deployment.sneakerNft = new SneakerNft(
            SNEAKER_NFT_NAME, SNEAKER_NFT_SYMBOL, adminAddress, deployment.sneakerArtRenderer
        );
        deployment.strideToken =
            new StrideToken(STRIDE_TOKEN_NAME, STRIDE_TOKEN_SYMBOL, adminAddress);
        deployment.sneakerGame = new SneakerGame(
            adminAddress,
            deployment.sneakerNft,
            deployment.strideToken,
            foundingPass,
            buildInitialGameConfig()
        );

        address sneakerGameAddress = address(deployment.sneakerGame);
        deployment.sneakerNft.grantRole(deployment.sneakerNft.GAME_ROLE(), sneakerGameAddress);
        deployment.strideToken.grantRole(deployment.strideToken.MINTER_ROLE(), sneakerGameAddress);
        deployment.strideToken.grantRole(deployment.strideToken.BURNER_ROLE(), sneakerGameAddress);
        deployment.sneakerGame
            .grantRole(deployment.sneakerGame.GAME_SERVER_ROLE(), gameServerAddress);
        deployment.sneakerGame.grantRole(deployment.sneakerGame.PAUSER_ROLE(), adminAddress);
        deployment.sneakerGame.grantRole(deployment.sneakerGame.RECOVERY_ROLE(), adminAddress);
    }

    /// @dev The whole file: the game's addresses and the Founding Pass it was wired to.
    function writeDeploymentJson(
        GameDeployment memory deployment,
        address deployerAddress,
        address gameServerAddress,
        FoundingPass foundingPass
    ) private {
        string memory objectKey = "deployment";
        vm.serializeUint(objectKey, "chainId", block.chainid);
        vm.serializeAddress(objectKey, "deployer", deployerAddress);
        vm.serializeAddress(objectKey, "gameServer", gameServerAddress);
        vm.serializeAddress(objectKey, "sneakerArtRenderer", address(deployment.sneakerArtRenderer));
        vm.serializeAddress(objectKey, "sneakerNft", address(deployment.sneakerNft));
        vm.serializeAddress(objectKey, "strideToken", address(deployment.strideToken));
        vm.serializeAddress(objectKey, "foundingPass", address(foundingPass));
        vm.serializeAddress(
            objectKey, "foundingPassArtRenderer", address(foundingPass.artRenderer())
        );
        string memory deploymentJson =
            vm.serializeAddress(objectKey, "sneakerGame", address(deployment.sneakerGame));
        vm.writeJson(
            deploymentJson,
            string.concat(vm.projectRoot(), "/deployments/", vm.toString(block.chainid), ".json")
        );
    }
}
