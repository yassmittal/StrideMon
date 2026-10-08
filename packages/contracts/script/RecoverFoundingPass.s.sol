// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FoundingPass} from "../src/FoundingPass.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerNft} from "../src/SneakerNft.sol";

/// @notice The lost-wallet move (D-041, D-042): moves a Founding Pass and its Founder Sneaker to
/// the founder's new wallet, in one run, from the deployer key (`RECOVERY_ROLE`). Only after
/// support has checked a code sent to the pass's email. A step that's already done is skipped,
/// so a half-finished run can be run again, and a second run sends nothing.
/// @dev Run through `scripts/recover-founding-pass <pass number> <new wallet> [--dry-run]`, which
/// reads the addresses from `deployments/10143.json`. Reads `DEPLOYER_PRIVATE_KEY`,
/// `FOUNDING_PASS_ADDRESS`, `SNEAKER_GAME_ADDRESS`, `FOUNDING_PASS_TOKEN_ID` and
/// `NEW_OWNER_ADDRESS`.
contract RecoverFoundingPass is Script {
    /// @notice Entry point for `forge script`.
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        FoundingPass foundingPass = FoundingPass(vm.envAddress("FOUNDING_PASS_ADDRESS"));
        SneakerGame sneakerGame = SneakerGame(vm.envAddress("SNEAKER_GAME_ADDRESS"));
        uint256 foundingPassTokenId = vm.envUint("FOUNDING_PASS_TOKEN_ID");
        address newOwner = vm.envAddress("NEW_OWNER_ADDRESS");
        SneakerNft sneakerNft = sneakerGame.sneakerNft();

        address passHolder = foundingPass.ownerOf(foundingPassTokenId);
        uint256 founderSneakerTokenId = sneakerNft.founderSneakerTokenIdOf(foundingPassTokenId);
        bool shouldMovePass = passHolder != newOwner;
        bool shouldMoveSneaker =
            founderSneakerTokenId != 0 && sneakerNft.ownerOf(founderSneakerTokenId) != newOwner;
        console.log("Founding Pass:", foundingPassTokenId);
        console.log("Held by:", passHolder);
        console.log("Moving to:", newOwner);

        vm.startBroadcast(deployerPrivateKey);
        if (shouldMovePass) foundingPass.recoverFoundingPass(foundingPassTokenId, newOwner);
        // After the pass: the game moves the Sneaker to whoever holds the pass now.
        if (shouldMoveSneaker) sneakerGame.recoverFounderSneaker(foundingPassTokenId);
        vm.stopBroadcast();

        console.log(shouldMovePass ? "Pass: moved" : "Pass: already there");
        if (founderSneakerTokenId == 0) {
            console.log("Founder Sneaker: none yet (the app gives it on the next sign-in)");
        } else {
            console.log("Founder Sneaker:", founderSneakerTokenId);
            console.log(
                shouldMoveSneaker ? "Founder Sneaker: moved" : "Founder Sneaker: already there"
            );
        }
    }
}
