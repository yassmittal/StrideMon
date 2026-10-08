// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    IERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {FoundingPass, IERC5192, IFoundingPassArtRenderer} from "../src/FoundingPass.sol";
import {FoundingPassArtRenderer} from "../src/FoundingPassArtRenderer.sol";
import {DesignTraits, PassRecord} from "../src/founding-pass-art/FoundingPassArtTypes.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

/// @notice The Founding Pass (D-041, D-042): one per design and per wallet, soulbound, laced
/// once, the minted bitmap, the gold frame, the metadata and the lost-wallet move.
contract FoundingPassTest is GameTestBase {
    string private constant JSON_DATA_URI_PREFIX = "data:application/json;base64,";
    string private constant SVG_DATA_URI_PREFIX = "data:image/svg+xml;base64,";
    uint256 private constant SAMPLE_DESIGN_NUMBER = 137;
    uint256 private constant DESIGN_COUNT = 1000;
    /// @dev 9 attributes before lacing (template, family, colourway, three options, rarity,
    /// founder number, frame, stage), plus the lace colour once laced.
    uint256 private constant UNLACED_ATTRIBUTE_COUNT = 10;

    address private newWallet = makeAddr("newWallet");

    // ---------------------------------------------------------------------------------
    // Minting
    // ---------------------------------------------------------------------------------

    function test_MintGivesFounderNumbersInMintOrder() public {
        vm.expectEmit(address(foundingPass));
        emit IERC5192.Locked(SAMPLE_DESIGN_NUMBER);
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        mintFoundingPassFor(otherPlayer, 5);

        assertEq(foundingPass.ownerOf(SAMPLE_DESIGN_NUMBER), player);
        assertEq(foundingPass.passOf(SAMPLE_DESIGN_NUMBER).founderNumber, 1);
        assertEq(foundingPass.passOf(5).founderNumber, 2);
        assertFalse(foundingPass.passOf(5).isLaced);
        assertEq(foundingPass.mintedCount(), 2);
        assertEq(foundingPass.totalSupply(), 2);
        assertEq(foundingPass.tokenOfOwnerByIndex(player, 0), SAMPLE_DESIGN_NUMBER);
    }

    function test_MintEmitsTheFounderNumberAndFrame() public {
        bool hasGoldFrame = rollFor(player, SAMPLE_DESIGN_NUMBER, 1);

        vm.expectEmit(address(foundingPass));
        emit FoundingPass.FoundingPassMinted(SAMPLE_DESIGN_NUMBER, player, 1, hasGoldFrame);
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        assertEq(foundingPass.passOf(SAMPLE_DESIGN_NUMBER).hasGoldFrame, hasGoldFrame);
    }

    function test_RevertWhen_DesignIsMintedTwice() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        vm.expectRevert(
            abi.encodeWithSelector(FoundingPass.PassAlreadyMinted.selector, SAMPLE_DESIGN_NUMBER)
        );
        mintFoundingPassFor(otherPlayer, SAMPLE_DESIGN_NUMBER);
    }

    function test_RevertWhen_WalletAlreadyHoldsAPass() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        vm.expectRevert(
            abi.encodeWithSelector(FoundingPass.FoundingPassAlreadyHeld.selector, player)
        );
        mintFoundingPassFor(player, 5);
    }

    function test_RevertWhen_MintCalledWithoutMinterRole() public {
        // Not even the admin mints: only the game server holds MINTER_ROLE.
        expectUnauthorized(deployer, foundingPass.MINTER_ROLE());
        vm.prank(deployer);
        foundingPass.mint(player, SAMPLE_DESIGN_NUMBER);
    }

    function testFuzz_MintsAnyDesignInTheCollection(uint256 designNumber) public {
        designNumber = bound(designNumber, 1, DESIGN_COUNT);

        mintFoundingPassFor(player, designNumber);

        assertEq(foundingPass.ownerOf(designNumber), player);
        uint256[4] memory mintedBitmap = foundingPass.mintedBitmap();
        assertEq(mintedBitmap[designNumber / 256], 1 << (designNumber % 256));
        assertTrue(vm.contains(foundingPass.imageSvg(designNumber), "</svg>"));
    }

    function testFuzz_RevertsForADesignOutsideTheCollection(uint256 designNumber) public {
        designNumber =
            designNumber % 2 == 0 ? 0 : bound(designNumber, DESIGN_COUNT + 1, type(uint256).max);

        vm.expectRevert(abi.encodeWithSelector(FoundingPass.InvalidDesign.selector, designNumber));
        mintFoundingPassFor(player, designNumber);
    }

    function test_MintedBitmapMarksDesignNAtBitN() public {
        mintFoundingPassFor(makeAddr("first"), 1);
        mintFoundingPassFor(makeAddr("lastOfWordZero"), 255);
        mintFoundingPassFor(makeAddr("firstOfWordOne"), 256);
        mintFoundingPassFor(makeAddr("last"), DESIGN_COUNT);

        uint256[4] memory mintedBitmap = foundingPass.mintedBitmap();

        assertEq(mintedBitmap[0], (1 << 1) | (1 << 255));
        assertEq(mintedBitmap[1], 1);
        assertEq(mintedBitmap[2], 0);
        assertEq(mintedBitmap[3], 1 << (DESIGN_COUNT - 768));
    }

    /// @dev All 1,000, each from its own wallet in its own block: every design mints once, the
    /// bitmap fills, and about 1 in 10 rolls a gold frame.
    function test_MintsAllOneThousandWithAboutOneGoldFrameInTen() public {
        uint256 goldFrameCount = 0;
        for (uint256 designNumber = 1; designNumber <= DESIGN_COUNT; designNumber++) {
            vm.roll(vm.getBlockNumber() + 1);
            vm.prevrandao(keccak256(abi.encode("mint day", designNumber)));
            mintFoundingPassFor(address(uint160(0x10000 + designNumber)), designNumber);
            if (foundingPass.passOf(designNumber).hasGoldFrame) goldFrameCount++;
        }

        assertEq(foundingPass.mintedCount(), DESIGN_COUNT);
        assertEq(foundingPass.passOf(DESIGN_COUNT).founderNumber, DESIGN_COUNT);
        assertGt(goldFrameCount, 70);
        assertLt(goldFrameCount, 130);
        uint256[4] memory mintedBitmap = foundingPass.mintedBitmap();
        assertEq(mintedBitmap[0], type(uint256).max - 1); // every bit but 0
        assertEq(mintedBitmap[1], type(uint256).max);
        assertEq(mintedBitmap[2], type(uint256).max);
        assertEq(mintedBitmap[3], (1 << (DESIGN_COUNT - 768 + 1)) - 1);
    }

    // ---------------------------------------------------------------------------------
    // Soulbound
    // ---------------------------------------------------------------------------------

    function test_RevertWhen_HolderTransfersOrApproves() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        vm.startPrank(player);

        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        foundingPass.transferFrom(player, otherPlayer, SAMPLE_DESIGN_NUMBER);
        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        foundingPass.safeTransferFrom(player, otherPlayer, SAMPLE_DESIGN_NUMBER);
        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        foundingPass.safeTransferFrom(player, otherPlayer, SAMPLE_DESIGN_NUMBER, "");
        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        foundingPass.approve(otherPlayer, SAMPLE_DESIGN_NUMBER);
        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        foundingPass.setApprovalForAll(otherPlayer, true);

        vm.stopPrank();
        assertEq(foundingPass.ownerOf(SAMPLE_DESIGN_NUMBER), player);
    }

    function test_RevertWhen_AdminTriesAnOrdinaryTransfer() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        vm.expectRevert(FoundingPass.FoundingPassIsSoulbound.selector);
        vm.prank(deployer);
        foundingPass.transferFrom(player, otherPlayer, SAMPLE_DESIGN_NUMBER);
    }

    function test_LockedIsAlwaysTrue() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        assertTrue(foundingPass.locked(SAMPLE_DESIGN_NUMBER));
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 5));
        foundingPass.locked(5);
    }

    // ---------------------------------------------------------------------------------
    // Lacing
    // ---------------------------------------------------------------------------------

    function test_SetLacedLacesOnceAndAsksForARefresh() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        vm.expectEmit(address(foundingPass));
        emit FoundingPass.FoundingPassLaced(SAMPLE_DESIGN_NUMBER);
        vm.expectEmit(address(foundingPass));
        emit IERC4906.MetadataUpdate(SAMPLE_DESIGN_NUMBER);
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);

        assertTrue(foundingPass.passOf(SAMPLE_DESIGN_NUMBER).isLaced);
        vm.expectRevert(
            abi.encodeWithSelector(
                FoundingPass.FoundingPassAlreadyLaced.selector, SAMPLE_DESIGN_NUMBER
            )
        );
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);
    }

    function test_RevertWhen_SetLacedCalledWithoutMinterRole() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        expectUnauthorized(player, foundingPass.MINTER_ROLE());
        vm.prank(player);
        foundingPass.setLaced(SAMPLE_DESIGN_NUMBER);
    }

    function test_RevertWhen_LacingAPassNotMinted() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector, SAMPLE_DESIGN_NUMBER
            )
        );
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);
    }

    // ---------------------------------------------------------------------------------
    // Picture and metadata
    // ---------------------------------------------------------------------------------

    function test_ImageFollowsThePassRecord() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        string memory mintedSvg = foundingPass.imageSvg(SAMPLE_DESIGN_NUMBER);
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);
        string memory lacedSvg = foundingPass.imageSvg(SAMPLE_DESIGN_NUMBER);

        assertContains(mintedSvg, ">#0137</text>");
        assertContains(mintedSvg, ">FOUNDER 001</text>");
        assertNotContains(mintedSvg, ">LACED<");
        assertContains(lacedSvg, ">LACED</text>");
        assertEq(
            lacedSvg,
            FoundingPassArtRenderer(address(foundingPass.artRenderer()))
                .renderPassSvg(SAMPLE_DESIGN_NUMBER, foundingPass.passOf(SAMPLE_DESIGN_NUMBER))
        );
    }

    function test_DrawsTheGoldFrameItRolled() public {
        uint256 goldDesignNumber = mintUntilAGoldFrame();

        assertContains(foundingPass.imageSvg(goldDesignNumber), 'stroke="#C9971C"');
    }

    function test_TokenUriListsTheLayersAndTheRecord() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        DesignTraits memory traits =
            foundingPass.artRenderer().readDesignTraits(SAMPLE_DESIGN_NUMBER);

        string memory metadataJson = decodeTokenUri(foundingPass.tokenURI(SAMPLE_DESIGN_NUMBER));

        assertEq(
            vm.parseJsonString(metadataJson, ".name"),
            string.concat(
                "Founding Pass #0137 ",
                foundingPass.artRenderer().readDesignName(SAMPLE_DESIGN_NUMBER)
            )
        );
        assertContains(
            vm.parseJsonString(metadataJson, ".description"), "It can't be sent or sold."
        );
        assertEq(
            vm.parseJsonString(metadataJson, ".image"),
            string.concat(
                SVG_DATA_URI_PREFIX,
                Base64.encode(bytes(foundingPass.imageSvg(SAMPLE_DESIGN_NUMBER)))
            )
        );
        assertTrait(metadataJson, 0, "Template", traits.templateLabel);
        assertTrait(metadataJson, 1, "Family", traits.colorFamilyLabel);
        assertTrait(metadataJson, 2, "Colourway", traits.colorwayLabel);
        assertTrait(metadataJson, 3, traits.optionSlotLabels[0], traits.optionValueLabels[0]);
        assertTrait(metadataJson, 5, traits.optionSlotLabels[2], traits.optionValueLabels[2]);
        assertEq(vm.parseJsonString(metadataJson, ".attributes[7].trait_type"), "Founder number");
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[7].value"), 1);
        assertTrait(
            metadataJson,
            8,
            "Frame",
            foundingPass.passOf(SAMPLE_DESIGN_NUMBER).hasGoldFrame ? "Gold" : "Plain"
        );
        assertTrait(metadataJson, 9, "Stage", "Unlaced");
        // The lace colour stays hidden until the first walk, as on the card.
        assertFalse(vm.keyExistsJson(metadataJson, ".attributes[10]"));
    }

    function test_TokenUriShowsTheLacesOnceLaced() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);
        DesignTraits memory traits =
            foundingPass.artRenderer().readDesignTraits(SAMPLE_DESIGN_NUMBER);

        string memory metadataJson = decodeTokenUri(foundingPass.tokenURI(SAMPLE_DESIGN_NUMBER));

        assertTrait(metadataJson, 9, "Stage", "Laced");
        assertTrait(metadataJson, UNLACED_ATTRIBUTE_COUNT, "Laces", traits.laceColorLabel);
    }

    function test_RevertWhen_TokenUriOfAPassNotMinted() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector, SAMPLE_DESIGN_NUMBER
            )
        );
        foundingPass.tokenURI(SAMPLE_DESIGN_NUMBER);
    }

    function test_SetArtRendererSwapsEveryPictureAndAsksForARefresh() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        IFoundingPassArtRenderer newArtRenderer = new FoundingPassArtRenderer();

        vm.expectEmit(address(foundingPass));
        emit FoundingPass.ArtRendererUpdated(newArtRenderer);
        vm.expectEmit(address(foundingPass));
        emit IERC4906.BatchMetadataUpdate(1, DESIGN_COUNT);
        vm.prank(deployer);
        foundingPass.setArtRenderer(newArtRenderer);

        assertEq(address(foundingPass.artRenderer()), address(newArtRenderer));
    }

    function test_RevertWhen_SetArtRendererIsNotTheAdminOrIsZero() public {
        IFoundingPassArtRenderer newArtRenderer = new FoundingPassArtRenderer();
        expectUnauthorized(gameServer, foundingPass.DEFAULT_ADMIN_ROLE());
        vm.prank(gameServer);
        foundingPass.setArtRenderer(newArtRenderer);

        vm.expectRevert(FoundingPass.InvalidArtRenderer.selector);
        vm.prank(deployer);
        foundingPass.setArtRenderer(IFoundingPassArtRenderer(address(0)));
    }

    function test_SupportsErc721Erc5192Erc4906AndAccessControl() public view {
        assertTrue(foundingPass.supportsInterface(type(IERC165).interfaceId));
        assertTrue(foundingPass.supportsInterface(type(IERC721).interfaceId));
        assertTrue(foundingPass.supportsInterface(type(IERC721Enumerable).interfaceId));
        assertTrue(foundingPass.supportsInterface(type(IERC721Metadata).interfaceId));
        assertTrue(foundingPass.supportsInterface(type(IAccessControl).interfaceId));
        assertTrue(foundingPass.supportsInterface(type(IERC5192).interfaceId));
        assertTrue(foundingPass.supportsInterface(bytes4(0x49064906))); // ERC-4906
        assertFalse(foundingPass.supportsInterface(0xffffffff));
    }

    // ---------------------------------------------------------------------------------
    // The lost-wallet move
    // ---------------------------------------------------------------------------------

    function test_RecoveryMovesThePassWithItsRecord() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        laceFoundingPass(SAMPLE_DESIGN_NUMBER);
        PassRecord memory recordBefore = foundingPass.passOf(SAMPLE_DESIGN_NUMBER);

        vm.expectEmit(address(foundingPass));
        emit FoundingPass.FoundingPassRecovered(SAMPLE_DESIGN_NUMBER, player, newWallet);
        vm.prank(deployer);
        foundingPass.recoverFoundingPass(SAMPLE_DESIGN_NUMBER, newWallet);

        assertEq(foundingPass.ownerOf(SAMPLE_DESIGN_NUMBER), newWallet);
        assertEq(foundingPass.balanceOf(player), 0);
        assertEq(abi.encode(foundingPass.passOf(SAMPLE_DESIGN_NUMBER)), abi.encode(recordBefore));
        assertTrue(foundingPass.locked(SAMPLE_DESIGN_NUMBER));
    }

    function test_RevertWhen_RecoveryTargetsAWalletThatHoldsAPass() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);
        mintFoundingPassFor(otherPlayer, 5);

        vm.expectRevert(
            abi.encodeWithSelector(FoundingPass.FoundingPassAlreadyHeld.selector, otherPlayer)
        );
        vm.prank(deployer);
        foundingPass.recoverFoundingPass(SAMPLE_DESIGN_NUMBER, otherPlayer);
    }

    function test_RevertWhen_RecoveryCalledWithoutRecoveryRole() public {
        mintFoundingPassFor(player, SAMPLE_DESIGN_NUMBER);

        // The game server mints, but can never move a pass.
        expectUnauthorized(gameServer, foundingPass.RECOVERY_ROLE());
        vm.prank(gameServer);
        foundingPass.recoverFoundingPass(SAMPLE_DESIGN_NUMBER, newWallet);
    }

    // ---------------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------------

    function laceFoundingPass(uint256 tokenId) private {
        vm.prank(gameServer);
        foundingPass.setLaced(tokenId);
    }

    /// @dev Mints designs from 1 up, each in a new block, until one rolls a gold frame.
    function mintUntilAGoldFrame() private returns (uint256 designNumber) {
        for (designNumber = 1; designNumber <= DESIGN_COUNT; designNumber++) {
            vm.roll(vm.getBlockNumber() + 1);
            vm.prevrandao(keccak256(abi.encode("gold", designNumber)));
            mintFoundingPassFor(address(uint160(0x20000 + designNumber)), designNumber);
            if (foundingPass.passOf(designNumber).hasGoldFrame) return designNumber;
        }
        revert("No gold frame in 1,000 mints");
    }

    /// @dev The contract's own roll, to predict the event.
    function rollFor(address wallet, uint256 designNumber, uint256 founderNumber)
        private
        view
        returns (bool)
    {
        uint256 roll = uint256(
            keccak256(
                abi.encode(
                    block.prevrandao,
                    blockhash(block.number - 1),
                    designNumber,
                    founderNumber,
                    wallet
                )
            )
        );
        return roll % foundingPass.GOLD_FRAME_ODDS() == 0;
    }

    function expectUnauthorized(address account, bytes32 role) private {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, account, role
            )
        );
    }

    function assertTrait(
        string memory metadataJson,
        uint256 attributeIndex,
        string memory traitType,
        string memory value
    ) private pure {
        string memory attributePath =
            string.concat(".attributes[", vm.toString(attributeIndex), "]");
        assertEq(
            vm.parseJsonString(metadataJson, string.concat(attributePath, ".trait_type")), traitType
        );
        assertEq(vm.parseJsonString(metadataJson, string.concat(attributePath, ".value")), value);
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
