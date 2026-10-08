// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {FoundingPass} from "../src/FoundingPass.sol";
import {FoundingPassArtRenderer} from "../src/FoundingPassArtRenderer.sol";

/// @notice Deploys the Founding Pass (D-041): its art renderer and `FoundingPass`, and wires its
/// roles. Its own script, run once before `DeployGame.s.sol`: a game redeploy never touches the
/// founders. On a real broadcast it adds the two addresses to `deployments/<chainId>.json`,
/// keeping the keys already there.
/// @dev Reads `DEPLOYER_PRIVATE_KEY` and `GAME_SERVER_ADDRESS` from the environment
/// (`packages/contracts/.env`). The deployer becomes admin and holds `RECOVERY_ROLE`; the game
/// server holds `MINTER_ROLE`, never `RECOVERY_ROLE`.
contract DeployFoundingPass is Script {
    string public constant FOUNDING_PASS_NAME = "StrideMon Founding Pass";
    string public constant FOUNDING_PASS_SYMBOL = "PASS";

    struct FoundingPassDeployment {
        FoundingPassArtRenderer foundingPassArtRenderer;
        FoundingPass foundingPass;
    }

    /// @notice Entry point for `forge script`.
    /// @return deployment The deployed contracts.
    function run() external returns (FoundingPassDeployment memory deployment) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address gameServerAddress = vm.envAddress("GAME_SERVER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        deployment = deployFoundingPass(deployerAddress, gameServerAddress);
        vm.stopBroadcast();

        // A dry run must not touch the addresses of the live deployment.
        if (vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            writeDeploymentAddresses(deployment);
        }
    }

    function deployFoundingPass(address adminAddress, address gameServerAddress)
        private
        returns (FoundingPassDeployment memory deployment)
    {
        deployment.foundingPassArtRenderer = new FoundingPassArtRenderer();
        deployment.foundingPass = new FoundingPass(
            FOUNDING_PASS_NAME,
            FOUNDING_PASS_SYMBOL,
            adminAddress,
            deployment.foundingPassArtRenderer
        );
        deployment.foundingPass.grantRole(deployment.foundingPass.MINTER_ROLE(), gameServerAddress);
        deployment.foundingPass.grantRole(deployment.foundingPass.RECOVERY_ROLE(), adminAddress);
    }

    /// @dev Adds the two keys and keeps the rest: the game's addresses live in the same file.
    function writeDeploymentAddresses(FoundingPassDeployment memory deployment) private {
        string memory deploymentPath =
            string.concat(vm.projectRoot(), "/deployments/", vm.toString(block.chainid), ".json");
        if (!vm.exists(deploymentPath)) {
            vm.writeJson(vm.serializeUint("deployment", "chainId", block.chainid), deploymentPath);
        }
        vm.writeJson(
            quoteJsonString(vm.toString(address(deployment.foundingPassArtRenderer))),
            deploymentPath,
            ".foundingPassArtRenderer"
        );
        vm.writeJson(
            quoteJsonString(vm.toString(address(deployment.foundingPass))),
            deploymentPath,
            ".foundingPass"
        );
    }

    function quoteJsonString(string memory text) private pure returns (string memory) {
        return string.concat('"', text, '"');
    }
}
