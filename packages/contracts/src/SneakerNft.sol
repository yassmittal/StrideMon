// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
    ERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice A Sneaker's stats. `SneakerGame` interprets them; this contract only stores them.
struct SneakerAttributes {
    uint16 level;
    uint16 efficiency;
    uint16 durability;
    uint16 storedEnergy;
    uint64 energyUpdatedAt;
}

/// @title SneakerNft
/// @notice The Sneaker NFT. Stats live on-chain and travel with the token; only
/// holders of `GAME_ROLE` (the `SneakerGame` contract) can mint or change them.
contract SneakerNft is ERC721Enumerable, AccessControl {
    using Strings for uint256;

    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    uint256 private constant FIRST_TOKEN_ID = 1;

    uint256 private nextTokenId = FIRST_TOKEN_ID;
    mapping(uint256 tokenId => SneakerAttributes attributes) private attributesByTokenId;

    /// @notice Emitted when a Sneaker is minted.
    event SneakerMinted(
        uint256 indexed tokenId, address indexed owner, SneakerAttributes attributes
    );

    /// @notice Emitted whenever a Sneaker's stats change.
    event SneakerAttributesUpdated(uint256 indexed tokenId, SneakerAttributes attributes);

    /// @param name ERC-721 collection name.
    /// @param symbol ERC-721 collection symbol.
    /// @param admin Receives `DEFAULT_ADMIN_ROLE` (grants `GAME_ROLE`).
    constructor(string memory name, string memory symbol, address admin) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
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

    /// @notice Base64 JSON metadata built on-chain from the stats.
    /// @param tokenId The Sneaker to describe.
    /// @return A `data:application/json;base64,…` URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        SneakerAttributes memory attributes = attributesByTokenId[tokenId];
        // TODO(phase-8): add the on-chain SVG `image`.
        string memory metadataJson = string.concat(
            '{"name":"',
            name(),
            " #",
            tokenId.toString(),
            '","description":"A StrideMon Sneaker. Walk or run with it to earn SOLE.",',
            '"attributes":[',
            buildNumberTrait("Level", attributes.level),
            ",",
            buildNumberTrait("Efficiency", attributes.efficiency),
            ",",
            buildNumberTrait("Durability", attributes.durability),
            "]}"
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(metadataJson)));
    }

    /// @inheritdoc ERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
