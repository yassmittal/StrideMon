// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {FoundingPassArtData} from "./founding-pass-art/FoundingPassArtData.sol";
import {
    DesignLayers,
    LaceColor,
    OptionLayer,
    OptionValueArt,
    Panel,
    PanelRole,
    PassRecord,
    Rarity,
    TemplateArt
} from "./founding-pass-art/FoundingPassArtTypes.sol";
import {FoundingPassDesigns} from "./founding-pass-art/FoundingPassDesigns.sol";

/// @title FoundingPassArtRenderer
/// @notice Draws the 1,000 Founding Pass designs (D-041): a flat-panel Sneaker on a quiet square
/// card. It's the only implementation of the art: the gallery, the token image and the Founder
/// Sneaker all come from here. The templates, colours and the design table are generated data
/// (`founding-pass-art/`); the drawing is this contract.
/// @dev Paths, circles, an ellipse, rects and text, with one clip path per Sneaker and no
/// gradients, filters or CSS, so `react-native-svg` draws it the same as a browser (D-030).
contract FoundingPassArtRenderer {
    using Strings for uint256;

    /// @notice There's no design with this number (designs are 1 to 1,000).
    error InvalidDesignNumber(uint256 designNumber);
    /// @notice A layer index the art data doesn't have.
    error InvalidDesignLayers();

    /// @dev One Sneaker's art, read from the data once, so the drawing only indexes arrays.
    struct SneakerParts {
        TemplateArt templateArt;
        /// @dev One per option slot.
        OptionValueArt[3] optionValues;
        /// @dev Indexed by `PanelRole`.
        string[12] roleColors;
        string laceColor;
        /// @dev Empty for a family without a sheen.
        string sheenColor;
    }

    // The frame every Sneaker shares, whatever its family.
    string private constant INK = "#141515";
    string private constant CREAM = "#F5F0E3";
    string private constant LIME = "#C1FF00";

    // The card: 1000 × 1000 on the site's off-white, ink type, Lusion's "+" corner marks.
    string private constant CARD_OPENING = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" font-family="\'IBM Plex Mono\',ui-monospace,monospace">'
        '<rect width="1000" height="1000" fill="#F0F1FA"/>';
    string private constant CROSS_MARKS =
        '<path d="M20 32h24M32 20v24M20 968h24M32 956v24M956 32h24M968 20v24M956 968h24M968 956v24" stroke="#141515" stroke-opacity="0.3" stroke-width="2"/>';
    /// @dev A thick gold band at the edge and a thin gold line inside it, in place of the marks.
    string private constant GOLD_FRAME = '<rect x="21" y="21" width="958" height="958" fill="none" stroke="#C9971C" stroke-width="14"/>'
        '<rect x="39.5" y="39.5" width="921" height="921" fill="none" stroke="#C9971C" stroke-width="3"/>';
    string private constant LABEL_GROUP_OPENING =
        '<g fill="#141515" font-size="28" letter-spacing="2.5">';
    string private constant HEADER_HAIRLINE =
        '<path d="M64 130H936" stroke="#D8D9E1" stroke-width="2"/>';
    string private constant FOOTER_HAIRLINE =
        '<path d="M64 802H936" stroke="#D8D9E1" stroke-width="2"/>';
    /// @dev Lime only ever sits behind black text on the light card.
    string private constant LACED_PILL = '<rect x="812" y="896" width="124" height="40" rx="20" fill="#C1FF00"/>'
        '<text x="874" y="925" fill="#141515" font-size="24" letter-spacing="2" text-anchor="middle">LACED</text>';

    uint256 private constant DESIGN_NUMBER_DIGITS = 4;
    uint256 private constant FOUNDER_NUMBER_DIGITS = 3;

    // The shoe sits centred between the header and the footer, scaled to 0.94, on a flat shadow.
    // Positions are worked out in hundredths of a unit, then rounded half up.
    uint256 private constant SNEAKER_SCALE_HUNDREDTHS = 94;
    uint256 private constant SNEAKER_AREA_CENTER_Y = 476;
    uint256 private constant SNEAKER_GROUND_Y = 520;
    /// @dev The shadow sits a little below the sole, so a sliver shows under the outline.
    uint256 private constant SHADOW_DROP_UNITS = 10;
    uint256 private constant HUNDREDTHS_PER_UNIT = 100;

    /// @dev `PanelRole`'s first ten members take a family shade through the colourway.
    uint256 private constant SHADED_ROLE_COUNT = 10;
    /// @dev Each eyelet centre in `TemplateArt.eyeletCenters`: x then y, two bytes each.
    uint256 private constant EYELET_CENTER_BYTES = 4;
    bytes16 private constant UPPERCASE_HEX_DIGITS = "0123456789ABCDEF";

    /// @notice A design's card as the gallery shows it before anyone mints it: available and
    /// unlaced, with no founder number and no frame.
    /// @param designNumber 1 to 1,000.
    function renderDesignPreviewSvg(uint256 designNumber) external pure returns (string memory) {
        return buildCardSvg(designNumber, PassRecord(0, false, false), false);
    }

    /// @notice A minted pass's card: its design, `FOUNDER 042`, the laces once laced, and the
    /// gold frame if it rolled one.
    /// @param tokenId The design number: a pass's token id is its design.
    /// @param passRecord What the mint added (founder number, frame, laced).
    function renderPassSvg(uint256 tokenId, PassRecord calldata passRecord)
        external
        pure
        returns (string memory)
    {
        return buildCardSvg(tokenId, passRecord, true);
    }

    /// @notice The Sneaker on its own, in its 1000 × 600 space with the ground at y = 520, for a
    /// card or another picture (the Founder Sneaker) to place with a transform.
    /// @param layers Any valid combination of layers, not only the 1,000 designs.
    /// @param isLaced Lace slats in the lace colour, or ink eyelets before the first walk.
    /// @param clipPathId Must be unique on the page that shows the markup: inline SVGs on one
    /// page share their ids.
    function renderSneakerMarkup(DesignLayers memory layers, bool isLaced, string memory clipPathId)
        public
        pure
        returns (string memory)
    {
        return buildSneakerMarkup(readSneakerParts(layers), isLaced, clipPathId);
    }

    /// @notice A design's layers from the design table.
    function readDesignLayers(uint256 designNumber)
        public
        pure
        returns (DesignLayers memory layers)
    {
        bytes memory designRow = readDesignRow(designNumber);
        layers.templateIndex = uint8(designRow[0]);
        layers.colorFamilyIndex = uint8(designRow[1]);
        layers.colorwayIndex = uint8(designRow[2]);
        layers.optionValueIndexes = [uint8(designRow[3]), uint8(designRow[4]), uint8(designRow[5])];
        layers.laceColor = LaceColor(uint8(designRow[6]));
    }

    /// @notice "Ember Runner Dusk": family, template, colourway, unique across the collection. A
    /// Legendary takes its template's hand-picked name instead ("Earthshine").
    function readDesignName(uint256 designNumber) public pure returns (string memory) {
        DesignLayers memory layers = readDesignLayers(designNumber);
        if (readDesignRarity(designNumber) == Rarity.Legendary) {
            return FoundingPassArtData.readLegendaryName(layers.templateIndex);
        }
        return string.concat(
            FoundingPassArtData.readColorFamilyLabel(layers.colorFamilyIndex),
            " ",
            FoundingPassArtData.readTemplateLabel(layers.templateIndex),
            " ",
            FoundingPassArtData.readColorwayLabel(layers.colorwayIndex)
        );
    }

    /// @notice A design's rarity: as rare as its rarest layer.
    function readDesignRarity(uint256 designNumber) public pure returns (Rarity) {
        return Rarity(uint8(readDesignRow(designNumber)[7]));
    }

    function buildCardSvg(uint256 designNumber, PassRecord memory passRecord, bool isMinted)
        private
        pure
        returns (string memory)
    {
        bool isLaced = isMinted && passRecord.isLaced;
        return string.concat(
            CARD_OPENING,
            isMinted && passRecord.hasGoldFrame ? GOLD_FRAME : CROSS_MARKS,
            buildHeader(designNumber),
            buildPlacedSneaker(designNumber, isLaced),
            buildFooter(designNumber, passRecord, isMinted),
            isLaced ? LACED_PILL : "",
            "</svg>"
        );
    }

    function buildHeader(uint256 designNumber) private pure returns (string memory) {
        return string.concat(
            LABEL_GROUP_OPENING,
            '<text x="64" y="98">FOUNDING PASS</text><text x="936" y="98" text-anchor="end">#',
            padWithZeros(designNumber, DESIGN_NUMBER_DIGITS),
            "</text></g>",
            HEADER_HAIRLINE
        );
    }

    /// @dev Scaled into the card and centred on its own height, so low and tall shoes both sit
    /// in the middle. The token's own image clips with `pass` + the design number.
    function buildPlacedSneaker(uint256 designNumber, bool isLaced)
        private
        pure
        returns (string memory)
    {
        SneakerParts memory parts = readSneakerParts(readDesignLayers(designNumber));
        // The shoe's middle, (top + ground) / 2, lands on the area's centre once scaled.
        uint256 offsetY = roundHundredths(
            SNEAKER_AREA_CENTER_Y * HUNDREDTHS_PER_UNIT
                - (parts.templateArt.silhouetteTopY + SNEAKER_GROUND_Y) * SNEAKER_SCALE_HUNDREDTHS
                / 2
        );
        uint256 shadowCenterY = roundHundredths(
            offsetY * HUNDREDTHS_PER_UNIT + SNEAKER_GROUND_Y * SNEAKER_SCALE_HUNDREDTHS
                + SHADOW_DROP_UNITS * HUNDREDTHS_PER_UNIT
        );
        return string.concat(
            '<ellipse cx="500" cy="',
            shadowCenterY.toString(),
            '" rx="400" ry="22" fill="#E0E2EC"/><g transform="translate(30 ',
            offsetY.toString(),
            ') scale(0.94)">',
            buildSneakerMarkup(parts, isLaced, string.concat("pass", designNumber.toString())),
            "</g>"
        );
    }

    function buildFooter(uint256 designNumber, PassRecord memory passRecord, bool isMinted)
        private
        pure
        returns (string memory)
    {
        string memory nameLine = string.concat(
            FOOTER_HAIRLINE,
            '<text x="64" y="878" fill="#141515" font-size="44">',
            readDesignName(designNumber),
            "</text>"
        );
        return string.concat(
            nameLine,
            LABEL_GROUP_OPENING,
            '<text x="64" y="926" fill-opacity="0.5">',
            formatRarity(readDesignRarity(designNumber)),
            unicode" · 1 OF 1</text>",
            isMinted ? buildFounderNumber(passRecord.founderNumber) : "",
            "</g>"
        );
    }

    function buildFounderNumber(uint256 founderNumber) private pure returns (string memory) {
        return string.concat(
            '<text x="936" y="878" text-anchor="end">FOUNDER ',
            padWithZeros(founderNumber, FOUNDER_NUMBER_DIGITS),
            "</text>"
        );
    }

    /// @dev Back to front: the heel tab, the panels clipped to the silhouette, the outline, then
    /// the eyelets or the lace slats on top.
    function buildSneakerMarkup(SneakerParts memory parts, bool isLaced, string memory clipPathId)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '<defs><clipPath id="',
            clipPathId,
            '"><path d="',
            parts.templateArt.silhouettePathData,
            '"/></clipPath></defs>',
            buildHeelTab(parts.templateArt),
            buildClippedPanels(parts, clipPathId),
            buildOutline(parts.templateArt),
            isLaced ? buildLaceSlats(parts) : buildEyelets(parts.templateArt)
        );
    }

    /// @dev StrideMon's lime pull tab with an ink chevron. It sticks out against the card, not
    /// the shoe, so it shows in every family.
    function buildHeelTab(TemplateArt memory templateArt) private pure returns (string memory) {
        return string.concat(
            '<path d="',
            templateArt.heelTabPathData,
            '" fill="#C1FF00" stroke="#141515" stroke-width="8" stroke-linejoin="round"/><path d="',
            templateArt.heelTabMarkPathData,
            '" fill="#141515"/>'
        );
    }

    /// @dev Back to front inside the silhouette: base upper, `Quarter` options, the framing
    /// panels, `Top` options, the sole, `Sole` options, then the metallic sheen.
    function buildClippedPanels(SneakerParts memory parts, string memory clipPathId)
        private
        pure
        returns (string memory)
    {
        string memory panelsMarkup = string.concat(
            buildPanels(parts.templateArt.upperPanels, parts),
            buildOptionPanels(parts, OptionLayer.Quarter),
            buildPanels(parts.templateArt.framingPanels, parts),
            buildOptionPanels(parts, OptionLayer.Top),
            buildPanels(parts.templateArt.solePanels, parts),
            buildOptionPanels(parts, OptionLayer.Sole)
        );
        return string.concat(
            '<g clip-path="url(#',
            clipPathId,
            ')" stroke="#141515" stroke-width="7" stroke-linejoin="round">',
            panelsMarkup,
            buildSheen(parts),
            "</g>"
        );
    }

    function buildOptionPanels(SneakerParts memory parts, OptionLayer optionLayer)
        private
        pure
        returns (string memory panelsMarkup)
    {
        for (uint256 slotIndex = 0; slotIndex < parts.optionValues.length; slotIndex++) {
            OptionValueArt memory optionValue = parts.optionValues[slotIndex];
            if (optionValue.layer != optionLayer) continue;
            panelsMarkup = string.concat(panelsMarkup, buildPanels(optionValue.panels, parts));
        }
    }

    function buildPanels(Panel[] memory panels, SneakerParts memory parts)
        private
        pure
        returns (string memory panelsMarkup)
    {
        for (uint256 panelIndex = 0; panelIndex < panels.length; panelIndex++) {
            panelsMarkup = string.concat(
                panelsMarkup,
                '<path d="',
                panels[panelIndex].pathData,
                '" fill="',
                parts.roleColors[uint256(panels[panelIndex].role)],
                '"/>'
            );
        }
    }

    /// @dev Gold and Chrome only: flat light shards with no outline, read as a metal sheen.
    function buildSheen(SneakerParts memory parts) private pure returns (string memory) {
        if (
            bytes(parts.sheenColor).length == 0
                || bytes(parts.templateArt.sheenPathData).length == 0
        ) {
            return "";
        }
        return string.concat(
            '<path d="',
            parts.templateArt.sheenPathData,
            '" fill="',
            parts.sheenColor,
            '" stroke="none"/>'
        );
    }

    function buildOutline(TemplateArt memory templateArt) private pure returns (string memory) {
        return string.concat(
            '<path d="',
            templateArt.silhouettePathData,
            '" fill="none" stroke="#141515" stroke-width="18" stroke-linejoin="round"/>'
        );
    }

    /// @dev Before the first walk: ink eyelets on the eyestay.
    function buildEyelets(TemplateArt memory templateArt) private pure returns (string memory) {
        bytes memory eyeletCenters = templateArt.eyeletCenters;
        string memory circles = "";
        for (
            uint256 byteOffset = 0;
            byteOffset < eyeletCenters.length;
            byteOffset += EYELET_CENTER_BYTES
        ) {
            circles = string.concat(
                circles,
                '<circle cx="',
                readUint16(eyeletCenters, byteOffset).toString(),
                '" cy="',
                readUint16(eyeletCenters, byteOffset + 2).toString(),
                '" r="9"/>'
            );
        }
        return string.concat('<g fill="#141515">', circles, "</g>");
    }

    /// @dev After the first walk: chunky slats at right angles to the lace line.
    function buildLaceSlats(SneakerParts memory parts) private pure returns (string memory) {
        return string.concat(
            '<path d="',
            parts.templateArt.laceSlatPathData,
            '" fill="',
            parts.laceColor,
            '" stroke="#141515" stroke-width="6" stroke-linejoin="round"/>'
        );
    }

    /// @dev Checks the layers against the art data, then reads everything the drawing needs.
    function readSneakerParts(DesignLayers memory layers)
        private
        pure
        returns (SneakerParts memory parts)
    {
        if (
            layers.templateIndex >= FoundingPassArtData.TEMPLATE_COUNT
                || layers.colorFamilyIndex >= FoundingPassArtData.COLOR_FAMILY_COUNT
                || layers.colorwayIndex >= FoundingPassArtData.COLORWAY_COUNT
        ) revert InvalidDesignLayers();
        parts.templateArt = FoundingPassArtData.readTemplateArt(layers.templateIndex);
        uint8[3] memory valueIndexes = layers.optionValueIndexes;
        uint8[3] memory valueCounts = parts.templateArt.optionValueCounts;
        if (
            valueIndexes[0] >= valueCounts[0] || valueIndexes[1] >= valueCounts[1]
                || valueIndexes[2] >= valueCounts[2]
        ) revert InvalidDesignLayers();
        parts.optionValues[0] =
            FoundingPassArtData.readOptionValue(layers.templateIndex, 0, valueIndexes[0]);
        parts.optionValues[1] =
            FoundingPassArtData.readOptionValue(layers.templateIndex, 1, valueIndexes[1]);
        parts.optionValues[2] =
            FoundingPassArtData.readOptionValue(layers.templateIndex, 2, valueIndexes[2]);
        resolveColors(parts, layers);
    }

    /// @dev The colourway maps each shaded role to one of the family's shades. The midsole is
    /// always cream, and lines are always ink.
    function resolveColors(SneakerParts memory parts, DesignLayers memory layers) private pure {
        uint24[5] memory shadeColors = FoundingPassArtData.readShadeColors(layers.colorFamilyIndex);
        uint8[10] memory shadeIndexes =
            FoundingPassArtData.readColorwayShadeIndexes(layers.colorwayIndex);
        for (uint256 roleIndex = 0; roleIndex < SHADED_ROLE_COUNT; roleIndex++) {
            parts.roleColors[roleIndex] = formatColor(shadeColors[shadeIndexes[roleIndex]]);
        }
        parts.roleColors[uint256(PanelRole.Midsole)] = CREAM;
        parts.roleColors[uint256(PanelRole.Ink)] = INK;
        parts.laceColor = resolveLaceColor(
            layers.laceColor, shadeColors, shadeIndexes[uint256(PanelRole.Eyestay)]
        );
        if (FoundingPassArtData.hasSheen(layers.colorFamilyIndex)) {
            parts.sheenColor =
                formatColor(FoundingPassArtData.readSheenColor(layers.colorFamilyIndex));
        }
    }

    /// @dev Tonal laces take the family shade two steps from the eyestay's, so they never melt
    /// into it.
    function resolveLaceColor(
        LaceColor laceColor,
        uint24[5] memory shadeColors,
        uint256 eyestayShadeIndex
    ) private pure returns (string memory) {
        if (laceColor == LaceColor.Cream) return CREAM;
        if (laceColor == LaceColor.Ink) return INK;
        if (laceColor == LaceColor.Lime) return LIME;
        uint8[5] memory tonalShadeByEyestayShade = [2, 3, 0, 1, 2];
        return formatColor(shadeColors[tonalShadeByEyestayShade[eyestayShadeIndex]]);
    }

    function readDesignRow(uint256 designNumber) private pure returns (bytes memory designRow) {
        if (designNumber == 0 || designNumber > FoundingPassDesigns.DESIGN_COUNT) {
            revert InvalidDesignNumber(designNumber);
        }
        bytes memory designTable = FoundingPassDesigns.DESIGN_TABLE;
        uint256 rowOffset = (designNumber - 1) * FoundingPassDesigns.ROW_LENGTH;
        designRow = new bytes(FoundingPassDesigns.ROW_LENGTH);
        for (uint256 byteIndex = 0; byteIndex < FoundingPassDesigns.ROW_LENGTH; byteIndex++) {
            designRow[byteIndex] = designTable[rowOffset + byteIndex];
        }
    }

    function formatRarity(Rarity rarity) private pure returns (string memory) {
        if (rarity == Rarity.Common) return "COMMON";
        if (rarity == Rarity.Uncommon) return "UNCOMMON";
        if (rarity == Rarity.Rare) return "RARE";
        return "LEGENDARY";
    }

    /// @dev 0xFFE6CF → `#FFE6CF`.
    function formatColor(uint24 color) private pure returns (string memory) {
        bytes memory text = new bytes(7);
        text[0] = "#";
        for (uint256 digitIndex = 0; digitIndex < 6; digitIndex++) {
            text[6 - digitIndex] = UPPERCASE_HEX_DIGITS[(uint256(color) >> (4 * digitIndex)) & 0xF];
        }
        return string(text);
    }

    /// @dev Rounds half up, like the art system's `Math.round` on these positive positions.
    function roundHundredths(uint256 valueHundredths) private pure returns (uint256) {
        return (valueHundredths + HUNDREDTHS_PER_UNIT / 2) / HUNDREDTHS_PER_UNIT;
    }

    function readUint16(bytes memory data, uint256 byteOffset) private pure returns (uint256) {
        return (uint256(uint8(data[byteOffset])) << 8) | uint8(data[byteOffset + 1]);
    }

    /// @dev `42` → `042` for 3 digits. Longer numbers are left as they are.
    function padWithZeros(uint256 value, uint256 digitCount) private pure returns (string memory) {
        string memory digits = value.toString();
        for (
            uint256 paddingIndex = bytes(digits).length; paddingIndex < digitCount; paddingIndex++) {
            digits = string.concat("0", digits);
        }
        return digits;
    }
}
