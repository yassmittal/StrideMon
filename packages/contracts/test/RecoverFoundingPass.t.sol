// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {RecoverFoundingPass} from "../script/RecoverFoundingPass.s.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

/// @notice `RecoverFoundingPass.s.sol` (D-042): the pass and its Founder Sneaker in one run, and
/// a run that finds a step done skips it.
contract RecoverFoundingPassTest is GameTestBase {
    uint256 private constant PASS_TOKEN_ID = 137;

    address private newWallet = makeAddr("newWallet");

    function setUp() public override {
        super.setUp();
        vm.setEnv("FOUNDING_PASS_ADDRESS", vm.toString(address(foundingPass)));
        vm.setEnv("SNEAKER_GAME_ADDRESS", vm.toString(address(sneakerGame)));
        vm.setEnv("FOUNDING_PASS_TOKEN_ID", vm.toString(PASS_TOKEN_ID));
        vm.setEnv("NEW_OWNER_ADDRESS", vm.toString(newWallet));
        mintFoundingPassFor(player, PASS_TOKEN_ID);
    }

    function test_MovesThePassAndItsFounderSneakerInOneRun() public {
        uint256 sneakerTokenId = mintFounderSneakerFor(PASS_TOKEN_ID);
        settleActivitySession(sneakerTokenId, player, 10);
        SneakerAttributes memory attributesBefore = readAttributes(sneakerTokenId);

        new RecoverFoundingPass().run();

        assertEq(foundingPass.ownerOf(PASS_TOKEN_ID), newWallet);
        assertEq(sneakerNft.ownerOf(sneakerTokenId), newWallet);
        assertEq(abi.encode(readAttributes(sneakerTokenId)), abi.encode(attributesBefore));
    }

    function test_ARunAfterAFinishedOneSendsNothing() public {
        uint256 sneakerTokenId = mintFounderSneakerFor(PASS_TOKEN_ID);
        new RecoverFoundingPass().run();

        // Both steps would revert if sent again, so a second run that passes sent nothing.
        new RecoverFoundingPass().run();

        assertEq(sneakerNft.ownerOf(sneakerTokenId), newWallet);
    }

    function test_FinishesAHalfDoneMove() public {
        uint256 sneakerTokenId = mintFounderSneakerFor(PASS_TOKEN_ID);
        vm.prank(deployer);
        foundingPass.recoverFoundingPass(PASS_TOKEN_ID, newWallet);

        new RecoverFoundingPass().run();

        assertEq(sneakerNft.ownerOf(sneakerTokenId), newWallet);
    }

    function test_MovesOnlyThePassWhenItHasNoFounderSneakerYet() public {
        new RecoverFoundingPass().run();

        assertEq(foundingPass.ownerOf(PASS_TOKEN_ID), newWallet);
        assertEq(sneakerNft.balanceOf(newWallet), 0);
    }
}
