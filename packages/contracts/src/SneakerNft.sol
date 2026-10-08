// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
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
    /// @param foundingPassTokenId A Founder Sneaker's pass, or 0 for a normal Sneaker (D-042).
    /// @return The SVG markup.
    function renderImageSvg(
        uint256 tokenId,
        SneakerAttributes calldata attributes,
        uint256 foundingPassTokenId
    ) external view returns (string memory);
}

/// @title SneakerNft
/// @notice The Sneaker NFT. Stats live on-chain and travel with the token; only
/// holders of `GAME_ROLE` (the `SneakerGame` contract) can mint or change them. A Founder
/// Sneaker (D-041, D-042) is a Sneaker that remembers its Founding Pass: one per pass, and it
/// can't be sent or sold.
contract SneakerNft is ERC721Enumerable, AccessControl, IERC4906 {
    using Strings for uint256;

    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    uint256 private constant FIRST_TOKEN_ID = 1;
    bytes4 private constant ERC4906_INTERFACE_ID = 0x49064906;

    string private constant SNEAKER_DESCRIPTION =
        "A StrideMon Sneaker. Walk or run with it to earn STRIDE.";
    string private constant FOUNDER_SNEAKER_DESCRIPTION =
        "A StrideMon Founder Sneaker, drawn in its Founding Pass's design. Walk or run with it to earn STRIDE. It stays with its founder: it can't be sent or sold.";

    /// @notice Draws the `image` in `tokenURI` and `imageSvg`.
    ISneakerArtRenderer public artRenderer;

    uint256 private nextTokenId = FIRST_TOKEN_ID;
    mapping(uint256 tokenId => SneakerAttributes attributes) private attributesByTokenId;

    /// @notice A Founder Sneaker's Founding Pass, or 0 for a normal Sneaker.
    mapping(uint256 sneakerTokenId => uint256 foundingPassTokenId) public foundingPassTokenIdOf;

    /// @notice A Founding Pass's one Founder Sneaker, or 0 until it's minted.
    mapping(uint256 foundingPassTokenId => uint256 sneakerTokenId) public founderSneakerTokenIdOf;

    /// @notice Emitted when a Sneaker is minted.
    event SneakerMinted(
        uint256 indexed tokenId, address indexed owner, SneakerAttributes attributes
    );

    /// @notice Emitted whenever a Sneaker's stats change.
    event SneakerAttributesUpdated(uint256 indexed tokenId, SneakerAttributes attributes);

    /// @notice Emitted when the admin points `artRenderer` at a new renderer.
    event ArtRendererUpdated(ISneakerArtRenderer artRenderer);

    /// @notice Emitted when a Founder Sneaker is minted, after `SneakerMinted`.
    event FounderSneakerMinted(uint256 indexed tokenId, uint256 indexed foundingPassTokenId);

    /// @notice Emitted when the lost-wallet move takes a Founder Sneaker to its pass's new wallet.
    event FounderSneakerMoved(
        uint256 indexed tokenId, address indexed previousOwner, address indexed newOwner
    );

    /// @notice The art renderer can't be the zero address.
    error InvalidArtRenderer();
    /// @notice 0 means "no pass", so it can't be a Founder Sneaker's pass.
    error InvalidFoundingPassTokenId();
    /// @notice This pass already has its one Founder Sneaker.
    error FounderSneakerAlreadyMinted(uint256 foundingPassTokenId);
    /// @notice Founder Sneakers stay with their founder: they can't be sent, sold or approved.
    error FounderSneakerNotTransferable(uint256 tokenId);
    /// @notice Only a Founder Sneaker can be moved by the lost-wallet move.
    error NotFounderSneaker(uint256 tokenId);

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
        return mintSneaker(to, attributes);
    }

    /// @notice Mints a Founding Pass's one Founder Sneaker, which can't be sent or sold.
    /// @param to Owner of the new Sneaker: the pass holder.
    /// @param attributes Initial stats.
    /// @param foundingPassTokenId The pass it belongs to.
    /// @return tokenId The new Sneaker's id.
    function mintFounderSneaker(
        address to,
        SneakerAttributes calldata attributes,
        uint256 foundingPassTokenId
    ) external onlyRole(GAME_ROLE) returns (uint256 tokenId) {
        if (foundingPassTokenId == 0) {
            revert InvalidFoundingPassTokenId();
        }
        if (founderSneakerTokenIdOf[foundingPassTokenId] != 0) {
            revert FounderSneakerAlreadyMinted(foundingPassTokenId);
        }
        tokenId = mintSneaker(to, attributes);
        foundingPassTokenIdOf[tokenId] = foundingPassTokenId;
        founderSneakerTokenIdOf[foundingPassTokenId] = tokenId;
        emit FounderSneakerMinted(tokenId, foundingPassTokenId);
    }

    /// @notice The lost-wallet move for a Founder Sneaker (D-041): stats intact.
    /// `SneakerGame.recoverFounderSneaker` only ever moves it to its pass's holder.
    /// @param tokenId The Founder Sneaker to move.
    /// @param newOwner Its pass's new holder.
    function moveFounderSneaker(uint256 tokenId, address newOwner) external onlyRole(GAME_ROLE) {
        if (foundingPassTokenIdOf[tokenId] == 0) revert NotFounderSneaker(tokenId);
        address previousOwner = _requireOwned(tokenId);
        _transfer(previousOwner, newOwner, tokenId);
        emit FounderSneakerMoved(tokenId, previousOwner, newOwner);
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
        return artRenderer.renderImageSvg(
            tokenId, attributesByTokenId[tokenId], foundingPassTokenIdOf[tokenId]
        );
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
            '","description":"',
            foundingPassTokenIdOf[tokenId] == 0 ? SNEAKER_DESCRIPTION : FOUNDER_SNEAKER_DESCRIPTION,
            '","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(imageSvg(tokenId))),
            '","attributes":',
            buildAttributeTraits(attributesByTokenId[tokenId], foundingPassTokenIdOf[tokenId]),
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

    /// @notice Refused for a Founder Sneaker, which can't be sent. Normal Sneakers as ERC-721.
    /// @param to The address to approve.
    /// @param tokenId The Sneaker.
    function approve(address to, uint256 tokenId) public override(ERC721, IERC721) {
        if (foundingPassTokenIdOf[tokenId] != 0) revert FounderSneakerNotTransferable(tokenId);
        super.approve(to, tokenId);
    }

    /// @dev Mints and `moveFounderSneaker` pass no `auth`. Every transfer a holder or an operator
    /// starts passes one, and a Founder Sneaker refuses it.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        if (auth != address(0) && foundingPassTokenIdOf[tokenId] != 0) {
            revert FounderSneakerNotTransferable(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function mintSneaker(address to, SneakerAttributes calldata attributes)
        private
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId++;
        attributesByTokenId[tokenId] = attributes;
        // `_mint`, not `_safeMint`: no receiver callback, so no external call in the mint path.
        _mint(to, tokenId);
        emit SneakerMinted(tokenId, to, attributes);
    }

    function updateArtRenderer(ISneakerArtRenderer newArtRenderer) private {
        if (address(newArtRenderer) == address(0)) revert InvalidArtRenderer();
        artRenderer = newArtRenderer;
        emit ArtRendererUpdated(newArtRenderer);
    }

    /// @dev A Founder Sneaker adds its pass's number.
    function buildAttributeTraits(SneakerAttributes memory attributes, uint256 foundingPassTokenId)
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
            foundingPassTokenId == 0
                ? ""
                : string.concat(",", buildNumberTrait("Founding Pass", foundingPassTokenId)),
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
