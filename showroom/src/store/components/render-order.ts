// The order the see-through things draw in. Glows add light but never cover a Sneaker or a print
// (brief §5.2: no tint), so every Sneaker and print draws after every glow, over it. They write
// no depth, so a later draw simply replaces them. The blade sign's faces draw with the Sneakers:
// its glow sits at the sign's centre and would otherwise light half of a face seen at an angle.
// The shop's glass goes last.

export const GLOW_RENDER_ORDER = 1
export const SNEAKER_RENDER_ORDER = 2
export const GLASS_RENDER_ORDER = 3
/** Look closer's tag (D-068) hangs in front of everything it's near, the glass included. */
export const TAG_RENDER_ORDER = 4
