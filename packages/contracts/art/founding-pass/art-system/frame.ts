/**
 * The geometry every Sneaker shares, which the art data is computed from (the lace slats and
 * eyelets per template). The colours, line widths and drawing order live only in
 * `FoundingPassArtRenderer`, the one implementation of the art.
 */
export const SNEAKER_WIDTH_UNITS = 1000
export const SNEAKER_HEIGHT_UNITS = 600

/** Lace slats: chunky enough to read at thumbnail size (the prototype's finding). */
export const LACE_SLAT_WIDTH_UNITS = 22
export const LACE_SLAT_LENGTH_UNITS = 60
/** How far a slat reaches past the lace line, over the top of the shoe. */
export const LACE_SLAT_OVERHANG_UNITS = 12
/** Eyelets sit on the eyestay, this far in from the lace line. */
export const EYELET_INSET_UNITS = 26
