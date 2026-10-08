// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {
    DesignLayers,
    PassRecord,
    SneakerOutline
} from "./founding-pass-art/FoundingPassArtTypes.sol";
import {FoundingPass, IFoundingPassArtRenderer} from "./FoundingPass.sol";
import {ISneakerArtRenderer, SneakerAttributes} from "./SneakerNft.sol";

/// @title SneakerArtRenderer
/// @notice Draws a Sneaker as a 400 × 400 SVG from its id, level and durability, in the
/// design-system look: dark panel, thin white lines, lime on dark (D-030). A Founder Sneaker
/// (D-042) is drawn in its Founding Pass's design instead, by the pass's own art renderer, laced
/// when the pass is. `SneakerNft` calls it for `tokenURI` and `imageSvg`, and the admin can swap
/// it for a new renderer.
/// @dev Plain paths, rects, an ellipse and text only (no filters, gradients or CSS), so
/// `react-native-svg` draws it the same as a browser.
contract SneakerArtRenderer is ISneakerArtRenderer {
    using Strings for uint256;

    /// @notice One tick per level: the launch `maxLevel` from game-rules.md.
    uint256 public constant LEVEL_SCALE = 30;
    /// @notice The durability bar's full length: the launch `maxDurability` from game-rules.md.
    uint256 public constant DURABILITY_SCALE = 100;

    uint256 private constant MAXIMUM_SPEED_LINES = 5;
    // The lime fades from full to this opacity as durability drops, so a worn Sneaker looks dimmer.
    uint256 private constant MINIMUM_ACCENT_OPACITY_PERCENT = 40;
    uint256 private constant FULL_OPACITY_PERCENT = 100;

    // Layout, in SVG units.
    uint256 private constant CONTENT_LEFT = 40;
    uint256 private constant CONTENT_WIDTH = 320;
    uint256 private constant LEVEL_TICK_SPACING = 11;

    uint256 private constant TOKEN_ID_DIGITS = 4;
    uint256 private constant LEVEL_DIGITS = 2;
    uint256 private constant DURABILITY_DIGITS = 3;

    string private constant ACCENT_COLOR = "#C1FF00";
    string private constant TRACK_COLOR = "#34393F";

    // A Founder Sneaker: the pass's shoe at 0.33 of its 1000 × 600 space (330 wide, centred),
    // between the header and the name line. Positions are in hundredths of a unit, then rounded.
    string private constant FOUNDER_SNEAKER_SCALE = "0.33";
    uint256 private constant FOUNDER_SNEAKER_SCALE_HUNDREDTHS = 33;
    uint256 private constant FOUNDER_SNEAKER_LEFT = 35;
    uint256 private constant FOUNDER_SNEAKER_AREA_CENTER_Y = 146;
    uint256 private constant FOUNDER_SNEAKER_GROUND_Y = 520;
    uint256 private constant FOUNDER_SHADOW_DROP_UNITS = 5;
    uint256 private constant HUNDREDTHS_PER_UNIT = 100;
    uint256 private constant PASS_NUMBER_DIGITS = 4;

    /// @dev The dark square, without D-030's ground line: the shoe stands on its own shadow.
    string private constant FOUNDER_CANVAS_OPENING = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" font-family="\'IBM Plex Mono\',ui-monospace,monospace">'
        '<rect width="400" height="400" fill="#141515"/>';
    string private constant CORNER_MARKS_PATH =
        "M24 31h14M31 24v14M362 31h14M369 24v14M24 369h14M31 362v14M362 369h14M369 362v14";
    /// @dev The rim takes the pass card's own background (`#F0F1FA`), so the shoe looks cut from
    /// its pass. 8 units show outside the shoe's ink outline (18 wide) and the heel tab's (8).
    string private constant SILHOUETTE_RIM_WIDTH = "34";
    string private constant HEEL_TAB_RIM_WIDTH = "24";
    /// @dev The pass's gold frame, as the corner marks of a gold-framed pass's Sneaker.
    string private constant GOLD_COLOR = "#C9971C";
    /// @dev As on the pass card: lime only ever sits behind black text.
    string private constant LACED_PILL = '<rect x="304" y="252" width="56" height="22" rx="11" fill="#C1FF00"/>'
        '<text x="332" y="267" fill="#141515" font-size="11" letter-spacing="1" text-anchor="middle">LACED</text>';

    /// @notice Where a Founder Sneaker's pass lives: its record (laced, frame) and its art.
    FoundingPass public immutable foundingPass;

    /// @param foundingPassAddress The Founding Pass that Founder Sneakers belong to.
    constructor(FoundingPass foundingPassAddress) {
        foundingPass = foundingPassAddress;
    }

    // Background, "+" corner marks and the ground line.
    string private constant CANVAS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" font-family="\'IBM Plex Mono\',ui-monospace,monospace">'
        '<rect width="400" height="400" fill="#141515"/>'
        '<path d="M24 31h14M31 24v14M362 31h14M369 24v14M24 369h14M31 362v14M362 369h14M369 362v14" stroke="#FFFFFF" stroke-opacity="0.3"/>'
        '<path d="M40 250h320" stroke="#FFFFFF" stroke-opacity="0.1"/>';

    // The Sneaker in side view, toe to the right: midsole, upper, pull tab, laces, outsole and toe cap.
    string private constant SNEAKER_DRAWING = '<g fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M86 236H288C314 236 334 230 342 220C345 216 344 212 340 211L150 204C122 203 96 199 78 198C72 212 74 228 86 236Z"/>'
        '<path d="M78 198C68 174 66 150 74 126C94 134 114 142 132 142C138 130 144 116 150 110C156 108 164 112 168 120L250 170C292 178 324 192 340 211"/>'
        '<path d="M74 126l-5-14"/>'
        '<path d="M183 123l-8 10M197 131l-8 10M211 140l-8 10M225 148l-8 10M239 157l-8 10"/>'
        '<path d="M90 228H300" stroke-opacity="0.3"/>'
        '<path d="M300 182C312 190 318 198 320 206" stroke-opacity="0.5"/>' "</g>";

    /// @inheritdoc ISneakerArtRenderer
    function renderImageSvg(
        uint256 tokenId,
        SneakerAttributes calldata attributes,
        uint256 foundingPassTokenId
    ) external view returns (string memory) {
        if (foundingPassTokenId != 0) {
            return buildFounderSneakerSvg(tokenId, attributes, foundingPassTokenId);
        }
        return string.concat(
            CANVAS,
            buildHeader(tokenId),
            buildSneaker(attributes.level, attributes.durability),
            buildLevelRow(attributes.level),
            buildDurabilityRow(attributes.durability),
            "</svg>"
        );
    }

    /// @dev The pass's shoe on the same dark square, with the same level and durability rows.
    /// The header names it and its pass, and a gold-framed pass turns the corner marks gold.
    function buildFounderSneakerSvg(
        uint256 tokenId,
        SneakerAttributes calldata attributes,
        uint256 foundingPassTokenId
    ) private view returns (string memory) {
        PassRecord memory passRecord = foundingPass.passOf(foundingPassTokenId);
        IFoundingPassArtRenderer passArtRenderer = foundingPass.artRenderer();
        string memory passMarkup = string.concat(
            buildCornerMarks(passRecord.hasGoldFrame),
            buildFounderHeader(foundingPassTokenId),
            buildFounderSneaker(passArtRenderer, tokenId, foundingPassTokenId, passRecord.isLaced),
            buildFounderNameLine(
                passArtRenderer.readDesignName(foundingPassTokenId), passRecord.isLaced
            )
        );
        return string.concat(
            FOUNDER_CANVAS_OPENING,
            passMarkup,
            buildLevelRow(attributes.level),
            buildDurabilityRow(attributes.durability),
            "</svg>"
        );
    }

    function buildCornerMarks(bool hasGoldFrame) private pure returns (string memory) {
        return string.concat(
            '<path d="',
            CORNER_MARKS_PATH,
            hasGoldFrame
                ? string.concat('" stroke="', GOLD_COLOR, '" stroke-width="1.5"/>')
                : '" stroke="#FFFFFF" stroke-opacity="0.3"/>'
        );
    }

    /// @dev `FOUNDER SNEAKER` and the pass's number, `#0137`: the number its founder knows.
    function buildFounderHeader(uint256 foundingPassTokenId) private pure returns (string memory) {
        return string.concat(
            '<g fill="#FFFFFF" font-size="12" letter-spacing="1">',
            '<text x="48" y="35" fill-opacity="0.5">FOUNDER SNEAKER</text>',
            '<text x="352" y="35" text-anchor="end">#',
            padWithZeros(foundingPassTokenId, PASS_NUMBER_DIGITS),
            "</text></g>"
        );
    }

    /// @dev Inside a rim of the card's colour, so the ink outline shows on the dark panel. The
    /// clip path id carries the Sneaker's id, so two Sneakers on one page never share it.
    function buildFounderSneaker(
        IFoundingPassArtRenderer passArtRenderer,
        uint256 tokenId,
        uint256 foundingPassTokenId,
        bool isLaced
    ) private view returns (string memory) {
        DesignLayers memory layers = passArtRenderer.readDesignLayers(foundingPassTokenId);
        SneakerOutline memory outline = passArtRenderer.readSneakerOutline(layers.templateIndex);
        string memory sneakerMarkup = passArtRenderer.renderSneakerMarkup(
            layers, isLaced, string.concat("sneaker", tokenId.toString())
        );
        return string.concat(
            buildFounderSneakerPlacement(outline.silhouetteTopY),
            buildRim(outline),
            sneakerMarkup,
            "</g>"
        );
    }

    /// @dev Centred on its own height like the pass card, on a faint shadow. Opens the `<g>`
    /// that places the shoe.
    function buildFounderSneakerPlacement(uint256 silhouetteTopY)
        private
        pure
        returns (string memory)
    {
        // The shoe's middle, (top + ground) / 2, lands on the area's centre once scaled.
        uint256 offsetY = roundHundredths(
            FOUNDER_SNEAKER_AREA_CENTER_Y * HUNDREDTHS_PER_UNIT
                - (silhouetteTopY + FOUNDER_SNEAKER_GROUND_Y) * FOUNDER_SNEAKER_SCALE_HUNDREDTHS / 2
        );
        uint256 shadowCenterY = roundHundredths(
            offsetY * HUNDREDTHS_PER_UNIT + FOUNDER_SNEAKER_GROUND_Y
                * FOUNDER_SNEAKER_SCALE_HUNDREDTHS + FOUNDER_SHADOW_DROP_UNITS * HUNDREDTHS_PER_UNIT
        );
        return string.concat(
            '<ellipse cx="200" cy="',
            shadowCenterY.toString(),
            '" rx="140" ry="8" fill="#FFFFFF" fill-opacity="0.06"/><g transform="translate(',
            FOUNDER_SNEAKER_LEFT.toString(),
            " ",
            offsetY.toString(),
            ") scale(",
            FOUNDER_SNEAKER_SCALE,
            ')">'
        );
    }

    /// @dev The heel tab's rim, then the silhouette's, both under the shoe's own outline.
    function buildRim(SneakerOutline memory outline) private pure returns (string memory) {
        return string.concat(
            buildRimPath(outline.heelTabPathData, HEEL_TAB_RIM_WIDTH),
            buildRimPath(outline.silhouettePathData, SILHOUETTE_RIM_WIDTH)
        );
    }

    function buildRimPath(string memory pathData, string memory strokeWidth)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '<path d="',
            pathData,
            '" fill="#F0F1FA" stroke="#F0F1FA" stroke-width="',
            strokeWidth,
            '" stroke-linejoin="round"/>'
        );
    }

    /// @dev The design's name, and the lime `LACED` pill once the pass is laced.
    function buildFounderNameLine(string memory designName, bool isLaced)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '<text x="40" y="268" fill="#FFFFFF" font-size="14">',
            designName,
            "</text>",
            isLaced ? LACED_PILL : ""
        );
    }

    function buildSneaker(uint256 level, uint256 durability) private pure returns (string memory) {
        string memory accentOpacity = formatAccentOpacity(durability);
        // Nudged right so the Sneaker and its speed lines sit centred together.
        return string.concat(
            '<g transform="translate(10 0)">',
            buildSpeedLines(level, accentOpacity),
            SNEAKER_DRAWING,
            buildAccentStripe(accentOpacity),
            "</g>"
        );
    }

    function buildHeader(uint256 tokenId) private pure returns (string memory) {
        return string.concat(
            '<g fill="#FFFFFF" font-size="12" letter-spacing="1">',
            '<text x="48" y="35" fill-opacity="0.5">STRIDEMON</text>',
            '<text x="352" y="35" text-anchor="end">#',
            padWithZeros(tokenId, TOKEN_ID_DIGITS),
            "</text></g>"
        );
    }

    /// @dev One lime line behind the heel per level, up to five, filled from the middle out.
    function buildSpeedLines(uint256 level, string memory accentOpacity)
        private
        pure
        returns (string memory)
    {
        uint256 speedLineCount = level < MAXIMUM_SPEED_LINES ? level : MAXIMUM_SPEED_LINES;
        string memory pathData = "";
        for (uint256 speedLineIndex = 0; speedLineIndex < speedLineCount; speedLineIndex++) {
            pathData = string.concat(pathData, readSpeedLinePath(speedLineIndex));
        }
        return string.concat(
            '<path d="',
            pathData,
            '" stroke="',
            ACCENT_COLOR,
            '" stroke-width="1.5" stroke-linecap="round" stroke-opacity="',
            accentOpacity,
            '"/>'
        );
    }

    function readSpeedLinePath(uint256 speedLineIndex) private pure returns (string memory) {
        if (speedLineIndex == 0) return "M12 168h34";
        if (speedLineIndex == 1) return "M30 152h16";
        if (speedLineIndex == 2) return "M18 184h28";
        if (speedLineIndex == 3) return "M28 136h18";
        return "M20 200h26";
    }

    function buildAccentStripe(string memory accentOpacity) private pure returns (string memory) {
        return string.concat(
            '<path d="M88 184C134 190 182 174 218 150" fill="none" stroke="',
            ACCENT_COLOR,
            '" stroke-width="2" stroke-linecap="round" stroke-opacity="',
            accentOpacity,
            '"/>'
        );
    }

    /// @dev `LEVEL 02 / 30` over 30 ticks, the first `level` of them lime.
    function buildLevelRow(uint256 level) private pure returns (string memory) {
        return string.concat(
            buildStatLabels(
                "LEVEL",
                string.concat(padWithZeros(level, LEVEL_DIGITS), " / ", LEVEL_SCALE.toString()),
                "294"
            ),
            buildLevelTicks(level)
        );
    }

    function buildLevelTicks(uint256 level) private pure returns (string memory) {
        string memory reachedTicks = "";
        string memory remainingTicks = "";
        for (uint256 tickIndex = 0; tickIndex < LEVEL_SCALE; tickIndex++) {
            string memory tick = string.concat(
                '<rect x="',
                (CONTENT_LEFT + tickIndex * LEVEL_TICK_SPACING).toString(),
                '" y="304" width="2" height="10"/>'
            );
            if (tickIndex < level) reachedTicks = string.concat(reachedTicks, tick);
            else remainingTicks = string.concat(remainingTicks, tick);
        }
        return string.concat(
            string.concat('<g fill="', TRACK_COLOR, '">', remainingTicks, "</g>"),
            string.concat('<g fill="', ACCENT_COLOR, '">', reachedTicks, "</g>")
        );
    }

    /// @dev `DURABILITY 096 / 100` over a lime bar on a grey track.
    function buildDurabilityRow(uint256 durability) private pure returns (string memory) {
        return string.concat(
            buildStatLabels(
                "DURABILITY",
                string.concat(
                    padWithZeros(durability, DURABILITY_DIGITS), " / ", DURABILITY_SCALE.toString()
                ),
                "336"
            ),
            buildDurabilityBar(durability)
        );
    }

    function buildDurabilityBar(uint256 durability) private pure returns (string memory) {
        uint256 shownDurability = durability < DURABILITY_SCALE ? durability : DURABILITY_SCALE;
        uint256 filledWidth = (CONTENT_WIDTH * shownDurability) / DURABILITY_SCALE;
        return string.concat(
            string.concat('<rect x="40" y="346" width="320" height="2" fill="', TRACK_COLOR, '"/>'),
            string.concat(
                '<rect x="40" y="346" width="',
                filledWidth.toString(),
                '" height="2" fill="',
                ACCENT_COLOR,
                '"/>'
            )
        );
    }

    function buildStatLabels(string memory label, string memory value, string memory baselineY)
        private
        pure
        returns (string memory)
    {
        return string.concat(
            '<g fill="#FFFFFF" font-size="11" letter-spacing="1"><text x="40" y="',
            baselineY,
            '" fill-opacity="0.5">',
            label,
            '</text><text x="360" y="',
            baselineY,
            '" text-anchor="end">',
            value,
            "</text></g>"
        );
    }

    /// @dev From "1" at full durability down to "0.40" at zero.
    function formatAccentOpacity(uint256 durability) private pure returns (string memory) {
        uint256 shownDurability = durability < DURABILITY_SCALE ? durability : DURABILITY_SCALE;
        uint256 opacityPercent = MINIMUM_ACCENT_OPACITY_PERCENT
            + ((FULL_OPACITY_PERCENT - MINIMUM_ACCENT_OPACITY_PERCENT) * shownDurability)
            / DURABILITY_SCALE;
        if (opacityPercent == FULL_OPACITY_PERCENT) return "1";
        return string.concat("0.", opacityPercent.toString());
    }

    /// @dev Rounds half up.
    function roundHundredths(uint256 valueHundredths) private pure returns (uint256) {
        return (valueHundredths + HUNDREDTHS_PER_UNIT / 2) / HUNDREDTHS_PER_UNIT;
    }

    /// @dev `4` → `0004` for 4 digits. Longer numbers are left as they are.
    function padWithZeros(uint256 value, uint256 digitCount) private pure returns (string memory) {
        string memory digits = value.toString();
        uint256 digitLength = bytes(digits).length;
        for (uint256 paddingIndex = digitLength; paddingIndex < digitCount; paddingIndex++) {
            digits = string.concat("0", digits);
        }
        return digits;
    }
}
