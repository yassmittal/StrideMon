// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
    ERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice A Sneaker's stats. `SneakerGame` interprets them; this contract only stores them.
struct SneakerAttributes {
    uint16 level;
    uint16 efficiency;
    uint16 durability;
    uint16 storedEnergy;
    uint64 energyUpdatedAt;
}

/// @notice Draws a Sneaker's picture. Swappable, so the art can change without redeploying
/// `SneakerNft` (D-030).
interface ISneakerArtRenderer {
    /// @notice The Sneaker's picture as an SVG document.
    /// @param tokenId The Sneaker's id.
    /// @param attributes The Sneaker's stored stats.
    /// @return The SVG markup.
    function renderImageSvg(uint256 tokenId, SneakerAttributes calldata attributes)
        external
        view
        returns (string memory);
}

/// @title SneakerNft
/// @notice The Sneaker NFT. Stats live on-chain and travel with the token; only
/// holders of `GAME_ROLE` (the `SneakerGame` contract) can mint or change them.
contract SneakerNft is ERC721Enumerable, AccessControl, IERC4906 {
    using Strings for uint256;

    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    uint256 private constant FIRST_TOKEN_ID = 1;
    bytes4 private constant ERC4906_INTERFACE_ID = 0x49064906;

    /// @notice Draws the `image` in `tokenURI` and `imageSvg`.
    ISneakerArtRenderer public artRenderer;

    uint256 private nextTokenId = FIRST_TOKEN_ID;
    mapping(uint256 tokenId => SneakerAttributes attributes) private attributesByTokenId;

    /// @notice Emitted when a Sneaker is minted.
    event SneakerMinted(
        uint256 indexed tokenId, address indexed owner, SneakerAttributes attributes
    );

    /// @notice Emitted whenever a Sneaker's stats change.
    event SneakerAttributesUpdated(uint256 indexed tokenId, SneakerAttributes attributes);

    /// @notice Emitted when the admin points `artRenderer` at a new renderer.
    event ArtRendererUpdated(ISneakerArtRenderer artRenderer);

    /// @notice The art renderer can't be the zero address.
    error InvalidArtRenderer();

    /// @param name ERC-721 collection name.
    /// @param symbol ERC-721 collection symbol.
    /// @param admin Receives `DEFAULT_ADMIN_ROLE` (grants `GAME_ROLE`, swaps the art renderer).
    /// @param initialArtRenderer Draws every Sneaker's picture.
    constructor(
        string memory name,
        string memory symbol,
        address admin,
        ISneakerArtRenderer initialArtRenderer
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        updateArtRenderer(initialArtRenderer);
    }

    /// @notice Mints a new Sneaker with the given stats.
    /// @param to Owner of the new Sneaker.
    /// @param attributes Initial stats.
    /// @return tokenId The new Sneaker's id (ids start at 1).
    function mint(address to, SneakerAttributes calldata attributes)
        external
        onlyRole(GAME_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId++;
        attributesByTokenId[tokenId] = attributes;
        // `_mint`, not `_safeMint`: no receiver callback, so no external call in the mint path.
        _mint(to, tokenId);
        emit SneakerMinted(tokenId, to, attributes);
    }

    /// @notice Replaces a Sneaker's stats. The only way stats change.
    /// @param tokenId The Sneaker to update.
    /// @param attributes The new stats.
    function setAttributes(uint256 tokenId, SneakerAttributes calldata attributes)
        external
        onlyRole(GAME_ROLE)
    {
        _requireOwned(tokenId);
        attributesByTokenId[tokenId] = attributes;
        emit SneakerAttributesUpdated(tokenId, attributes);
        emit MetadataUpdate(tokenId);
    }

    /// @notice Points every Sneaker's picture at a new renderer. Stats and owners don't change.
    /// @param newArtRenderer The renderer to use from now on.
    function setArtRenderer(ISneakerArtRenderer newArtRenderer)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        updateArtRenderer(newArtRenderer);
        if (nextTokenId > FIRST_TOKEN_ID) {
            emit BatchMetadataUpdate(FIRST_TOKEN_ID, nextTokenId - 1);
        }
    }

    /// @notice Raw stored stats. Energy here is not regenerated; use `SneakerGame.currentEnergy`.
    /// @param tokenId The Sneaker to read.
    /// @return attributes The stored stats.
    function getAttributes(uint256 tokenId)
        external
        view
        returns (SneakerAttributes memory attributes)
    {
        _requireOwned(tokenId);
        return attributesByTokenId[tokenId];
    }

    /// @notice The Sneaker's picture, as raw SVG markup (what the app draws).
    /// @param tokenId The Sneaker to draw.
    /// @return The SVG document.
    function imageSvg(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        return artRenderer.renderImageSvg(tokenId, attributesByTokenId[tokenId]);
    }

    /// @notice Base64 JSON metadata built on-chain from the stats, with the SVG as its `image`.
    /// @param tokenId The Sneaker to describe.
    /// @return A `data:application/json;base64,…` URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory metadataJson = string.concat(
            '{"name":"',
            name(),
            " #",
            tokenId.toString(),
            '","description":"A StrideMon Sneaker. Walk or run with it to earn SOLE.",',
            '"image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(imageSvg(tokenId))),
            '","attributes":',
            buildAttributeTraits(attributesByTokenId[tokenId]),
            "}"
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(metadataJson)));
    }

    /// @inheritdoc ERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, AccessControl, IERC165)
        returns (bool)
    {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    function updateArtRenderer(ISneakerArtRenderer newArtRenderer) private {
        if (address(newArtRenderer) == address(0)) revert InvalidArtRenderer();
        artRenderer = newArtRenderer;
        emit ArtRendererUpdated(newArtRenderer);
    }

    function buildAttributeTraits(SneakerAttributes memory attributes)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            "[",
            buildNumberTrait("Level", attributes.level),
            ",",
            buildNumberTrait("Efficiency", attributes.efficiency),
            ",",
            buildNumberTrait("Durability", attributes.durability),
            "]"
        );
    }

    function buildNumberTrait(string memory traitType, uint256 value)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '{"trait_type":"',
            traitType,
            '","display_type":"number","value":',
            value.toString(),
            "}"
        );
    }
}
