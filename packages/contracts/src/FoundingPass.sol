// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    ERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    DesignLayers,
    DesignTraits,
    PassRecord,
    Rarity,
    SneakerOutline
} from "./founding-pass-art/FoundingPassArtTypes.sol";

/// @notice ERC-5192: a token bound to its owner. Wallets and explorers read `locked` to tell
/// it can't be sent.
interface IERC5192 {
    /// @notice Emitted when a token becomes locked (at mint, for a pass).
    event Locked(uint256 tokenId);

    /// @notice Emitted when a token becomes unlocked (never, for a pass).
    event Unlocked(uint256 tokenId);

    /// @notice Whether the token is locked to its owner.
    /// @param tokenId The token to check. Reverts if it doesn't exist.
    function locked(uint256 tokenId) external view returns (bool);
}

/// @notice Draws the Founding Pass art (D-041). Swappable, like the Sneaker's (D-030):
/// `FoundingPassArtRenderer` is the first. The Founder Sneaker's picture reads it too (D-042).
interface IFoundingPassArtRenderer {
    /// @notice A design's card as the gallery shows it, before anyone mints it.
    /// @param designNumber 1 to 1,000.
    function renderDesignPreviewSvg(uint256 designNumber) external view returns (string memory);

    /// @notice A minted pass's card.
    /// @param tokenId The pass, which is its design number.
    /// @param passRecord What the mint added: founder number, frame, laced.
    function renderPassSvg(uint256 tokenId, PassRecord calldata passRecord)
        external
        view
        returns (string memory);

    /// @notice The shoe alone, in its 1000 × 600 space with the ground at y = 520.
    /// @param layers The design's layers.
    /// @param isLaced Lace slats, or eyelets before the first walk.
    /// @param clipPathId Unique on the page that shows the markup.
    function renderSneakerMarkup(
        DesignLayers calldata layers,
        bool isLaced,
        string calldata clipPathId
    ) external view returns (string memory);

    /// @notice A template's outer edge and top, for a picture that draws a rim round the shoe.
    /// @param templateIndex `DesignLayers.templateIndex`.
    function readSneakerOutline(uint256 templateIndex) external view returns (SneakerOutline memory);

    /// @notice A design's layers.
    /// @param designNumber 1 to 1,000.
    function readDesignLayers(uint256 designNumber) external view returns (DesignLayers memory);

    /// @notice A design's name: "Ember Runner Dusk", or a Legendary's hand-picked one.
    /// @param designNumber 1 to 1,000.
    function readDesignName(uint256 designNumber) external view returns (string memory);

    /// @notice A design's layers in words, for the attributes.
    /// @param designNumber 1 to 1,000.
    function readDesignTraits(uint256 designNumber) external view returns (DesignTraits memory);
}

/// @title FoundingPass
/// @notice The 1,000 Founding Passes (D-041): one-of-one, free, early access to StrideMon, each
/// with a Founder Sneaker in the same design. The token id is the design number. A pass can't
/// be sent or sold: only the admin's lost-wallet move (`RECOVERY_ROLE`) moves one. Its own
/// contract, so a game redeploy never touches the founders.
contract FoundingPass is ERC721Enumerable, AccessControl, IERC4906, IERC5192 {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");

    /// @notice How many designs there are, numbered 1 to 1,000. Each can be minted once.
    uint256 public constant DESIGN_COUNT = 1000;
    /// @notice About 1 pass in this many rolls a gold frame at mint. Cosmetic.
    uint256 public constant GOLD_FRAME_ODDS = 10;

    uint256 private constant FIRST_DESIGN_NUMBER = 1;
    uint256 private constant BITS_PER_BITMAP_WORD = 256;
    uint256 private constant DESIGN_NUMBER_DIGITS = 4;
    bytes4 private constant ERC4906_INTERFACE_ID = 0x49064906;
    bytes4 private constant ERC5192_INTERFACE_ID = 0xb45a3c0e;

    /// @dev The brief's line for every surface with the pass (§9), in plain words.
    string private constant DESCRIPTION =
        "One of 1,000 one-of-one Founding Passes: early access to StrideMon, a move-to-earn game on Monad, and a Founder Sneaker drawn in the same design. Free. It can't be sent or sold. It isn't a token and never turns into one.";

    /// @notice Draws `imageSvg` and the `image` in `tokenURI`.
    IFoundingPassArtRenderer public artRenderer;

    /// @notice Passes minted so far. The next founder number is one more.
    uint256 public mintedCount;

    mapping(uint256 tokenId => PassRecord passRecord) private passRecordByTokenId;
    /// @dev Bit n is design n, so bit 0 is never set: 1,024 bits for the 1,000 designs.
    uint256[4] private mintedBitmapWords;

    /// @notice Emitted when a pass is minted.
    event FoundingPassMinted(
        uint256 indexed tokenId, address indexed owner, uint256 founderNumber, bool hasGoldFrame
    );

    /// @notice Emitted once, when a pass is laced after its holder's first settled walk.
    event FoundingPassLaced(uint256 indexed tokenId);

    /// @notice Emitted when the admin moves a pass to a founder's new wallet.
    event FoundingPassRecovered(
        uint256 indexed tokenId, address indexed previousOwner, address indexed newOwner
    );

    /// @notice Emitted when the admin points `artRenderer` at a new renderer.
    event ArtRendererUpdated(IFoundingPassArtRenderer artRenderer);

    /// @notice There's no design with this number (designs are 1 to 1,000).
    error InvalidDesign(uint256 designNumber);
    /// @notice Someone already minted this design.
    error PassAlreadyMinted(uint256 designNumber);
    /// @notice This wallet already holds a pass: one per wallet.
    error FoundingPassAlreadyHeld(address wallet);
    /// @notice The pass is laced already: it happens once.
    error FoundingPassAlreadyLaced(uint256 tokenId);
    /// @notice A pass can't be sent, sold or approved.
    error FoundingPassIsSoulbound();
    /// @notice The art renderer can't be the zero address.
    error InvalidArtRenderer();

    /// @param name ERC-721 collection name.
    /// @param symbol ERC-721 collection symbol.
    /// @param admin Receives `DEFAULT_ADMIN_ROLE` (grants the roles, swaps the art renderer).
    /// @param initialArtRenderer Draws every pass.
    constructor(
        string memory name,
        string memory symbol,
        address admin,
        IFoundingPassArtRenderer initialArtRenderer
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        updateArtRenderer(initialArtRenderer);
    }

    /// @notice Mints a design's one pass: records the founder number (the mint order) and rolls
    /// the gold frame.
    /// @param to The founder's wallet, which mustn't hold a pass yet.
    /// @param designNumber 1 to 1,000, not minted yet. It becomes the token id.
    /// @return passRecord The new pass's founder number and frame (not laced).
    function mint(address to, uint256 designNumber)
        external
        onlyRole(MINTER_ROLE)
        returns (PassRecord memory passRecord)
    {
        if (designNumber < FIRST_DESIGN_NUMBER || designNumber > DESIGN_COUNT) {
            revert InvalidDesign(designNumber);
        }
        if (_ownerOf(designNumber) != address(0)) revert PassAlreadyMinted(designNumber);
        if (balanceOf(to) != 0) revert FoundingPassAlreadyHeld(to);

        uint256 founderNumber = ++mintedCount;
        // casting to 'uint32' is safe because there are at most 1,000 founders
        // forge-lint: disable-next-line(unsafe-typecast)
        passRecord.founderNumber = uint32(founderNumber);
        passRecord.hasGoldFrame = rollGoldFrame(to, designNumber, founderNumber);
        passRecordByTokenId[designNumber] = passRecord;
        mintedBitmapWords[designNumber / BITS_PER_BITMAP_WORD] |= 1
            << (designNumber % BITS_PER_BITMAP_WORD);
        // `_mint`, not `_safeMint`: no receiver callback, so no external call in the mint path.
        _mint(to, designNumber);
        emit Locked(designNumber);
        emit FoundingPassMinted(designNumber, to, founderNumber, passRecord.hasGoldFrame);
    }

    /// @notice Laces a pass after its holder's first settled walk. Its card and its Founder
    /// Sneaker's picture both change (D-042). Once only.
    /// @param tokenId The pass to lace.
    function setLaced(uint256 tokenId) external onlyRole(MINTER_ROLE) {
        _requireOwned(tokenId);
        if (passRecordByTokenId[tokenId].isLaced) revert FoundingPassAlreadyLaced(tokenId);
        passRecordByTokenId[tokenId].isLaced = true;
        emit FoundingPassLaced(tokenId);
        emit MetadataUpdate(tokenId);
    }

    /// @notice The lost-wallet move (D-041): moves a pass to its founder's new wallet, by hand,
    /// after support checks a code sent to the pass's email. The record stays with the pass.
    /// `SneakerGame.recoverFounderSneaker` then moves its Founder Sneaker after it.
    /// @param tokenId The pass to move.
    /// @param newOwner The founder's new wallet, which mustn't hold a pass.
    function recoverFoundingPass(uint256 tokenId, address newOwner)
        external
        onlyRole(RECOVERY_ROLE)
    {
        address previousOwner = _requireOwned(tokenId);
        if (balanceOf(newOwner) != 0) revert FoundingPassAlreadyHeld(newOwner);
        _transfer(previousOwner, newOwner, tokenId);
        emit FoundingPassRecovered(tokenId, previousOwner, newOwner);
    }

    /// @notice Points every pass's picture at a new renderer. Records and owners don't change.
    /// @param newArtRenderer The renderer to use from now on.
    function setArtRenderer(IFoundingPassArtRenderer newArtRenderer)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        updateArtRenderer(newArtRenderer);
        if (mintedCount > 0) emit BatchMetadataUpdate(FIRST_DESIGN_NUMBER, DESIGN_COUNT);
    }

    /// @notice What the mint added to a pass: founder number, gold frame, laced. The design
    /// itself comes from the art renderer.
    /// @param tokenId The pass to read.
    /// @return The pass's record.
    function passOf(uint256 tokenId) external view returns (PassRecord memory) {
        _requireOwned(tokenId);
        return passRecordByTokenId[tokenId];
    }

    /// @notice Which designs are minted, in one call: bit n of the 1,024 is design n.
    /// @return Four words, design n in word n / 256 at bit n % 256.
    function mintedBitmap() external view returns (uint256[4] memory) {
        return mintedBitmapWords;
    }

    /// @notice Always true: a pass can't be sent or sold (ERC-5192).
    /// @param tokenId The pass to check. Reverts if it doesn't exist.
    function locked(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    /// @notice Refused: a pass can't be sent or sold, so nobody can be approved to send it.
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert FoundingPassIsSoulbound();
    }

    /// @notice Refused: a pass can't be sent or sold, so nobody can be approved to send it.
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert FoundingPassIsSoulbound();
    }

    /// @notice The pass's card, as raw SVG markup (what the app and the website draw).
    /// @param tokenId The pass to draw.
    /// @return The SVG document.
    function imageSvg(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        return artRenderer.renderPassSvg(tokenId, passRecordByTokenId[tokenId]);
    }

    /// @notice Base64 JSON metadata built on-chain, with the card as its `image`.
    /// @param tokenId The pass to describe.
    /// @return A `data:application/json;base64,…` URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory passName = string.concat(
            "Founding Pass #",
            padWithZeros(tokenId, DESIGN_NUMBER_DIGITS),
            " ",
            artRenderer.readDesignName(tokenId)
        );
        string memory metadataJson = string.concat(
            '{"name":"',
            passName,
            '","description":"',
            DESCRIPTION,
            '","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(imageSvg(tokenId))),
            '","attributes":',
            buildAttributeTraits(tokenId),
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
        return interfaceId == ERC4906_INTERFACE_ID || interfaceId == ERC5192_INTERFACE_ID
            || super.supportsInterface(interfaceId);
    }

    /// @dev Only a mint and `recoverFoundingPass` move a pass, and neither passes an `auth`.
    /// Every transfer a holder or an operator starts passes one, so it's refused.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        if (auth != address(0)) revert FoundingPassIsSoulbound();
        return super._update(to, tokenId, auth);
    }

    function updateArtRenderer(IFoundingPassArtRenderer newArtRenderer) private {
        if (address(newArtRenderer) == address(0)) revert InvalidArtRenderer();
        artRenderer = newArtRenderer;
        emit ArtRendererUpdated(newArtRenderer);
    }

    /// @dev About 1 in 10, from the block and the mint itself (D-042). Predictable by whoever
    /// sends the mint, but only the game server mints, and the frame is cosmetic.
    function rollGoldFrame(address to, uint256 designNumber, uint256 founderNumber)
        private
        view
        returns (bool)
    {
        bytes memory rollInput = abi.encode(
            block.prevrandao, blockhash(block.number - 1), designNumber, founderNumber, to
        );
        // A cosmetic roll that only the game server can trigger (D-042), so weak is fine.
        // forge-lint: disable-next-line(weak-prng)
        return uint256(keccak256(rollInput)) % GOLD_FRAME_ODDS == 0;
    }

    /// @dev Template, family, colourway, each option, rarity, founder number, frame and stage,
    /// plus the lace colour once laced: it's hidden until then, as on the card.
    function buildAttributeTraits(uint256 tokenId) private view returns (string memory) {
        DesignTraits memory traits = artRenderer.readDesignTraits(tokenId);
        PassRecord memory passRecord = passRecordByTokenId[tokenId];
        string memory layerTraits = string.concat(
            buildTextTrait("Template", traits.templateLabel),
            ",",
            buildTextTrait("Family", traits.colorFamilyLabel),
            ",",
            buildTextTrait("Colourway", traits.colorwayLabel),
            ",",
            buildOptionTraits(traits),
            ",",
            buildTextTrait("Rarity", formatRarity(traits.rarity))
        );
        string memory passTraits = string.concat(
            buildNumberTrait("Founder number", passRecord.founderNumber),
            ",",
            buildTextTrait("Frame", passRecord.hasGoldFrame ? "Gold" : "Plain"),
            ",",
            buildTextTrait("Stage", passRecord.isLaced ? "Laced" : "Unlaced"),
            passRecord.isLaced
                ? string.concat(",", buildTextTrait("Laces", traits.laceColorLabel))
                : ""
        );
        return string.concat("[", layerTraits, ",", passTraits, "]");
    }

    function buildOptionTraits(DesignTraits memory traits)
        private
        pure
        returns (string memory optionTraits)
    {
        for (uint256 slotIndex = 0; slotIndex < traits.optionSlotLabels.length; slotIndex++) {
            optionTraits = string.concat(
                optionTraits,
                slotIndex == 0 ? "" : ",",
                buildTextTrait(
                    traits.optionSlotLabels[slotIndex], traits.optionValueLabels[slotIndex]
                )
            );
        }
    }

    function buildTextTrait(string memory traitType, string memory value)
        private
        pure
        returns (string memory)
    {
        return string.concat('{"trait_type":"', traitType, '","value":"', value, '"}');
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

    function formatRarity(Rarity rarity) private pure returns (string memory) {
        if (rarity == Rarity.Common) return "Common";
        if (rarity == Rarity.Uncommon) return "Uncommon";
        if (rarity == Rarity.Rare) return "Rare";
        return "Legendary";
    }

    /// @dev `137` → `0137` for 4 digits.
    function padWithZeros(uint256 value, uint256 digitCount) private pure returns (string memory) {
        string memory digits = value.toString();
        for (
            uint256 paddingIndex = bytes(digits).length; paddingIndex < digitCount; paddingIndex++) {
            digits = string.concat("0", digits);
        }
        return digits;
    }
}
