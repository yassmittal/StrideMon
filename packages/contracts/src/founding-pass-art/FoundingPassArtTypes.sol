// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

// The Founding Pass art's shared types (D-041). The generated data (`FoundingPassArtData`,
// `FoundingPassDesigns`) stores these enums as numbers, in the member order below: the art
// generator (art/founding-pass/solidity/solidity-order.ts) writes the same order and checks it.

/// @notice The colour a panel takes. The first ten are shaded: the colourway maps each one to a
/// shade of the family. `Midsole` is always cream and `Ink` always the outline colour.
enum PanelRole {
    Upper,
    Toe,
    Overlay,
    Heel,
    Eyestay,
    Collar,
    Tongue,
    Trim,
    SoleAccent,
    Outsole,
    Midsole,
    Ink
}

/// @notice Where an option's panels go in the drawing order: `Quarter` between the base upper
/// and the framing panels, `Top` over the whole upper, `Sole` over the sole.
enum OptionLayer {
    Quarter,
    Top,
    Sole
}

/// @notice The lace slats' colour, which only shows once a pass is laced.
enum LaceColor {
    Cream,
    Ink,
    Tonal,
    Lime
}

/// @notice A pass is as rare as its rarest layer. Cosmetic only.
enum Rarity {
    Common,
    Uncommon,
    Rare,
    Legendary
}

/// @notice One or more polygons in one colour, drawn as one `<path>`.
struct Panel {
    PanelRole role;
    string pathData;
}

/// @notice One value of a template's option slot: where it's drawn and its panels (none for a
/// plain value).
struct OptionValueArt {
    OptionLayer layer;
    Panel[] panels;
}

/// @notice Everything one template draws, in the 1000 × 600 Sneaker space. Panels are clipped to
/// the silhouette, so they can overshoot it.
struct TemplateArt {
    string silhouettePathData;
    /// @dev The silhouette's highest point, so the card can centre the shoe on its own height.
    uint256 silhouetteTopY;
    string heelTabPathData;
    string heelTabMarkPathData;
    Panel[] upperPanels;
    Panel[] framingPanels;
    Panel[] solePanels;
    /// @dev Drawn only for the metallic families.
    string sheenPathData;
    string laceSlatPathData;
    /// @dev Each eyelet centre as x then y, two bytes each.
    bytes eyeletCenters;
    uint8[3] optionValueCounts;
}

/// @notice A design's layers, each an index into the art data. Every template has three option
/// slots.
struct DesignLayers {
    uint8 templateIndex;
    uint8 colorFamilyIndex;
    uint8 colorwayIndex;
    uint8[3] optionValueIndexes;
    LaceColor laceColor;
}

/// @notice What a minted pass adds to its design's card. `FoundingPass` keeps one per token.
struct PassRecord {
    /// @dev The mint order, from 1.
    uint32 founderNumber;
    bool hasGoldFrame;
    bool isLaced;
}

/// @notice An index the generated art data doesn't have.
error InvalidArtIndex();
