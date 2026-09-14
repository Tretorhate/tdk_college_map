import type { FloorPlan, MapIcon, MapNote, Room } from './types.ts';

// Coordinates are measured from each source drawing, not a generated room grid.
// Slight camera skew is straightened; differing floor partitions stay explicit.
type Bay = [x: number, y: number, right: number, bottom: number, side: 't' | 'b' | 'l' | 'r', door: number];
type PointTransform = (x: number, y: number) => [number, number];

type PlanFragment = Pick<
  FloorPlan,
  'outline' | 'walls' | 'stairs' | 'unclassifiedAreas' | 'rooms'
> & Pick<FloorPlan, 'exteriorWalls' | 'dashedLines' | 'icons' | 'technicalAreas' | 'notes'>;

const rectangle = (x: number, y: number, r: number, b: number) => `M${x},${y} H${r} V${b} H${x} Z`;

function bayWalls([x,y,r,b,side,door]: Bay): string {
  const gap = 7;
  const h = (yy: number, s: string) => side === s ? `M${x},${yy} H${door-gap} M${door+gap},${yy} H${r}` : `M${x},${yy} H${r}`;
  const v = (xx: number, s: string) => side === s ? `M${xx},${y} V${door-gap} M${xx},${door+gap} V${b}` : `M${xx},${y} V${b}`;
  return [h(y,'t'),h(b,'b'),v(x,'l'),v(r,'r')].join(' ');
}

function flight(x: number,y: number,r: number,b: number): string {
  let path = rectangle(x,y,r,b) + ` M${x},${(y+b)/2} H${r}`;
  for(let xx=x+4;xx<r;xx+=4) path+=` M${xx},${y} V${b}`;
  return path;
}
const stairIconCenters: Record<string, readonly (readonly [number, number])[]> = {
  'main-horizontal-1': [[466.5, 402.5], [731, 404.5]],
  'main-horizontal-2': [[464.5, 345], [702, 345]],
  'main-horizontal-3': [[501.5, 345], [701.5, 345]],
  'main-horizontal-4': [[543, 327.5], [745, 327.5]],
  'main-l-shaped-1': [[671, 588.5]],
  'main-l-shaped-2': [[218.5, 657.5], [799.5, 599]],
  'main-l-shaped-3': [[328, 656.5]],
};

function mainPlanIcons(id: string): MapIcon[] {
  return (stairIconCenters[id] ?? []).map(([x, y], index) => ({
    id: `${id}-stairs-${index + 1}`,
    kind: 'stairs',
    at: [x, y],
    size: 22,
    label: { kk: 'Баспалдақ', ru: 'Лестница' },
  }));
}

function mainRoomMeta(id: string, index: number): { code: string; name: { kk: string; ru: string } } {
  const match = /^main-(horizontal|l-shaped)-(\d+)$/.exec(id);
  if (!match) {
    const code = `X${(index + 1).toString(36).toUpperCase().padStart(2, '0')}`;
    return { code, name: { kk: code, ru: code } };
  }
  const floor = match[2];
  const wingCode = match[1] === 'horizontal' ? 'H' : 'L';
  const code = `${floor}${wingCode}${(index + 1).toString(36).toUpperCase()}`;
  return { code, name: { kk: code, ru: code } };
}

const missingWingSource = 'main_block/main_part_1.jpg';

function specifiedRoom(
  id: string,
  x: number,
  y: number,
  r: number,
  b: number,
  kind: Room['kind'] = 'room',
  name: Room['name'] = { kk: '', ru: '' },
  code = '',
): Room {
  return { id, code, name, path: rectangle(x, y, r, b), labelAt: [(x + r) / 2, (y + b) / 2], kind, source: missingWingSource };
}

function namedMissingRoom(
  id: string,
  x: number,
  y: number,
  r: number,
  b: number,
  index: number,
  kind: Room['kind'] = 'room',
): Room {
  const code = `1W${index.toString(36).toUpperCase()}`;
  return specifiedRoom(id, x, y, r, b, kind, { kk: code, ru: code }, code);
}

// User-provided first-floor contents for the previously undocumented wing.
const missingWingRooms: Room[] = [
  namedMissingRoom('main-floor-1-missing-wing-large-1', 710, 710, 775, 804, 1),
  namedMissingRoom('main-floor-1-missing-wing-large-2', 710, 804, 775, 898, 2),
  namedMissingRoom('main-floor-1-missing-wing-small-1', 710, 898, 775, 943, 3),
  namedMissingRoom('main-floor-1-missing-wing-small-2', 710, 943, 775, 1018, 4),
  namedMissingRoom('main-floor-1-missing-wing-right-1', 810, 710, 906, 812, 5),
  namedMissingRoom('main-floor-1-missing-wing-right-2', 810, 812, 906, 915, 6),
  namedMissingRoom('main-floor-1-missing-wing-right-3', 810, 915, 906, 1018, 7),
  namedMissingRoom('main-floor-1-missing-wing-women-toilet', 750, 1056, 785, 1128, 8, 'toilet'),
  namedMissingRoom('main-floor-1-missing-wing-men-toilet', 815, 1056, 850, 1128, 9, 'toilet'),
  namedMissingRoom('main-floor-1-missing-wing-room-1', 850, 1056, 925, 1128, 10),
  namedMissingRoom('main-floor-1-missing-wing-room-2', 925, 1056, 1001, 1128, 11),
  namedMissingRoom('main-floor-1-missing-wing-toilet-annex', 785, 1056, 815, 1128, 12),
];

const missingWingIcons: MapIcon[] = [
  { id: 'main-floor-1-missing-wing-stairs', kind: 'stairs', at: [732, 1096.5], size: 22, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
  { id: 'main-floor-1-missing-wing-women-toilet-icon', kind: 'toilet', at: [767.5, 1092], size: 20, label: { kk: 'Әйелдер дәретханасы', ru: 'Женский туалет' } },
  { id: 'main-floor-1-missing-wing-men-toilet-icon', kind: 'toilet', at: [832.5, 1092], size: 20, label: { kk: 'Ерлер дәретханасы', ru: 'Мужской туалет' } },
];

const missingWingWalls = [
  // The vertical corridor links the upper and lower circulation routes.
  'M775,710 V743 M775,771 V804 M775,804 V837 M775,865 V898 M775,898 V914 M775,942 V974 M775,1002 V1018',
  'M810,710 V754 M810,768 V812 M810,812 V856 M810,870 V915 M810,915 V959 M810,973 V1018',
  // Four left rooms: two larger upper bays, then two smaller lower bays.
  'M710,804 H775 M710,898 H775 M710,943 H775',
  // Three equal rooms on the right side.
  'M810,812 H906 M810,915 H906',
  // Bottom corridor remains open at x775–810.
  'M710,1018 H775 M810,1018 H906',
  // Stair enclosure, toilets left of the two bottom rooms.
  'M750,1056 V1085 M750,1099 V1128',
  'M785,1056 V1078 M785,1092 V1128 M815,1056 V1078 M815,1092 V1128 M850,1056 V1078 M850,1092 V1128 M925,1056 V1078 M925,1092 V1128',
  'M750,1056 H762 M776,1056 H785 M785,1056 H793 M807,1056 H815 M815,1056 H826 M840,1056 H850 M850,1056 H868 M882,1056 H925 M925,1056 H943 M957,1056 H1001',
];

function traced(id: string, floor: number, sectionId: 'horizontal'|'l-shaped', source: string, viewBox: FloorPlan['viewBox'], outline: string, bays: Bay[], stairs: string[], walls: string[] = [], unclassifiedAreas: string[] = [], wallTrace?: string[]): FloorPlan {
  const rooms: Room[] = bays.map(([x,y,r,b],i) => {
    const meta = mainRoomMeta(id, i);
    return { id: `${id}-r${i + 1}`, ...meta, path: rectangle(x, y, r, b), labelAt: [(x + r) / 2, (y + b) / 2], kind: 'room', source };
  });
  return {
    id,
    floor,
    sectionId,
    label: { kk: `${floor}-қабат`, ru: `${floor} этаж` },
    sourceFiles: [source],
    viewBox,
    outline,
    rooms,
    stairs,
    icons: mainPlanIcons(id),
    walls: wallTrace ?? [...bays.map(bayWalls), ...walls],
    unclassifiedAreas,
  };
}

function formatCoordinate(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

/** Transform the absolute M/H/V/L paths used by the main source traces. */
function transformPath(path: string, transform: PointTransform): string {
  const tokens = path.match(/[A-Za-z]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)/g) ?? [];
  const output: string[] = [];
  let command = '';
  let x = 0;
  let y = 0;

  for (let index = 0; index < tokens.length;) {
    const token = tokens[index++];
    if (/^[A-Za-z]$/.test(token)) {
      command = token.toUpperCase();
      if (command === 'Z') {
        output.push('Z');
        command = '';
      }
      continue;
    }

    if (command === 'M' || command === 'L') {
      const nextY = tokens[index++];
      if (nextY === undefined) throw new Error(`Malformed path: ${path}`);
      const nextX = Number(token);
      const nextYValue = Number(nextY);
      const [tx, ty] = transform(nextX, nextYValue);
      output.push(`${command === 'M' ? 'M' : 'L'}${formatCoordinate(tx)},${formatCoordinate(ty)}`);
      x = nextX;
      y = nextYValue;
      if (command === 'M') command = 'L';
      continue;
    }

    if (command === 'H') {
      const nextX = Number(token);
      const [tx, ty] = transform(nextX, y);
      output.push(`L${formatCoordinate(tx)},${formatCoordinate(ty)}`);
      x = nextX;
      continue;
    }

    if (command === 'V') {
      const nextY = Number(token);
      const [tx, ty] = transform(x, nextY);
      output.push(`L${formatCoordinate(tx)},${formatCoordinate(ty)}`);
      y = nextY;
      continue;
    }

    throw new Error(`Unsupported path command ${command} in ${path}`);
  }

  return output.join(' ');
}

function transformFragment(source: FloorPlan, transform: PointTransform): PlanFragment {
  const transformPoint = ([x, y]: [number, number]): [number, number] => transform(x, y);
  return {
    outline: transformPath(source.outline, transform),
    walls: source.walls.map((path) => transformPath(path, transform)),
    exteriorWalls: source.exteriorWalls?.map((path) => transformPath(path, transform)),
    dashedLines: source.dashedLines?.map((path) => transformPath(path, transform)),
    stairs: source.stairs.map((path) => transformPath(path, transform)),
    icons: source.icons?.map((icon): MapIcon => ({ ...icon, at: transformPoint(icon.at) })),
    technicalAreas: source.technicalAreas?.map((path) => transformPath(path, transform)),
    unclassifiedAreas: source.unclassifiedAreas.map((path) => transformPath(path, transform)),
    notes: source.notes?.map((note): MapNote => ({ ...note, at: transformPoint(note.at) })),
    rooms: source.rooms.map((room): Room => ({
      ...room,
      path: transformPath(room.path, transform),
      labelAt: transformPoint(room.labelAt),
    })),
  };
}

function composeFirstFloor(horizontal: FloorPlan, lower: FloorPlan): FloorPlan {
  // The rectangular source turns counterclockwise; the lower source stays upright
  // and remains offset to its lower-right, matching the repeated main-part
  // composition. The lower-left footprint follows the top-view silhouette;
  // only its corner stair is inferred from floor two, not room partitions.
  const upper = transformFragment(horizontal, (x, y) => [y + 350, -x + 900]);
  const lowerFragment = transformFragment(lower, (x, y) => [x + 600, y + 450]);
  const missingWing = 'M775,710 H906 V1018 H993 V1056 H1001 V1128 H710 V710 H775 Z';
  const missingWingStair = flight(722,1075,742,1118);
  // Stroke only the combined perimeter, never the edges where source fragments join.
  // Breaks in the front block follow the entrance and exterior exits in its diagram.
  const exteriorWalls = [
    'M1198,666 H1202 V692 H1278 V865',
    'M1278,879 V953 H1374 V1128 H1211',
    'M1197,1128 H710 V710 H775 V658 H729 V409 H704 V379 H729 V218 H704 V189 H729 V35 H906 V658 H810 V710 H906 V1018 H1110 V692 H1180 V666 H1184',
  ];
  const dashedLines = [...(upper.dashedLines ?? []), ...(lowerFragment.dashedLines ?? [])];
  const technicalAreas = [...(upper.technicalAreas ?? []), ...(lowerFragment.technicalAreas ?? [])];

  return {
    id: 'main-floor-1',
    floor: 1,
    sectionId: null,
    label: { kk: '1-қабат', ru: '1 этаж' },
    sourceFiles: [...horizontal.sourceFiles, ...lower.sourceFiles, missingWingSource],
    viewBox: [680, 0, 740, 1170],
    outline: `${upper.outline} ${lowerFragment.outline} ${missingWing}`,
    walls: [...upper.walls, ...missingWingWalls, ...lowerFragment.walls],
    ...(exteriorWalls.length > 0 ? { exteriorWalls } : {}),
    ...(dashedLines.length > 0 ? { dashedLines } : {}),
    stairs: [...upper.stairs, missingWingStair, ...lowerFragment.stairs],
    icons: [
      ...(upper.icons ?? []),
      ...missingWingIcons,
      ...(lowerFragment.icons ?? []),
    ],
    ...(technicalAreas.length > 0 ? { technicalAreas } : {}),
    unclassifiedAreas: [...upper.unclassifiedAreas, ...lowerFragment.unclassifiedAreas],
    notes: [
      {
        id: 'main-floor-1-connection-note',
        at: [900, 1040],
        label: { kk: 'Сол қанат бөлмелері анықталды', ru: 'Помещения левого крыла определены' },
      },
    ],
    rooms: [...upper.rooms, ...missingWingRooms, ...lowerFragment.rooms],
  };
}

function composeUpperFloor(horizontal: FloorPlan, lower: FloorPlan, upperBounds: FloorPlan['viewBox'], lowerTransform: PointTransform, outline?: string): FloorPlan {
  const [left, top, width, height] = upperBounds;
  const upper = transformFragment(horizontal, (x, y) => [
    729 + (y - top) * 177 / height,
    35 + (left + width - x) * (559 * 177 / 154) / width,
  ]);
  const bottom = transformFragment(lower, lowerTransform);
  return {
    id: `main-floor-${horizontal.floor}`,
    floor: horizontal.floor,
    sectionId: null,
    label: horizontal.label,
    sourceFiles: [...horizontal.sourceFiles, ...lower.sourceFiles],
    viewBox: [680, 0, 740, 1170],
    outline: outline ?? `${upper.outline} ${bottom.outline}`,
    walls: [...upper.walls, ...bottom.walls],
    stairs: [...upper.stairs, ...bottom.stairs],
    icons: [...(upper.icons ?? []), ...(bottom.icons ?? [])],
    unclassifiedAreas: [...upper.unclassifiedAreas, ...bottom.unclassifiedAreas],
    rooms: [...upper.rooms, ...bottom.rooms],
  };
}

// Align matching structural landmarks rather than stretching the whole L-shape:
// its upright wing, corridor and bottom room band must retain common dimensions.
function alignCoordinate(value: number, landmarks: readonly (readonly [number, number])[]): number {
  let index = 1;
  while (index < landmarks.length - 1 && value > landmarks[index][0]) index++;
  const [from, to] = landmarks[index - 1];
  const [nextFrom, nextTo] = landmarks[index];
  return to + (value - from) * (nextTo - to) / (nextFrom - from);
}

function placeUpperFloorMain(x: number, y: number): [number, number] {
  return [729 + (x - 205) * 645 / 697, 1128 + (y - 688) * 645 / 697];
}

const thirdFloorX: readonly (readonly [number, number])[] = [
  [313, 205], [374, 269], [399, 299], [456, 360], [731, 648], [886, 811], [909, 902],
];
const thirdFloorY: readonly (readonly [number, number])[] = [
  [291, 260], [518, 505], [590, 580], [620, 616], [683, 688],
];

const mainSourcePlans: FloorPlan[] = [
  traced("main-horizontal-1", 1, 'horizontal', "main_block/photo_2026-09-07_16-47-10.jpg", [155, 345, 725, 230], "M242,379 H491 V354 H521 V379 H682 V354 H711 V379 H865 V556 H242 V460 H170 V425 H242 Z",
    [[242, 379, 345, 425, "b", 332], [345, 379, 389, 425, "b", 380], [389, 379, 432, 425, "b", 418], [242, 460, 339, 556, "t", 332], [339, 460, 384, 556, "r", 478], [384, 460, 432, 556, "t", 404], [432, 460, 518, 556, "t", 447], [518, 460, 598, 556, "t", 580], [598, 460, 727, 556, "t", 622], [727, 460, 772, 556, "t", 740], [772, 379, 865, 556, "l", 444]],
    [flight(443,384,490,421), flight(710,384,752,425)], ["M432,379 V425 H520 V413 M682,413 V428 H772", "M772,470 V531"], []),
  traced("main-horizontal-2", 2, 'horizontal', "main_block/photo_2026-09-07_16-47-11.jpg", [258, 311, 583, 178], "M270,323 H829 V477 H270 Z",
    [[270, 323, 356, 477, "r", 379.5], [743, 323, 829, 477, "l", 379.5], [356, 323, 433, 366, "b", 420], [515, 323, 549, 366, "b", 536], [549, 323, 588, 366, "b", 575], [588, 323, 664, 366, "b", 651], [356, 393, 397, 477, "t", 369], [397, 393, 585, 477, "t", 410], [585, 393, 699, 477, "t", 598], [699, 393, 743, 477, "t", 712]],
    [flight(444,330,485,360), flight(683,330,721,360)], [], []),
  traced("main-horizontal-3", 3, 'horizontal', "main_block/photo_2026-09-07_16-47-11 (2).jpg", [328, 315, 491, 154], "M340,327 H807 V457 H340 Z",
    [[340, 327, 412, 457, "r", 375.0], [735, 327, 807, 457, "l", 375.0], [412, 327, 475, 364, "b", 462], [539, 327, 570, 364, "b", 557], [570, 327, 602, 364, "b", 589], [602, 327, 668, 364, "b", 655], [412, 386, 445, 457, "t", 425], [445, 386, 600, 457, "t", 458], [600, 386, 698, 457, "t", 613], [698, 386, 735, 457, "t", 711]],
    [flight(484,332,519,358), flight(686,332,717,358)], [], []),
  traced("main-horizontal-4", 4, 'horizontal', "main_block/photo_2026-09-07_16-47-11 (3).jpg", [359, 296, 499, 158], "M371,308 H846 V442 H371 Z",
    [[371, 308, 448, 442, "r", 360.0], [777, 308, 846, 442, "l", 360.0], [448, 308, 517, 347, "b", 504], [583, 308, 612, 347, "b", 599], [612, 308, 647, 347, "b", 634], [647, 308, 713, 347, "b", 700], [448, 373, 483, 442, "t", 461], [483, 373, 646, 442, "t", 496], [646, 373, 744, 442, "t", 659], [744, 373, 777, 442, "t", 757]],
    [flight(528,314,558,341), flight(730,314,760,341)], [], []),
  traced("main-l-shaped-1", 1, 'l-shaped', "main_block/photo_2026-09-07_14-48-13.jpg", [388, 206, 400, 492], "M510,242 H580 V216 H602 V242 H678 V503 H774 V677 H401 V606 H393 V568 H510 Z",
    [[510, 242, 550, 305, "r", 272], [550, 276, 578, 305, "r", 291], [550, 242, 578, 267, "b", 565], [510, 305, 585, 338, "r", 327], [510, 338, 585, 422, "r", 346], [510, 422, 585, 487, "r", 438], [510, 487, 585, 552, "r", 499], [607, 296, 630, 359, "r", 326], [630, 296, 678, 359, "l", 326], [607, 359, 678, 475, "b", 625], [607, 475, 678, 518, "l", 504], [403, 606, 463, 678, "t", 412], [463, 606, 537, 678, "r", 650], [710, 629, 774, 677, "l", 654]],
    [flight(651,577,691,600), flight(682,527,692,545)], [], ["M678,503 H774 V629 H743 V581 H710 V550 H678 Z"], [
      // Shared partitions are traced once so neighboring room rectangles cannot
      // close a doorway. Cropped source edges are not interior building walls.
      "M550,242 V267 M550,276 V305 M550,267 H558 M572,267 H578 M550,276 H578",
      "M578,242 V267 M578,276 V284 M578,298 V305 M510,305 H578",
      "M602,242 V270 H650 V242 M607,276 H673",
      "M510,338 H585 M585,305 V320 M585,334 V339 M585,353 V422 H510",
      "M585,422 V431 M585,445 V487 H510 M585,487 V492 M585,506 V552 H510",
      "M585,552 V565 H510",
      "M607,296 H612 M624,296 H678 M630,296 V319 M630,333 V359 M607,359 H678",
      "M607,296 V475 H618 M632,475 H678",
      "M607,475 V497 M607,511 V518 H655 V522 H677",
      "M607,518 V526 M607,548 H677 V560 H607 Z",
      "M678,503 V524 M678,542 V550 H710 V574",
      "M403,606 H405 M419,606 H463 V678",
      "M463,606 H554 M568,606 H597 M611,606 H636 M650,606 H710",
      "M537,606 V643 M537,657 V678",
      "M710,592 V622 H727 M741,622 H743 V581",
      "M710,622 V647 M710,661 V677 M743,629 H774",
    ]),
  traced("main-l-shaped-2", 2, 'l-shaped', "main_block/photo_2026-09-07_14-48-13 (2).jpg", [188, 245, 727, 458], "M205,260 H360 V580 H648 V505 H811 V524 H902 V688 H205 Z",
    [[205, 260, 269, 353, "r", 342], [205, 353, 269, 447, "r", 432], [205, 447, 269, 535, "r", 519], [205, 535, 269, 569, "r", 559], [299, 260, 360, 353, "l", 297], [299, 353, 360, 447, "l", 377], [299, 447, 360, 535, "l", 472], [299, 535, 360, 580, "l", 558], [230, 616, 300, 687, "t", 287], [300, 616, 375, 687, "t", 317], [375, 616, 488, 687, "t", 397], [488, 616, 523, 687, "t", 506], [523, 616, 635, 687, "t", 541], [635, 616, 674, 687, "l", 654], [674, 616, 714, 687, "t", 689], [714, 616, 835, 687, "t", 729], [648, 505, 743, 568, "b", 723], [743, 505, 811, 568, "r", 550]],
    [flight(207,637,230,678), flight(779,585,820,613)], ["M648,568 H716 V580 H648 M768,568 H811 V580 H768", "M835,524 V638 M835,659 V688 M864,648 H902"], ["M835,524 H902 V688 H835 Z"]),
  traced("main-l-shaped-3", 3, 'l-shaped', "main_block/photo_2026-09-07_14-48-13 (3).jpg", [295, 275, 628, 424], "M313,291 H456 V590 H731 V518 H886 V590 H909 V683 H313 Z",
    [[313, 291, 374, 379, "r", 365], [313, 379, 374, 466, "r", 454], [313, 466, 374, 548, "r", 534], [313, 548, 374, 581, "r", 568], [399, 291, 456, 379, "l", 326], [399, 379, 456, 466, "l", 400], [399, 466, 456, 581, "l", 491], [343, 620, 389, 682, "t", 356], [389, 620, 414, 682, "t", 402], [414, 620, 480, 682, "t", 432], [480, 620, 616, 682, "t", 503], [616, 620, 721, 682, "t", 650], [721, 620, 754, 682, "t", 739], [754, 620, 797, 682, "t", 771], [797, 620, 909, 682, "t", 814], [845, 519, 886, 550, "l", 535], [845, 550, 886, 590, "l", 570]],
    [flight(318,638,338,675)], ["M731,518 V583 H828 V554 M828,578 V590 M845,518 V526"], ["M731,518 H828 V583 H731 Z"]),
];

const firstFloor = composeFirstFloor(mainSourcePlans[0], mainSourcePlans[4]);
const mainFloor4: FloorPlan = {
  ...mainSourcePlans[3],
  notes: [
    {
      id: 'main-floor-4-coverage-note',
      at: [610, 300],
      label: { kk: 'Төменгі қанат дерегі жоқ', ru: 'Нет данных о нижнем крыле' },
    },
  ],
};

const secondFloor = composeUpperFloor(
  mainSourcePlans[1], mainSourcePlans[5], [270, 323, 559, 154], placeUpperFloorMain,
);

export const mainPlans: FloorPlan[] = [
  firstFloor,
  secondFloor,
  composeUpperFloor(
    mainSourcePlans[2], mainSourcePlans[6], [340, 327, 467, 130],
    (x, y) => placeUpperFloorMain(alignCoordinate(x, thirdFloorX), alignCoordinate(y, thirdFloorY)),
    secondFloor.outline,
  ),
  mainFloor4,
];
