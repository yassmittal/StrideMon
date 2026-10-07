// Flat-panel Sneaker templates (2026-10-08 draft), in the style of STEPN's everyday sneakers:
// angular panels, solid fills, a thick black outline, a cream base and a lime heel tag.
//
//   bun packages/contracts/art/sneaker-templates/build-sneaker-templates.ts
//
// A Sneaker = a template (its silhouette and named panels) + a colour family + a seed. The seed
// decides which shade of the family each panel gets, so one template gives many colourways.
// Only polygons, solid fills and one clip path: no gradients or filters (D-030). See README.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Point = [number, number];

// ---------- colours ----------

const OUTLINE_COLOR = "#111111";
const CREAM = "#F7EEDF";
const TAG_COLOR = "#C1FF00";

/** Each family has five shades, light to dark. Panels pick a shade by their role. */
type ColorFamily = { name: string; shades: [string, string, string, string, string] };

const colorFamilies: ColorFamily[] = [
  { name: "volt", shades: ["#E6FF8A", "#C1FF00", "#7BD33C", "#2E9E5B", "#14523D"] },
  { name: "ocean", shades: ["#9EE7FF", "#3DB8F5", "#2F6BFF", "#2338B8", "#121C66"] },
  { name: "ember", shades: ["#FFD08A", "#FF9A3D", "#FF5A36", "#C8202F", "#5E0F1E"] },
  { name: "grape", shades: ["#F2B8FF", "#C77DFF", "#8B5CF6", "#5B2BC4", "#2A1460"] },
  { name: "mint", shades: ["#B8FFE4", "#4FE3C1", "#14B8A6", "#0E7C86", "#0B3D4A"] },
  { name: "sunset", shades: ["#FFE45C", "#FFB020", "#FF6B9A", "#E8336B", "#6B1745"] },
];

/** Panel roles, mapped to a family's shades. `cream` and `outline` stay fixed on every Sneaker. */
type PanelRole = "light" | "base" | "mid" | "deep" | "dark" | "cream" | "outline";

// ---------- templates ----------

type Panel = { name: string; role: PanelRole; points: Point[] };
type Template = {
  name: string;
  silhouette: Point[];
  /** Back to front; each is clipped to the silhouette, so a panel may overshoot it. */
  panels: Panel[];
  /** Lace slats are laid along this line, from the forefoot up to the tongue. */
  laceLine: [Point, Point];
  laceCount: number;
  heelTag: Point[];
};

const runner: Template = {
  name: "runner",
  silhouette: [
    [38, 500], [46, 440], [110, 395], [230, 345], [400, 270], [470, 215], [540, 170], [560, 118],
    [640, 108], [668, 150], [720, 190], [800, 178], [870, 140], [925, 148], [945, 250], [962, 400],
    [960, 520], [930, 548], [80, 548], [44, 530],
  ],
  panels: [
    { name: "upper", role: "base", points: [[0, 0], [1000, 0], [1000, 620], [0, 620]] },
    { name: "toe cap", role: "mid", points: [[0, 330], [150, 372], [250, 470], [0, 470]] },
    { name: "vamp", role: "deep", points: [[200, 362], [420, 268], [372, 470], [236, 470]] },
    { name: "quarter", role: "light", points: [[420, 262], [600, 178], [702, 470], [372, 470]] },
    { name: "quarter shard", role: "mid", points: [[452, 318], [636, 240], [566, 352], [700, 330], [626, 470], [540, 470], [598, 386], [466, 404]] },
    { name: "heel counter", role: "deep", points: [[702, 192], [1000, 118], [1000, 470], [690, 470]] },
    { name: "heel shard", role: "light", points: [[762, 262], [960, 222], [960, 330], [820, 362]] },
    { name: "collar", role: "dark", points: [[530, 70], [680, 138], [730, 200], [812, 186], [882, 130], [1000, 116], [1000, 60], [530, 60]] },
    { name: "midsole", role: "cream", points: [[0, 470], [1000, 440], [1000, 620], [0, 620]] },
    { name: "midsole shard", role: "mid", points: [[600, 466], [780, 452], [716, 516]] },
    { name: "midsole heel shard", role: "base", points: [[846, 449], [1000, 440], [1000, 500], [900, 504]] },
    { name: "outsole", role: "dark", points: [[0, 524], [1000, 506], [1000, 620], [0, 620]] },
  ],
  laceLine: [[414, 268], [552, 168]],
  laceCount: 6,
  heelTag: [[938, 236], [978, 228], [986, 304], [946, 312]],
};

const highTop: Template = {
  name: "high-top",
  silhouette: [
    [38, 505], [50, 445], [120, 400], [240, 352], [380, 282], [424, 210], [440, 64], [520, 40],
    [604, 56], [640, 80], [760, 70], [862, 58], [906, 76], [916, 200], [940, 380], [958, 520],
    [930, 548], [80, 548], [44, 530],
  ],
  panels: [
    { name: "upper", role: "base", points: [[0, 0], [1000, 0], [1000, 620], [0, 620]] },
    { name: "toe cap", role: "mid", points: [[0, 340], [160, 384], [262, 474], [0, 474]] },
    { name: "vamp", role: "light", points: [[210, 368], [392, 286], [402, 474], [250, 474]] },
    { name: "ankle panel", role: "deep", points: [[424, 196], [640, 88], [920, 70], [930, 330], [610, 360], [452, 330]] },
    { name: "ankle shard", role: "light", points: [[640, 110], [900, 92], [902, 170], [700, 200]] },
    { name: "strap", role: "mid", points: [[402, 266], [888, 166], [902, 240], [420, 344]] },
    { name: "strap pad", role: "cream", points: [[560, 252], [700, 222], [712, 270], [572, 300]] },
    { name: "heel counter", role: "dark", points: [[760, 330], [1000, 290], [1000, 474], [740, 474]] },
    { name: "collar", role: "dark", points: [[430, 30], [1000, 30], [1000, 92], [640, 104], [600, 74], [448, 92]] },
    { name: "midsole", role: "cream", points: [[0, 474], [1000, 446], [1000, 620], [0, 620]] },
    { name: "midsole stripe", role: "deep", points: [[0, 500], [1000, 474], [1000, 490], [0, 516]] },
    { name: "outsole", role: "base", points: [[0, 528], [1000, 508], [1000, 620], [0, 620]] },
  ],
  laceLine: [[384, 290], [444, 120]],
  laceCount: 6,
  heelTag: [[930, 260], [966, 254], [976, 330], [940, 336]],
};

/** The trail sole's bottom edge: lugs, from heel back to toe. */
function buildLugEdge(): Point[] {
  const points: Point[] = [];
  for (let x = 950; x > 70; x -= 44) points.push([x, 548], [x - 22, 566]);
  return points;
}

const trail: Template = {
  name: "trail",
  silhouette: [
    [40, 470], [58, 414], [150, 378], [300, 326], [446, 250], [516, 200], [540, 136], [620, 122],
    [652, 172], [740, 212], [830, 198], [904, 160], [936, 186], [952, 320], [972, 448], [966, 520],
    ...buildLugEdge(), [64, 540], [38, 510],
  ],
  panels: [
    { name: "upper", role: "base", points: [[0, 0], [1000, 0], [1000, 620], [0, 620]] },
    { name: "toe bumper", role: "dark", points: [[0, 380], [96, 400], [170, 460], [0, 460]] },
    { name: "forefoot shard", role: "light", points: [[120, 400], [330, 324], [262, 462], [160, 462]] },
    { name: "zig panel", role: "deep", points: [[300, 340], [470, 254], [420, 350], [560, 300], [500, 462], [262, 462]] },
    { name: "mid shard", role: "mid", points: [[470, 254], [640, 186], [600, 300], [720, 270], [680, 462], [500, 462], [560, 300], [420, 350]] },
    { name: "heel counter", role: "light", points: [[700, 236], [1000, 160], [1000, 462], [680, 462]] },
    { name: "heel cage", role: "deep", points: [[742, 300], [980, 250], [990, 300], [760, 356], [800, 420], [990, 380], [1000, 430], [770, 462]] },
    { name: "collar", role: "dark", points: [[520, 90], [656, 168], [744, 214], [834, 200], [910, 150], [1000, 140], [1000, 90]] },
    { name: "midsole", role: "cream", points: [[0, 460], [1000, 432], [1000, 620], [0, 620]] },
    // A row of saw-tooth triangles along the midsole (not stripes: those read as a brand mark).
    ...[0, 1, 2, 3, 4].map((index): Panel => {
      const x = 250 + index * 90;
      const y = 458 - index * 3;
      return { name: `midsole tooth ${index + 1}`, role: "mid", points: [[x, y], [x + 70, y - 2], [x + 35, y + 44]] };
    }),
    { name: "outsole", role: "dark", points: [[0, 528], [1000, 506], [1000, 620], [0, 620]] },
  ],
  laceLine: [[440, 262], [536, 162]],
  laceCount: 5,
  heelTag: [[946, 210], [986, 204], [996, 280], [956, 286]],
};

const templates = [runner, highTop, trail];

// ---------- the renderer ----------

const formatPoints = (points: Point[]) => points.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(" ");

/** Same seed, same numbers: a small deterministic random (mulberry32). */
function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRandom<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

/**
 * Which shade each role gets. The seed shuffles the three light shades among the light roles and
 * the two dark shades among the dark roles, so a colourway varies but the collar and sole always
 * stay dark enough to ground the shoe.
 */
function buildRoleColors(family: ColorFamily, seed: number): Record<PanelRole, string> {
  const random = createSeededRandom(seed);
  const [light, base, mid] = shuffleWithRandom(family.shades.slice(0, 3), random);
  const [deep, dark] = shuffleWithRandom(family.shades.slice(3), random);
  return { light, base, mid, deep, dark, cream: CREAM, outline: OUTLINE_COLOR };
}

/** Cream slats across the lace line, each a short bar perpendicular to it. */
function buildLaceRack(template: Template): string {
  const [[startX, startY], [endX, endY]] = template.laceLine;
  const lineLength = Math.hypot(endX - startX, endY - startY);
  const [alongX, alongY] = [(endX - startX) / lineLength, (endY - startY) / lineLength];
  // Perpendicular to the lace line, pointing down into the shoe.
  const [acrossX, acrossY] = [-alongY, alongX];
  const slatLength = 58;
  const slatWidth = 20;
  const slats: string[] = [];
  for (let index = 0; index < template.laceCount; index++) {
    const progress = (index + 0.5) / template.laceCount;
    const [centerX, centerY] = [startX + (endX - startX) * progress, startY + (endY - startY) * progress];
    const corner = (along: number, across: number): Point => [
      centerX + alongX * along + acrossX * across,
      centerY + alongY * along + acrossY * across,
    ];
    const halfWidth = slatWidth / 2;
    slats.push(
      `<polygon points="${formatPoints([corner(-halfWidth, 8), corner(halfWidth, 8), corner(halfWidth, slatLength), corner(-halfWidth, slatLength)])}"/>`,
    );
  }
  return `<g fill="${CREAM}" stroke="${OUTLINE_COLOR}" stroke-width="5" stroke-linejoin="round">${slats.join("")}</g>`;
}

function renderSneakerSvg(template: Template, family: ColorFamily, seed: number): string {
  const roleColors = buildRoleColors(family, seed);
  const clipId = `${template.name}-clip`;
  const panels = template.panels
    .map((panel) => `<polygon points="${formatPoints(panel.points)}" fill="${roleColors[panel.role]}"/>`)
    .join("");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620">`,
    `<defs><clipPath id="${clipId}"><polygon points="${formatPoints(template.silhouette)}"/></clipPath></defs>`,
    `<g clip-path="url(#${clipId})" stroke="${OUTLINE_COLOR}" stroke-width="5" stroke-linejoin="round">${panels}</g>`,
    buildLaceRack(template),
    `<polygon points="${formatPoints(template.silhouette)}" fill="none" stroke="${OUTLINE_COLOR}" stroke-width="16" stroke-linejoin="round"/>`,
    `<polygon points="${formatPoints(template.heelTag)}" fill="${TAG_COLOR}" stroke="${OUTLINE_COLOR}" stroke-width="6" stroke-linejoin="round"/>`,
    "</svg>",
  ].join("");
}

// ---------- output ----------

const outputDirectory = import.meta.dir;
const variantDirectory = join(outputDirectory, "variants");
mkdirSync(variantDirectory, { recursive: true });
const canMakePreviews = Bun.which("rsvg-convert") !== null;

function writeSvg(path: string, svg: string, previewWidth = 1000) {
  writeFileSync(path, `${svg}\n`);
  if (!canMakePreviews) return;
  const pngPath = path.replace(/\.svg$/, ".png");
  Bun.spawnSync(["rsvg-convert", "--width", String(previewWidth), path, "--output", pngPath]);
}

// One file per template, in its first colourway.
for (const template of templates) writeSvg(join(outputDirectory, `${template.name}.svg`), renderSneakerSvg(template, colorFamilies[1], 7));

// A grid of colourways: each template in each family, with a different seed per cell.
const cellWidth = 500;
const cellHeight = 330;
const cells: string[] = [];
templates.forEach((template, row) => {
  colorFamilies.forEach((family, column) => {
    const seed = row * 100 + column;
    const svg = renderSneakerSvg(template, family, seed);
    writeSvg(join(variantDirectory, `${template.name}-${family.name}.svg`), svg);
    // Nest each Sneaker with its own clip id, so the ids in the grid don't collide.
    const nested = svg
      .replaceAll(`${template.name}-clip`, `${template.name}-${family.name}-clip`)
      .replace("<svg ", `<svg x="${column * cellWidth + 10}" y="${row * cellHeight + 10}" width="${cellWidth - 20}" height="${cellHeight - 20}" `);
    cells.push(nested);
  });
});
const gridWidth = colorFamilies.length * cellWidth;
const gridHeight = templates.length * cellHeight;
writeSvg(
  join(outputDirectory, "preview-grid.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridWidth} ${gridHeight}"><rect width="${gridWidth}" height="${gridHeight}" fill="#FFFFFF"/>${cells.join("")}</svg>`,
  2000,
);

console.log(`wrote ${templates.length} templates, ${cells.length} variants and preview-grid.svg${canMakePreviews ? " (+ PNGs)" : ""}`);
