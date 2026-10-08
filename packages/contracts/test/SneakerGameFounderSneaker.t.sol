// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IFoundingPassArtRenderer} from "../src/FoundingPass.sol";
import {DesignLayers} from "../src/founding-pass-art/FoundingPassArtTypes.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerAttributes, SneakerNft} from "../src/SneakerNft.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

/// @notice Founder Sneakers (D-041, D-042): one per pass, to the pass holder, never sent, moved
/// only with their pass, and drawn in the pass's design.
contract SneakerGameFounderSneakerTest is GameTestBase {
    string private constant JSON_DATA_URI_PREFIX = "data:application/json;base64,";
    uint256 private constant PASS_TOKEN_ID = 137;
    /// @dev A Founder Sneaker's picture is drawn in an `eth_call`. Monad runs one of up to 8.1M
    /// gas in its fast pool; this keeps it far inside.
    uint256 private constant PICTURE_GAS_BUDGET = 2_000_000;

    address private newWallet = makeAddr("newWallet");

    // ---------------------------------------------------------------------------------
    // Minting
    // ---------------------------------------------------------------------------------

    function test_MintsOneFounderSneakerToThePassHolderWithStarterStats() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);

        vm.expectEmit(address(sneakerNft));
        emit SneakerNft.FounderSneakerMinted(1, PASS_TOKEN_ID);
        uint256 tokenId = mintFounderSneakerFor(PASS_TOKEN_ID);

        SneakerAttributes memory attributes = readAttributes(tokenId);
        assertEq(sneakerNft.ownerOf(tokenId), player);
        assertEq(sneakerNft.foundingPassTokenIdOf(tokenId), PASS_TOKEN_ID);
        assertEq(sneakerNft.founderSneakerTokenIdOf(PASS_TOKEN_ID), tokenId);
        assertEq(attributes.level, 1);
        assertEq(attributes.efficiency, gameConfig.starterEfficiency);
        assertEq(attributes.durability, gameConfig.maxDurability);
        assertEq(sneakerGame.currentEnergy(tokenId), gameConfig.maxEnergy);
    }

    function test_RevertWhen_APassGetsASecondFounderSneaker() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);
        mintFounderSneakerFor(PASS_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerNft.FounderSneakerAlreadyMinted.selector, PASS_TOKEN_ID)
        );
        mintFounderSneakerFor(PASS_TOKEN_ID);
    }

    function test_AFounderSneakerIsTheHoldersFreeSneaker() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);
        mintFounderSneakerFor(PASS_TOKEN_ID);

        assertTrue(sneakerGame.hasClaimedStarterSneaker(player));
        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.StarterSneakerAlreadyClaimed.selector, player)
        );
        mintStarterSneakerFor(player);
    }

    function test_AHolderWithANormalSneakerStillGetsTheirFounderSneaker() public {
        uint256 normalTokenId = mintStarterSneakerFor(player);
        mintFoundingPassFor(player, PASS_TOKEN_ID);

        uint256 founderTokenId = mintFounderSneakerFor(PASS_TOKEN_ID);

        assertEq(sneakerNft.balanceOf(player), 2);
        assertEq(sneakerNft.foundingPassTokenIdOf(normalTokenId), 0);
        assertEq(sneakerNft.foundingPassTokenIdOf(founderTokenId), PASS_TOKEN_ID);
    }

    function test_RevertWhen_ThePassIsNotMinted() public {
        vm.expectRevert(
            abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, PASS_TOKEN_ID)
        );
        mintFounderSneakerFor(PASS_TOKEN_ID);
    }

    function test_RevertWhen_MintFounderSneakerCalledByNonGameServer() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);

        expectUnauthorized(player, sneakerGame.GAME_SERVER_ROLE());
        vm.prank(player);
        sneakerGame.mintFounderSneaker(PASS_TOKEN_ID);
    }

    function test_RevertWhen_MintFounderSneakerWhilePaused() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);
        vm.prank(deployer);
        sneakerGame.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        mintFounderSneakerFor(PASS_TOKEN_ID);
    }

    function test_RevertWhen_TheNftIsAskedForAFounderSneakerWithNoPass() public {
        vm.expectRevert(SneakerNft.InvalidFoundingPassTokenId.selector);
        vm.prank(address(sneakerGame));
        sneakerNft.mintFounderSneaker(player, buildStarterAttributes(), 0);
    }

    // ---------------------------------------------------------------------------------
    // Can't be sent
    // ---------------------------------------------------------------------------------

    function test_RevertWhen_AFounderSneakerIsSentOrApproved() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);
        vm.startPrank(player);

        expectNotTransferable(tokenId);
        sneakerNft.transferFrom(player, otherPlayer, tokenId);
        expectNotTransferable(tokenId);
        sneakerNft.safeTransferFrom(player, otherPlayer, tokenId);
        expectNotTransferable(tokenId);
        sneakerNft.safeTransferFrom(player, otherPlayer, tokenId, "");
        expectNotTransferable(tokenId);
        sneakerNft.approve(otherPlayer, tokenId);

        // An operator approved for the whole wallet can't send it either.
        sneakerNft.setApprovalForAll(otherPlayer, true);
        vm.stopPrank();
        expectNotTransferable(tokenId);
        vm.prank(otherPlayer);
        sneakerNft.transferFrom(player, otherPlayer, tokenId);

        assertEq(sneakerNft.ownerOf(tokenId), player);
    }

    function test_NormalSneakersStillTransferBesideAFounderSneaker() public {
        uint256 normalTokenId = mintStarterSneakerFor(player);
        mintPassAndFounderSneaker(player);

        vm.prank(player);
        sneakerNft.transferFrom(player, otherPlayer, normalTokenId);

        assertEq(sneakerNft.ownerOf(normalTokenId), otherPlayer);
    }

    function test_RevertWhen_TheNftMovesANormalSneakerAsAFounderSneaker() public {
        uint256 normalTokenId = mintStarterSneakerFor(player);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerNft.NotFounderSneaker.selector, normalTokenId)
        );
        vm.prank(address(sneakerGame));
        sneakerNft.moveFounderSneaker(normalTokenId, otherPlayer);
    }

    function test_RevertWhen_MoveFounderSneakerCalledWithoutGameRole() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);

        expectUnauthorized(deployer, sneakerNft.GAME_ROLE());
        vm.prank(deployer);
        sneakerNft.moveFounderSneaker(tokenId, newWallet);
    }

    function test_AFounderSneakerSettlesLikeAnyOther() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);

        settleActivitySession(tokenId, player, 10);

        assertEq(strideToken.balanceOf(player), 50 * ONE_STRIDE_WEI);
        assertEq(readAttributes(tokenId).durability, 97);
    }

    // ---------------------------------------------------------------------------------
    // The lost-wallet move
    // ---------------------------------------------------------------------------------

    function test_RecoveryMovesTheFounderSneakerAfterItsPassWithStatsIntact() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);
        settleActivitySession(tokenId, player, 10);
        SneakerAttributes memory attributesBefore = readAttributes(tokenId);
        vm.prank(deployer);
        foundingPass.recoverFoundingPass(PASS_TOKEN_ID, newWallet);

        vm.expectEmit(address(sneakerNft));
        emit SneakerNft.FounderSneakerMoved(tokenId, player, newWallet);
        vm.prank(deployer);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);

        assertEq(sneakerNft.ownerOf(tokenId), newWallet);
        assertEq(abi.encode(readAttributes(tokenId)), abi.encode(attributesBefore));
        assertEq(sneakerNft.foundingPassTokenIdOf(tokenId), PASS_TOKEN_ID);
        assertTrue(sneakerGame.hasClaimedStarterSneaker(newWallet));
        // The old wallet's runs no longer pay out with it.
        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.NotSneakerOwner.selector, tokenId, player)
        );
        settleActivitySession(tokenId, player, 1);
    }

    function test_RevertWhen_TheFounderSneakerIsAlreadyWithItsPass() public {
        mintPassAndFounderSneaker(player);

        vm.expectRevert(
            abi.encodeWithSelector(
                SneakerGame.FounderSneakerAlreadyWithPass.selector, PASS_TOKEN_ID
            )
        );
        vm.prank(deployer);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);
    }

    function test_RevertWhen_ThePassHasNoFounderSneaker() public {
        mintFoundingPassFor(player, PASS_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(SneakerGame.NoFounderSneaker.selector, PASS_TOKEN_ID)
        );
        vm.prank(deployer);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);
    }

    function test_RevertWhen_RecoverFounderSneakerCalledWithoutRecoveryRole() public {
        mintPassAndFounderSneaker(player);
        vm.prank(deployer);
        foundingPass.recoverFoundingPass(PASS_TOKEN_ID, newWallet);

        // The game server never holds RECOVERY_ROLE, and neither does the old holder.
        expectUnauthorized(gameServer, sneakerGame.RECOVERY_ROLE());
        vm.prank(gameServer);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);
        expectUnauthorized(player, sneakerGame.RECOVERY_ROLE());
        vm.prank(player);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);
    }

    function test_RecoveryWorksWhileThePauseIsOn() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);
        vm.startPrank(deployer);
        sneakerGame.pause();
        foundingPass.recoverFoundingPass(PASS_TOKEN_ID, newWallet);
        sneakerGame.recoverFounderSneaker(PASS_TOKEN_ID);
        vm.stopPrank();

        assertEq(sneakerNft.ownerOf(tokenId), newWallet);
    }

    // ---------------------------------------------------------------------------------
    // The picture
    // ---------------------------------------------------------------------------------

    function test_ThePictureIsThePassDesignWithItsStats() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);
        IFoundingPassArtRenderer passArtRenderer = foundingPass.artRenderer();
        DesignLayers memory layers = passArtRenderer.readDesignLayers(PASS_TOKEN_ID);

        string memory svg = sneakerNft.imageSvg(tokenId);

        assertContains(svg, ">FOUNDER SNEAKER</text>");
        assertContains(svg, ">#0137</text>");
        assertContains(svg, string.concat(">", passArtRenderer.readDesignName(PASS_TOKEN_ID), "<"));
        assertContains(
            svg,
            passArtRenderer.renderSneakerMarkup(
                layers, false, string.concat("sneaker", vm.toString(tokenId))
            )
        );
        assertContains(svg, ">01 / 30</text>");
        assertContains(svg, ">100 / 100</text>");
        assertContains(svg, 'stroke="#FFFFFF" stroke-opacity="0.3"'); // plain corner marks
        assertNotContains(svg, ">LACED<");
    }

    function test_ThePictureLacesWithItsPass() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);
        DesignLayers memory layers = foundingPass.artRenderer().readDesignLayers(PASS_TOKEN_ID);

        vm.prank(gameServer);
        foundingPass.setLaced(PASS_TOKEN_ID);
        string memory svg = sneakerNft.imageSvg(tokenId);

        assertContains(svg, ">LACED</text>");
        assertContains(
            svg,
            foundingPass.artRenderer()
                .renderSneakerMarkup(layers, true, string.concat("sneaker", vm.toString(tokenId)))
        );
    }

    function test_AGoldFramedPassTurnsTheCornerMarksGold() public {
        uint256 goldPassTokenId = mintUntilAGoldFrame();
        uint256 tokenId = mintFounderSneakerFor(goldPassTokenId);

        string memory svg = sneakerNft.imageSvg(tokenId);

        assertContains(svg, 'stroke="#C9971C" stroke-width="1.5"');
        assertNotContains(svg, 'stroke="#FFFFFF" stroke-opacity="0.3"');
    }

    function test_TheTokenUriNamesItsPass() public {
        uint256 tokenId = mintPassAndFounderSneaker(player);

        string memory metadataJson = decodeTokenUri(sneakerNft.tokenURI(tokenId));

        assertContains(vm.parseJsonString(metadataJson, ".description"), "Founder Sneaker");
        assertEq(vm.parseJsonString(metadataJson, ".attributes[3].trait_type"), "Founding Pass");
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[3].value"), PASS_TOKEN_ID);
    }

    function test_ANormalSneakerKeepsItsLineArtAndTraits() public {
        uint256 tokenId = mintStarterSneakerFor(player);

        string memory metadataJson = decodeTokenUri(sneakerNft.tokenURI(tokenId));

        assertContains(sneakerNft.imageSvg(tokenId), ">STRIDEMON</text>");
        assertFalse(vm.keyExistsJson(metadataJson, ".attributes[3]"));
    }

    function test_DrawsALacedGoldFramedPictureWithinTheGasBudget() public {
        uint256 goldPassTokenId = mintUntilAGoldFrame();
        vm.prank(gameServer);
        foundingPass.setLaced(goldPassTokenId);
        uint256 tokenId = mintFounderSneakerFor(goldPassTokenId);

        uint256 gasBefore = gasleft();
        sneakerNft.tokenURI(tokenId);
        uint256 gasUsed = gasBefore - gasleft();

        assertLt(gasUsed, PICTURE_GAS_BUDGET);
    }

    // ---------------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------------

    function mintPassAndFounderSneaker(address walletAddress) private returns (uint256 tokenId) {
        mintFoundingPassFor(walletAddress, PASS_TOKEN_ID);
        return mintFounderSneakerFor(PASS_TOKEN_ID);
    }

    /// @dev Mints designs from 1 up, each in a new block, until one rolls a gold frame.
    function mintUntilAGoldFrame() private returns (uint256 designNumber) {
        for (designNumber = 1; designNumber <= foundingPass.DESIGN_COUNT(); designNumber++) {
            vm.roll(vm.getBlockNumber() + 1);
            vm.prevrandao(keccak256(abi.encode("gold", designNumber)));
            mintFoundingPassFor(address(uint160(0x30000 + designNumber)), designNumber);
            if (foundingPass.passOf(designNumber).hasGoldFrame) return designNumber;
        }
        revert("No gold frame in 1,000 mints");
    }

    function buildStarterAttributes() private view returns (SneakerAttributes memory) {
        return SneakerAttributes({
            level: 1,
            efficiency: gameConfig.starterEfficiency,
            durability: gameConfig.maxDurability,
            storedEnergy: gameConfig.maxEnergy,
            energyUpdatedAt: uint64(block.timestamp)
        });
    }

    function expectNotTransferable(uint256 tokenId) private {
        vm.expectRevert(
            abi.encodeWithSelector(SneakerNft.FounderSneakerNotTransferable.selector, tokenId)
        );
    }

    function expectUnauthorized(address account, bytes32 role) private {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, account, role
            )
        );
    }

    function assertContains(string memory text, string memory expectedPart) private pure {
        assertTrue(vm.contains(text, expectedPart), expectedPart);
    }

    function assertNotContains(string memory text, string memory unexpectedPart) private pure {
        assertFalse(vm.contains(text, unexpectedPart), unexpectedPart);
    }

    function decodeTokenUri(string memory tokenUri) private pure returns (string memory) {
        bytes memory tokenUriBytes = bytes(tokenUri);
        uint256 prefixLength = bytes(JSON_DATA_URI_PREFIX).length;
        bytes memory encodedJson = new bytes(tokenUriBytes.length - prefixLength);
        for (uint256 byteIndex; byteIndex < encodedJson.length; byteIndex++) {
            encodedJson[byteIndex] = tokenUriBytes[prefixLength + byteIndex];
        }
        return string(Base64.decode(string(encodedJson)));
    }
}
