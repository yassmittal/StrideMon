// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    IERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {Test} from "forge-std/Test.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {ISneakerArtRenderer, SneakerAttributes, SneakerNft} from "../src/SneakerNft.sol";

contract SneakerNftTest is Test {
    string private constant JSON_DATA_URI_PREFIX = "data:application/json;base64,";
    string private constant SVG_DATA_URI_PREFIX = "data:image/svg+xml;base64,";

    address private admin = makeAddr("admin");
    address private game = makeAddr("game");
    address private player = makeAddr("player");
    address private otherPlayer = makeAddr("otherPlayer");

    SneakerNft private sneakerNft;

    function setUp() public {
        sneakerNft = new SneakerNft("StrideMon Sneaker", "SNEAKER", admin, new SneakerArtRenderer());
        bytes32 gameRole = sneakerNft.GAME_ROLE();
        vm.prank(admin);
        sneakerNft.grantRole(gameRole, game);
    }

    function test_ConstructorSetsNameSymbolAndAdmin() public view {
        assertEq(sneakerNft.name(), "StrideMon Sneaker");
        assertEq(sneakerNft.symbol(), "SNEAKER");
        assertTrue(sneakerNft.hasRole(sneakerNft.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_MintStoresAttributesAndStartsIdsAtOne() public {
        SneakerAttributes memory attributes = buildAttributes(1, 10, 100);

        vm.expectEmit(address(sneakerNft));
        emit SneakerNft.SneakerMinted(1, player, attributes);
        vm.prank(game);
        uint256 tokenId = sneakerNft.mint(player, attributes);

        assertEq(tokenId, 1);
        assertEq(sneakerNft.ownerOf(tokenId), player);
        assertEq(abi.encode(sneakerNft.getAttributes(tokenId)), abi.encode(attributes));
    }

    function test_MintIncrementsIdsAndEnumeratesByOwner() public {
        vm.startPrank(game);
        uint256 firstTokenId = sneakerNft.mint(player, buildAttributes(1, 10, 100));
        uint256 secondTokenId = sneakerNft.mint(otherPlayer, buildAttributes(1, 10, 100));
        uint256 thirdTokenId = sneakerNft.mint(player, buildAttributes(1, 10, 100));
        vm.stopPrank();

        assertEq(secondTokenId, firstTokenId + 1);
        assertEq(thirdTokenId, secondTokenId + 1);
        assertEq(sneakerNft.balanceOf(player), 2);
        assertEq(sneakerNft.tokenOfOwnerByIndex(player, 0), firstTokenId);
        assertEq(sneakerNft.tokenOfOwnerByIndex(player, 1), thirdTokenId);
        assertEq(sneakerNft.totalSupply(), 3);
    }

    function test_RevertWhen_MintCalledWithoutGameRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                player,
                sneakerNft.GAME_ROLE()
            )
        );
        vm.prank(player);
        sneakerNft.mint(player, buildAttributes(1, 10, 100));
    }

    function test_SetAttributesReplacesStats() public {
        uint256 tokenId = mintSneaker(player);
        SneakerAttributes memory newAttributes = buildAttributes(2, 12, 97);

        vm.expectEmit(address(sneakerNft));
        emit SneakerNft.SneakerAttributesUpdated(tokenId, newAttributes);
        vm.expectEmit(address(sneakerNft));
        emit IERC4906.MetadataUpdate(tokenId);
        vm.prank(game);
        sneakerNft.setAttributes(tokenId, newAttributes);

        assertEq(abi.encode(sneakerNft.getAttributes(tokenId)), abi.encode(newAttributes));
    }

    function test_RevertWhen_SetAttributesCalledWithoutGameRole() public {
        uint256 tokenId = mintSneaker(player);

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                player,
                sneakerNft.GAME_ROLE()
            )
        );
        vm.prank(player);
        sneakerNft.setAttributes(tokenId, buildAttributes(30, 255, 100));
    }

    function test_RevertWhen_SetAttributesOnNonexistentSneaker() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 42));
        vm.prank(game);
        sneakerNft.setAttributes(42, buildAttributes(1, 10, 100));
    }

    function test_RevertWhen_GetAttributesOfNonexistentSneaker() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 42));
        sneakerNft.getAttributes(42);
    }

    function test_AttributesTravelWithTheSneakerOnTransfer() public {
        uint256 tokenId = mintSneaker(player);
        SneakerAttributes memory attributesBefore = sneakerNft.getAttributes(tokenId);

        vm.prank(player);
        sneakerNft.transferFrom(player, otherPlayer, tokenId);

        assertEq(sneakerNft.ownerOf(tokenId), otherPlayer);
        assertEq(abi.encode(sneakerNft.getAttributes(tokenId)), abi.encode(attributesBefore));
        assertEq(sneakerNft.tokenOfOwnerByIndex(otherPlayer, 0), tokenId);
    }

    function test_TokenUriIsBase64JsonWithStatTraits() public {
        uint256 tokenId = mintSneaker(player);

        string memory tokenUri = sneakerNft.tokenURI(tokenId);
        string memory metadataJson = decodeTokenUri(tokenUri);

        assertEq(vm.indexOf(tokenUri, JSON_DATA_URI_PREFIX), 0);
        assertEq(vm.parseJsonString(metadataJson, ".name"), "StrideMon Sneaker #1");
        assertEq(vm.parseJsonString(metadataJson, ".attributes[0].trait_type"), "Level");
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[0].value"), 1);
        assertEq(vm.parseJsonString(metadataJson, ".attributes[1].trait_type"), "Efficiency");
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[1].value"), 10);
        assertEq(vm.parseJsonString(metadataJson, ".attributes[2].trait_type"), "Durability");
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[2].value"), 100);
        assertFalse(vm.keyExistsJson(metadataJson, ".attributes[3]"));
    }

    function test_TokenUriReflectsUpdatedAttributes() public {
        uint256 tokenId = mintSneaker(player);
        vm.prank(game);
        sneakerNft.setAttributes(tokenId, buildAttributes(2, 12, 97));

        string memory metadataJson = decodeTokenUri(sneakerNft.tokenURI(tokenId));

        assertEq(vm.parseJsonUint(metadataJson, ".attributes[0].value"), 2);
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[1].value"), 12);
        assertEq(vm.parseJsonUint(metadataJson, ".attributes[2].value"), 97);
    }

    function test_TokenUriImageIsTheRenderedSvg() public {
        uint256 tokenId = mintSneaker(player);

        string memory metadataJson = decodeTokenUri(sneakerNft.tokenURI(tokenId));
        string memory svg = sneakerNft.imageSvg(tokenId);

        assertEq(
            vm.parseJsonString(metadataJson, ".image"),
            string.concat(SVG_DATA_URI_PREFIX, Base64.encode(bytes(svg)))
        );
        assertEq(vm.indexOf(svg, "<svg "), 0);
    }

    function test_SetArtRendererSwapsEveryPictureAndAsksForARefresh() public {
        mintSneaker(player);
        mintSneaker(otherPlayer);
        ISneakerArtRenderer newArtRenderer = new FixedArtRenderer();

        vm.expectEmit(address(sneakerNft));
        emit SneakerNft.ArtRendererUpdated(newArtRenderer);
        vm.expectEmit(address(sneakerNft));
        emit IERC4906.BatchMetadataUpdate(1, 2);
        vm.prank(admin);
        sneakerNft.setArtRenderer(newArtRenderer);

        assertEq(sneakerNft.imageSvg(2), "<svg/>");
    }

    function test_RevertWhen_SetArtRendererCalledWithoutAdminRole() public {
        ISneakerArtRenderer newArtRenderer = new FixedArtRenderer();
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                game,
                sneakerNft.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(game);
        sneakerNft.setArtRenderer(newArtRenderer);
    }

    function test_RevertWhen_ArtRendererIsTheZeroAddress() public {
        vm.expectRevert(SneakerNft.InvalidArtRenderer.selector);
        vm.prank(admin);
        sneakerNft.setArtRenderer(ISneakerArtRenderer(address(0)));
    }

    function test_RevertWhen_TokenUriOfNonexistentSneaker() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 42));
        sneakerNft.tokenURI(42);
    }

    function test_SupportsErc721EnumerableMetadataAndAccessControl() public view {
        assertTrue(sneakerNft.supportsInterface(type(IERC165).interfaceId));
        assertTrue(sneakerNft.supportsInterface(type(IERC721).interfaceId));
        assertTrue(sneakerNft.supportsInterface(type(IERC721Enumerable).interfaceId));
        assertTrue(sneakerNft.supportsInterface(type(IERC721Metadata).interfaceId));
        assertTrue(sneakerNft.supportsInterface(type(IAccessControl).interfaceId));
        assertTrue(sneakerNft.supportsInterface(bytes4(0x49064906))); // ERC-4906
        assertFalse(sneakerNft.supportsInterface(0xffffffff));
    }

    function mintSneaker(address owner) private returns (uint256 tokenId) {
        vm.prank(game);
        return sneakerNft.mint(owner, buildAttributes(1, 10, 100));
    }

    function buildAttributes(uint16 level, uint16 efficiency, uint16 durability)
        private
        view
        returns (SneakerAttributes memory)
    {
        return SneakerAttributes({
            level: level,
            efficiency: efficiency,
            durability: durability,
            storedEnergy: 10,
            energyUpdatedAt: uint64(block.timestamp)
        });
    }

    function decodeTokenUri(string memory tokenUri) private pure returns (string memory) {
        bytes memory tokenUriBytes = bytes(tokenUri);
        uint256 prefixLength = bytes(JSON_DATA_URI_PREFIX).length;
        bytes memory encodedJson = new bytes(tokenUriBytes.length - prefixLength);
        for (uint256 i; i < encodedJson.length; i++) {
            encodedJson[i] = tokenUriBytes[prefixLength + i];
        }
        return string(Base64.decode(string(encodedJson)));
    }
}

/// @dev A stand-in renderer, to tell a swapped picture apart from the real one.
contract FixedArtRenderer is ISneakerArtRenderer {
    function renderImageSvg(uint256, SneakerAttributes calldata)
        external
        pure
        returns (string memory)
    {
        return "<svg/>";
    }
}
