// Draws the Sneaker NFT art (the hero Sneaker, 2026-10-08) as one SVG with a transparent
// background, and a PNG preview when `rsvg-convert` is installed.
//
//   bun packages/contracts/art/sneaker/build-sneaker-art.ts
//
// This is the design reference. On-chain, the same drawing gets ported into a Solidity renderer
// (the Founding Pass brief, Part 1). It uses flat tonal panels, generated line work, clip paths
// and one pattern: no filters and no gradients (D-030). See README.md.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Point = [number, number];

const roundToTenth = (value: number) => Math.round(value * 10) / 10;
const formatPoint = ([x, y]: Point) => `${roundToTenth(x)} ${roundToTenth(y)}`;
const readPointBetween = (start: Point, end: Point, progress: number): Point => [
  start[0] + (end[0] - start[0]) * progress,
  start[1] + (end[1] - start[1]) * progress,
];

/** A smooth curve through the points (Catmull-Rom turned into cubic Béziers). */
function buildSmoothPath(points: Point[], isClosed = false): string {
  const readPoint = (index: number): Point =>
    isClosed
      ? points[(index + points.length) % points.length]
      : points[Math.max(0, Math.min(points.length - 1, index))];
  const segmentCount = isClosed ? points.length : points.length - 1;
  let pathData = `M${formatPoint(points[0])}`;
  for (let index = 0; index < segmentCount; index++) {
    const [previous, start, end, next] = [
      readPoint(index - 1),
      readPoint(index),
      readPoint(index + 1),
      readPoint(index + 2),
    ];
    const firstControl: Point = [start[0] + (end[0] - previous[0]) / 6, start[1] + (end[1] - previous[1]) / 6];
    const secondControl: Point = [end[0] - (next[0] - start[0]) / 6, end[1] - (next[1] - start[1]) / 6];
    pathData += `C${formatPoint(firstControl)} ${formatPoint(secondControl)} ${formatPoint(end)}`;
  }
  return isClosed ? `${pathData}Z` : pathData;
}

/** The same curve without its leading `M`, to append to a multi-line path. */
const buildContinuedPath = (points: Point[]) => `M${buildSmoothPath(points).slice(1)}`;

// ---------- palette ----------

const colors = {
  ink: "#141414",
  inkSoft: "#2A2A2A",
  cream: "#F3EFE6",
  creamShade: "#DDD6C9",
  creamDeep: "#C4BCAE",
  mesh: "#A8A39A",
  meshLine: "#D8D2C6",
  orange: "#EC7F2F",
  peach: "#F4AE7A",
  amber: "#F2A51F",
  lining: "#A94A1C",
  laceHighlight: "#6A6A6A",
};

// ---------- shapes, in the Sneaker's own coordinates (toe left, heel right, ground ≈ 340) ----------

const upperPoints: Point[] = [
  [46, 296], [28, 284], [26, 264], [42, 246], [84, 229], [150, 212], [212, 190], [300, 152],
  [372, 122], [380, 98], [394, 78], [422, 72], [436, 84], [432, 104], [462, 132], [494, 138],
  [528, 126], [556, 110], [580, 106], [598, 124], [610, 172], [608, 222], [600, 258], [500, 284],
  [300, 298], [120, 298],
];
const midsolePoints: Point[] = [
  [36, 290], [120, 296], [300, 300], [450, 290], [560, 270], [612, 250], [626, 280], [616, 312],
  [560, 322], [400, 328], [200, 326], [90, 318], [46, 306],
];
const outsolePoints: Point[] = [
  [56, 306], [120, 316], [250, 324], [400, 326], [540, 320], [615, 310], [612, 324], [560, 334],
  [400, 340], [200, 338], [92, 330], [52, 318],
];
const toeCapPoints: Point[] = [
  [46, 296], [28, 284], [26, 264], [42, 246], [84, 229], [150, 212], [178, 205], [164, 236],
  [168, 268], [184, 300], [110, 300],
];
const heelFrontEdge: Point[] = [[536, 124], [506, 160], [484, 204], [472, 250], [468, 296]];
const heelPoints: Point[] = [
  ...heelFrontEdge, [560, 290], [608, 262], [612, 222], [612, 172], [598, 122], [580, 104], [556, 108],
];
const meshWindowPoints: Point[] = [
  [292, 292], [302, 246], [328, 200], [366, 166], [406, 148], [440, 150], [458, 176], [456, 230],
  [448, 292],
];
const pullTabTop: Point = [600, 66];

const upperOutline = buildSmoothPath(upperPoints, true);
const midsoleOutline = buildSmoothPath(midsolePoints, true);
const outsoleOutline = buildSmoothPath(outsolePoints, true);
const toeCapOutline = buildSmoothPath(toeCapPoints, true);
const heelOutline = buildSmoothPath(heelPoints, true);
const meshWindowOutline = buildSmoothPath(meshWindowPoints, true);

// The lace line: the top edge of the lace stay, from the forefoot up to the tongue.
const laceLineStart: Point = [214, 196];
const laceLineEnd: Point = [376, 130];

const clipTo = (clipId: string, body: string) => `<g clip-path="url(#${clipId})">${body}</g>`;

// ---------- the parts, back to front ----------

function buildUpper(): string {
  const parts = [
    `<path d="${upperOutline}" fill="${colors.cream}"/>`,
    `<path d="${upperOutline}" fill="url(#knit)"/>`,
  ];

  // Forefoot cage: lines that sweep from the sole up and back into the lace stay.
  const cageLines: string[] = [];
  const cageLineCount = 26;
  for (let index = 0; index < cageLineCount; index++) {
    const progress = index / (cageLineCount - 1);
    const base: Point = [70 + index * 11.5, 300];
    const top = readPointBetween(laceLineStart, laceLineEnd, progress);
    const middle: Point = [base[0] + 30 + progress * 10, base[1] - 50 - progress * 16];
    const isBold = index % 4 === 0;
    cageLines.push(
      `<path d="${buildSmoothPath([base, middle, [top[0] - 6, top[1] + 14]])}" fill="none" stroke="${isBold ? colors.ink : colors.inkSoft}" stroke-width="${isBold ? 3 : 1}" stroke-linecap="round"/>`,
    );
  }
  parts.push(clipTo("upperClip", cageLines.join("")));
  return parts.join("");
}

function buildMeshWindow(): string {
  const gridLines: string[] = [];
  for (let x = 270; x < 480; x += 9) gridLines.push(`M${x} 130L${x - 30} 300`);
  for (let y = 130; y < 310; y += 9) gridLines.push(`M280 ${y + 14}L470 ${y - 16}`);
  return [
    `<path d="${meshWindowOutline}" fill="${colors.mesh}"/>`,
    clipTo("meshClip", `<path d="${gridLines.join("")}" stroke="${colors.meshLine}" stroke-width="1.1" stroke-opacity="0.85"/>`),
    clipTo("meshClip", `<path d="M280 250C340 240 400 220 470 170V320H280Z" fill="#000" fill-opacity="0.15"/>`),
    `<path d="${meshWindowOutline}" fill="none" stroke="${colors.ink}" stroke-width="3"/>`,
    `<path d="${buildSmoothPath([[300, 286], [310, 246], [334, 206], [370, 174], [408, 158]])}" fill="none" stroke="${colors.cream}" stroke-width="1.4" stroke-dasharray="4 4"/>`,
  ].join("");
}

function buildToeCap(): string {
  // Topographic contour lines: the toe's edge, shrunk towards the back of the cap.
  const toeEdge: Point[] = [[34, 296], [26, 278], [30, 258], [48, 244], [84, 229], [150, 212], [180, 205]];
  const anchor: Point = [190, 300];
  const contours: string[] = [];
  for (let ring = 1; ring < 14; ring++) {
    const scale = 1 - ring * 0.065;
    contours.push(
      buildContinuedPath(
        toeEdge.map(([x, y]) => [anchor[0] + (x - anchor[0]) * scale, anchor[1] + (y - anchor[1]) * scale]),
      ),
    );
  }
  return [
    `<path d="${toeCapOutline}" fill="${colors.cream}"/>`,
    clipTo("toeClip", `<path d="${contours.join("")}" fill="none" stroke="${colors.creamDeep}" stroke-width="1.2"/>`),
    `<path d="${buildSmoothPath([[184, 300], [168, 268], [164, 236], [178, 205]])}" fill="none" stroke="${colors.ink}" stroke-width="2.6"/>`,
    `<path d="${buildSmoothPath([[192, 298], [176, 268], [172, 238], [186, 210]])}" fill="none" stroke="${colors.ink}" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.6"/>`,
  ].join("");
}

function buildSuede(): string {
  const suedeOutline = buildSmoothPath(
    [[372, 136], [412, 122], [452, 132], [500, 148], [520, 168], [488, 180], [440, 168], [400, 156]],
    true,
  );
  return [
    clipTo("upperClip", `<path d="${suedeOutline}" fill="${colors.orange}"/>`),
    clipTo("upperClip", `<path d="${buildSmoothPath([[392, 132], [432, 128], [478, 142], [506, 158]])}" fill="none" stroke="${colors.peach}" stroke-width="3.5" stroke-linecap="round"/>`),
    clipTo("upperClip", `<path d="${buildSmoothPath([[400, 150], [440, 160], [482, 172], [512, 166]])}" fill="none" stroke="${colors.ink}" stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity="0.7"/>`),
  ].join("");
}

function buildHeel(): string {
  // Flow lines parallel to the counter's front edge.
  const flowLines: string[] = [];
  for (let index = 1; index < 10; index++) {
    const offset = index * 9;
    flowLines.push(buildContinuedPath(heelFrontEdge.map(([x, y]) => [x + offset, y + offset * 0.12])));
  }
  // Three amber waves running down the heel.
  const waves: string[] = [];
  for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
    const wavePoints: Point[] = [];
    for (let step = 0; step <= 48; step++) {
      const progress = step / 48;
      const [edgeX, edgeY] = readPointBetween([536, 124], [468, 296], progress);
      wavePoints.push([edgeX + 34 + waveIndex * 20 + Math.sin(progress * Math.PI * 2 * 2.6) * 10, edgeY]);
    }
    waves.push(
      `<path d="${buildSmoothPath(wavePoints)}" fill="none" stroke="${colors.amber}" stroke-width="${waveIndex === 1 ? 7 : 4}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  return [
    `<path d="${heelOutline}" fill="${colors.ink}"/>`,
    clipTo("heelClip", `<path d="${flowLines.join("")}" fill="none" stroke="${colors.cream}" stroke-width="1.6" stroke-opacity="0.9"/>`),
    clipTo("heelClip", waves.join("")),
    clipTo("heelClip", `<path d="${buildSmoothPath(heelFrontEdge.map(([x, y]) => [x + 6, y]))}" fill="none" stroke="${colors.cream}" stroke-width="1.2" stroke-dasharray="4 3"/>`),
    clipTo("heelClip", `<path d="M570 90C630 140 640 230 600 290L660 300V80Z" fill="#000" fill-opacity="0.35"/>`),
    `<path d="${buildSmoothPath([[596, 128], [606, 172], [606, 220], [598, 252]])}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.35" stroke-linecap="round"/>`,
  ].join("");
}

function buildCollarAndTongue(): string {
  return [
    // The far side's lining, seen through the opening.
    `<path d="${buildSmoothPath([[432, 104], [462, 126], [496, 130], [528, 118], [556, 102], [578, 98], [550, 94], [500, 106], [462, 108]], true)}" fill="${colors.lining}"/>`,
    // The padded collar and the pull tab.
    `<path d="${buildSmoothPath([[430, 106], [462, 132], [494, 138], [528, 126], [556, 110], [580, 106]])}" fill="none" stroke="${colors.ink}" stroke-width="13" stroke-linecap="round"/>`,
    `<path d="${buildSmoothPath([[436, 100], [464, 124], [494, 130], [526, 118], [552, 104]])}" fill="none" stroke="${colors.peach}" stroke-width="2" stroke-linecap="round"/>`,
    `<path d="M582 104L592 74C595 ${pullTabTop[1]} 606 ${pullTabTop[1]} 607 76L606 124Z" fill="${colors.ink}"/>`,
    `<path d="M595 80L599 114" stroke="${colors.orange}" stroke-width="2" stroke-dasharray="4 3"/>`,
    // The tongue, rising above the lace stay.
    `<path d="${buildSmoothPath([[368, 132], [374, 104], [388, 82], [420, 70], [438, 78], [436, 100], [426, 118], [398, 130]], true)}" fill="${colors.ink}"/>`,
    `<path d="M396 82L422 74" stroke="${colors.orange}" stroke-width="6" stroke-linecap="round"/>`,
  ].join("");
}

function buildLaces(): string {
  const stayOffset: Point = [4, 10];
  const parts = [
    `<path d="M${formatPoint([laceLineStart[0] + stayOffset[0], laceLineStart[1] + stayOffset[1]])}L${formatPoint([laceLineEnd[0] + stayOffset[0], laceLineEnd[1] + stayOffset[1]])}" stroke="${colors.ink}" stroke-width="20" stroke-linecap="round"/>`,
  ];
  const eyelets: string[] = [];
  const laces: string[] = [];
  for (let index = 0; index < 6; index++) {
    const eyelet = readPointBetween(
      [laceLineStart[0] + 10, laceLineStart[1] + 10],
      [laceLineEnd[0] - 4, laceLineEnd[1] + 12],
      index / 5,
    );
    const [eyeletX, eyeletY] = eyelet.map(roundToTenth);
    eyelets.push(
      `<circle cx="${eyeletX}" cy="${eyeletY}" r="3.4" fill="${colors.cream}"/><circle cx="${eyeletX}" cy="${eyeletY}" r="1.5" fill="${colors.ink}"/>`,
    );
    const overTongue: Point = [eyelet[0] + 18, eyelet[1] - 20];
    laces.push(
      `<path d="M${formatPoint(eyelet)}Q${formatPoint([eyelet[0] + 12, eyelet[1] - 6])} ${formatPoint(overTongue)}" fill="none" stroke="${colors.ink}" stroke-width="6.5" stroke-linecap="round"/>`,
      `<path d="M${formatPoint([eyelet[0] + 4, eyelet[1] - 5])}Q${formatPoint([eyelet[0] + 11, eyelet[1] - 10])} ${formatPoint([overTongue[0] - 1, overTongue[1] + 5])}" fill="none" stroke="${colors.laceHighlight}" stroke-width="1.4" stroke-linecap="round"/>`,
    );
  }
  parts.push(eyelets.join(""), laces.join(""));
  // The bow's two loose ends, falling over the forefoot.
  parts.push(
    `<path d="${buildSmoothPath([[384, 104], [362, 128], [346, 162], [342, 196]])}" fill="none" stroke="${colors.ink}" stroke-width="5.5" stroke-linecap="round"/>`,
    `<path d="${buildSmoothPath([[386, 106], [376, 136], [372, 168], [378, 192]])}" fill="none" stroke="${colors.ink}" stroke-width="5.5" stroke-linecap="round"/>`,
  );
  return parts.join("");
}

function buildUpperShading(): string {
  return [
    clipTo("upperClip", `<path d="${buildSmoothPath([[20, 290], [200, 300], [420, 296], [640, 256]])}" fill="none" stroke="#000" stroke-width="28" stroke-opacity="0.12"/>`),
    clipTo("upperClip", `<path d="${buildSmoothPath([[52, 244], [100, 228], [160, 214]])}" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-opacity="0.75" stroke-linecap="round"/>`),
  ].join("");
}

function buildMidsole(): string {
  // Sculpted foam: a wavy recess along the bottom, a ridge above it, and an amber heel insert.
  const recessPoints: Point[] = [];
  for (let x = 20; x <= 650; x += 7) recessPoints.push([x, 314 - ((x - 20) / 630) * 16 + Math.sin(x / 19) * 7]);
  const ridgePoints = recessPoints.map(([x, y]): Point => [x, y - 11 + Math.sin(x / 19 + 2) * 2]);
  const insertBands: string[] = [];
  for (let band = 0; band < 4; band++) {
    const bandPoints: Point[] = [];
    for (let x = 476; x <= 650; x += 5) bandPoints.push([x, 280 - (x - 476) * 0.14 + band * 7 + Math.sin(x / 8) * 3]);
    const isDivider = band % 2 === 1;
    insertBands.push(
      `<path d="${buildSmoothPath(bandPoints)}" fill="none" stroke="${isDivider ? colors.ink : colors.amber}" stroke-width="${isDivider ? 1.6 : 3.5}"/>`,
    );
  }
  return [
    `<path d="${midsoleOutline}" fill="${colors.cream}"/>`,
    clipTo("midsoleClip", `<path d="${buildSmoothPath(recessPoints)}L650 360L20 360Z" fill="${colors.creamShade}"/>`),
    clipTo("midsoleClip", `<path d="${buildSmoothPath(recessPoints)}" fill="none" stroke="${colors.ink}" stroke-width="1.8"/>`),
    clipTo("midsoleClip", `<path d="${buildSmoothPath(ridgePoints)}" fill="none" stroke="${colors.creamDeep}" stroke-width="1.2"/>`),
    clipTo("midsoleClip", insertBands.join("")),
    clipTo("midsoleClip", `<path d="${buildSmoothPath([[30, 292], [200, 300], [450, 292], [630, 252]])}" fill="none" stroke="#FFFFFF" stroke-width="5"/>`),
  ].join("");
}

function buildOutsole(): string {
  // Lugs hang from the outsole's bottom edge.
  const bottomEdge: Point[] = [[92, 330], [200, 338], [400, 340], [560, 334], [600, 326]];
  const readBottomY = (x: number) => {
    for (let index = 1; index < bottomEdge.length; index++) {
      const [startX, startY] = bottomEdge[index - 1];
      const [endX, endY] = bottomEdge[index];
      if (x <= endX) return startY + ((endY - startY) * (x - startX)) / (endX - startX);
    }
    return bottomEdge[bottomEdge.length - 1][1];
  };
  const lugs: string[] = [];
  for (let x = 100; x < 580; x += 22) lugs.push(`M${x} ${roundToTenth(readBottomY(x) - 3)}l3 7h10l3 -7Z`);
  return `<path d="${outsoleOutline}" fill="${colors.ink}"/><path d="${lugs.join("")}" fill="${colors.ink}"/>`;
}

function buildOutline(): string {
  return [
    `<path d="${upperOutline}" fill="none" stroke="${colors.ink}" stroke-width="3" stroke-linejoin="round"/>`,
    `<path d="${midsoleOutline}" fill="none" stroke="${colors.ink}" stroke-width="2.6" stroke-linejoin="round"/>`,
  ].join("");
}

// ---------- the pose and the frame ----------

// Toe down, heel up, a little shorter than the drawing: translate, rotate, scale, recentre.
const pose = { rotationDegrees: -22, scaleX: 1.26, scaleY: 1.38, centre: [325, 210] as Point };
const poseTransform = `rotate(${pose.rotationDegrees}) scale(${pose.scaleX} ${pose.scaleY}) translate(${-pose.centre[0]} ${-pose.centre[1]})`;

function placePoint([x, y]: Point): Point {
  const scaledX = (x - pose.centre[0]) * pose.scaleX;
  const scaledY = (y - pose.centre[1]) * pose.scaleY;
  const radians = (pose.rotationDegrees * Math.PI) / 180;
  return [
    scaledX * Math.cos(radians) - scaledY * Math.sin(radians),
    scaledX * Math.sin(radians) + scaledY * Math.cos(radians),
  ];
}

type Frame = { minX: number; minY: number; size: number };

/** A square frame around the posed Sneaker: tight for the bare shoe, roomier with a background. */
function measureFrame(roomFactor: number): Frame {
  const placed = [...upperPoints, ...midsolePoints, ...outsolePoints, pullTabTop, [400, 348] as Point].map(placePoint);
  const padding = 24;
  const minX = Math.min(...placed.map(([x]) => x)) - padding;
  const maxX = Math.max(...placed.map(([x]) => x)) + padding;
  const minY = Math.min(...placed.map(([, y]) => y)) - padding;
  const maxY = Math.max(...placed.map(([, y]) => y)) + padding;
  const size = Math.round(Math.max(maxX - minX, maxY - minY) * roomFactor);
  return {
    minX: Math.round((minX + maxX) / 2 - size / 2),
    minY: Math.round((minY + maxY) / 2 - size / 2),
    size,
  };
}

const formatViewBox = (frame: Frame) => `${frame.minX} ${frame.minY} ${frame.size} ${frame.size}`;

const definitions = [
  "<defs>",
  `<pattern id="knit" width="7" height="13" patternUnits="userSpaceOnUse"><path d="M0 3h3M3.5 9.5h3" stroke="${colors.creamShade}" stroke-width="1.2" stroke-linecap="round"/></pattern>`,
  `<clipPath id="upperClip"><path d="${upperOutline}"/></clipPath>`,
  `<clipPath id="midsoleClip"><path d="${midsoleOutline}"/></clipPath>`,
  `<clipPath id="toeClip"><path d="${toeCapOutline}"/></clipPath>`,
  `<clipPath id="heelClip"><path d="${heelOutline}"/></clipPath>`,
  `<clipPath id="meshClip"><path d="${meshWindowOutline}"/></clipPath>`,
  // The shoe's outer shape, posed, for the cast shadow.
  `<g id="silhouette"><g transform="${poseTransform}"><path d="${upperOutline}"/><path d="${midsoleOutline}"/><path d="${outsoleOutline}"/></g></g>`,
  "</defs>",
].join("");

const sneakerGroup = [
  `<g transform="${poseTransform}">`,
  buildUpper(),
  buildMeshWindow(),
  buildToeCap(),
  buildSuede(),
  buildHeel(),
  buildCollarAndTongue(),
  buildLaces(),
  buildUpperShading(),
  buildMidsole(),
  buildOutsole(),
  buildOutline(),
  "</g>",
].join("");

// ---------- backgrounds ----------

/** A soft cast shadow, down and to the right: many faint copies of the silhouette, each further out. */
function buildCastShadow(shadowColor: string, layerOpacity: number): string {
  const layers: string[] = [];
  for (let index = 0; index < 36; index++)
    layers.push(`<use href="#silhouette" x="${roundToTenth(6 + index * 2.4)}" y="${roundToTenth(10 + index * 3.4)}"/>`);
  return `<g fill="${shadowColor}" fill-opacity="${layerOpacity}">${layers.join("")}</g>`;
}

/** A soft pool of light behind the shoe, faked with stacked translucent circles (no gradients). */
function buildLightPool(frame: Frame, lightColor: string, layerOpacity: number): string {
  const centreX = frame.minX + frame.size * 0.46;
  const centreY = frame.minY + frame.size * 0.44;
  const circles: string[] = [];
  for (let ring = 0; ring < 18; ring++)
    circles.push(`<circle cx="${Math.round(centreX)}" cy="${Math.round(centreY)}" r="${Math.round(frame.size * (0.48 - ring * 0.0235))}"/>`);
  return `<g fill="${lightColor}" fill-opacity="${layerOpacity}">${circles.join("")}</g>`;
}

/** The "+" marks in the four corners, as on the app's Sneaker card. */
function buildCornerMarks(frame: Frame, markColor: string): string {
  const inset = frame.size * 0.05;
  const arm = frame.size * 0.014;
  const corners: Point[] = [
    [frame.minX + inset, frame.minY + inset],
    [frame.minX + frame.size - inset, frame.minY + inset],
    [frame.minX + inset, frame.minY + frame.size - inset],
    [frame.minX + frame.size - inset, frame.minY + frame.size - inset],
  ];
  const marks = corners.map(([x, y]) => `M${roundToTenth(x - arm)} ${roundToTenth(y)}h${roundToTenth(arm * 2)}M${roundToTenth(x)} ${roundToTenth(y - arm)}v${roundToTenth(arm * 2)}`);
  return `<path d="${marks.join("")}" stroke="${markColor}" stroke-opacity="0.35" stroke-width="2"/>`;
}

/** Thin contour rings behind the shoe, echoing the toe cap's lines. */
function buildContourRings(frame: Frame, ringColor: string): string {
  const centreX = Math.round(frame.minX + frame.size * 0.5);
  const centreY = Math.round(frame.minY + frame.size * 0.47);
  const rings: string[] = [];
  for (let ring = 1; ring <= 22; ring++)
    rings.push(`<circle cx="${centreX}" cy="${centreY}" r="${Math.round(ring * frame.size * 0.03)}"/>`);
  return `<g fill="none" stroke="${ringColor}" stroke-opacity="0.12" stroke-width="1.5">${rings.join("")}</g>`;
}

type Background = { name: string; describe: string; build: (frame: Frame) => string };

const backgrounds: Background[] = [
  {
    name: "studio",
    describe: "warm wall, a pool of light and a soft cast shadow",
    build: (frame) =>
      `<rect x="${frame.minX}" y="${frame.minY}" width="${frame.size}" height="${frame.size}" fill="#E9E2D7"/>` +
      buildLightPool(frame, "#FFFFFF", 0.035) +
      buildCastShadow("#3A2A1A", 0.016),
  },
  {
    name: "contour",
    describe: "the studio wall with thin contour rings and corner marks",
    build: (frame) =>
      `<rect x="${frame.minX}" y="${frame.minY}" width="${frame.size}" height="${frame.size}" fill="#ECE6DC"/>` +
      buildContourRings(frame, colors.ink) +
      buildCornerMarks(frame, colors.ink) +
      buildCastShadow("#3A2A1A", 0.016),
  },
  {
    name: "night",
    describe: "the app's dark panel with a faint lime glow and corner marks",
    build: (frame) =>
      `<rect x="${frame.minX}" y="${frame.minY}" width="${frame.size}" height="${frame.size}" fill="#141515"/>` +
      buildLightPool(frame, "#C1FF00", 0.011) +
      buildCornerMarks(frame, "#FFFFFF") +
      buildCastShadow("#000000", 0.02),
  },
  {
    name: "volt",
    describe: "solid StrideMon lime with a deep green shadow",
    build: (frame) =>
      `<rect x="${frame.minX}" y="${frame.minY}" width="${frame.size}" height="${frame.size}" fill="#C1FF00"/>` +
      buildLightPool(frame, "#FFFFFF", 0.018) +
      buildCastShadow("#1F3300", 0.018),
  },
];

// ---------- output ----------

const outputDirectory = import.meta.dir;
const canMakePreviews = Bun.which("rsvg-convert") !== null;

function writeArt(fileStem: string, svg: string) {
  const svgPath = join(outputDirectory, `${fileStem}.svg`);
  writeFileSync(svgPath, `${svg}\n`);
  if (canMakePreviews) {
    Bun.spawnSync(["rsvg-convert", "--width", "1200", svgPath, "--output", join(outputDirectory, `${fileStem}.png`)]);
  }
  console.log(`wrote ${fileStem}.svg (${(svg.length / 1024).toFixed(1)} KB)${canMakePreviews ? " + .png" : ""}`);
}

// The bare shoe, transparent, for the app and any card.
writeArt(
  "sneaker",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${formatViewBox(measureFrame(1))}">${definitions}${sneakerGroup}</svg>`,
);

// The shoe on each background, with room around it for the shadow.
const roomyFrame = measureFrame(1.3);
for (const background of backgrounds) {
  writeArt(
    `sneaker-${background.name}`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${formatViewBox(roomyFrame)}">${definitions}${background.build(roomyFrame)}${sneakerGroup}</svg>`,
  );
}

if (!canMakePreviews) console.log("rsvg-convert not found (brew install librsvg), skipped the PNG previews");
