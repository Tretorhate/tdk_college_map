import type { FloorPlan, Room } from './types.ts';

const BLUEPRINT = 'industrial_block/b4e2b2e9-64fc-4abf-8b71-e94d1baf8b7c.jpeg';
const EARLIER_PHOTO = 'industrial_block/photo_2026-09-07_16-47-01.jpg';

function room(id: string, path: string, labelAt: [number, number]): Room {
  return {
    id: `industrial-workshop-${id}`,
    code: '',
    name: { kk: '', ru: '' },
    path,
    labelAt,
    kind: 'room',
    source: BLUEPRINT,
  };
}

const workshop: FloorPlan = {
  id: 'industrial-workshop',
  label: { kk: 'Шеберхана жоспары', ru: 'План мастерской' },
  floor: null,
  sectionId: null,
  // Measured in the new photograph's coordinates: x252–620, y154–534.
  // Parallel walls are straightened without rotating or joining the lower wings.
  viewBox: [237, 139, 398, 410],
  sourceFiles: [BLUEPRINT, EARLIER_PHOTO],
  outline:
    'M252,154 H365 V228 H519 V154 H620 V527 H519 V304 H442 V321 H426 V304 H365 V534 H252 Z',
  exteriorWalls: [
    // Visible gaps at the two upper exits, two lower right exits, lower left
    // exit, and the left wing's inward-facing exit below the connecting bar.
    'M326,154 H252 V534 H326',
    'M346,154 H365 V228 H519 V154 H582',
    'M604,154 H620 V527 H613',
    'M591,527 H554 M541,527 H519 V304',
    'M365,319 V534 H346',
    'M426,304 V321 H442 V304',
  ],
  walls: [
    // Three upper connector bays have solid dividers, unlike their thin fronts.
    'M365,228 V253 M423,228 V255 M460,228 V255',
    // Small central entry/utility area: trace the visible posts and openings.
    // The unexplained symbols do not establish stairs, toilets, or room uses.
    'M365,267 H372 M389,267 H428 M439,267 H519',
    'M365,281 V304 M380,267 V286 H365',
    // The inner face of the right wing continues through the connector;
    // its passage opening must not merge the bridge room into the tall bay.
    'M519,228 V250 M519,268 V304',
    'M380,286 V292 H389 V304 M389,267 V286',
    'M405,267 V302 M405,288 H419 M423,267 V304',
    'M419,284 V294 M460,271 V304',
    'M420,304 H428 M442,304 H446 M456,304 H469 M480,304 H502 M514,304 H519',
    // This solid cross-wall in the outer right strip was hidden by reflection
    // in the earlier photograph. It is distinct from the thin line at y357.
    'M572,314 H620',
  ],
  dashedLines: [
    // Lightweight boundaries are reproduced as drawn, without guessing material.
    // Left wing: ten unequal bays; the tall penultimate bay stays undivided.
    'M313,154 V534',
    'M252,190 H313 M252,216 H313 M252,243 H313 M252,266 H313',
    'M252,324 H313 M252,361 H313 M252,381 H313 M252,417 H313 M252,494 H313',
    'M257,361 V381',
    // Thin frontage of the upper connector and the upper right inset bay.
    'M365,255 H519',
    'M519,190 H572 M519,228 H572 M519,246 H552 V238',
    // Right wing: upper passage, two inner bays, narrow connecting passage,
    // lower bay, and the three now-visible sections along the outer edge.
    'M572,154 V527',
    'M572,259 H620 M572,357 H620',
    'M519,266 H559 V445 H519 M519,357 H559',
  ],
  stairs: [],
  unclassifiedAreas: [
    // Small unlabeled central symbols remain structural, not invented rooms.
    'M365,267 H380 V292 H365 Z',
  ],
  rooms: [
    room('l1', 'M252,154 H313 V190 H252 Z', [282, 172]),
    room('l2', 'M252,190 H313 V216 H252 Z', [282, 203]),
    room('l3', 'M252,216 H313 V243 H252 Z', [282, 229]),
    room('l4', 'M252,243 H313 V266 H252 Z', [282, 254]),
    room('l5', 'M252,266 H313 V324 H252 Z', [282, 295]),
    room('l6', 'M252,324 H313 V361 H252 Z', [282, 342]),
    room('l7', 'M257,361 H313 V381 H257 Z', [285, 371]),
    room('l8', 'M252,381 H313 V417 H252 Z', [282, 399]),
    room('l9', 'M252,417 H313 V494 H252 Z', [282, 455]),
    room('l10', 'M252,494 H313 V534 H252 Z', [282, 514]),
    room('bridge-upper-left', 'M365,228 H423 V255 H365 Z', [394, 241]),
    room('bridge-upper-middle', 'M423,228 H460 V255 H423 Z', [441, 241]),
    room('bridge-upper-right', 'M460,228 H519 V255 H460 Z', [489, 241]),
    room('bridge-inset', 'M389,267 H405 V304 H389 Z', [397, 285]),
    room('bridge-small-upper', 'M405,267 H423 V288 H405 Z', [414, 277]),
    room('bridge-small-lower', 'M405,288 H423 V304 H405 Z', [414, 296]),
    room('bridge-lower-right', 'M460,267 H519 V304 H460 Z', [489, 285]),
    room('r1', 'M519,154 H572 V190 H519 Z', [545, 172]),
    room('r2', 'M519,190 H572 V228 H519 Z', [545, 209]),
    room('r3', 'M519,228 H552 V246 H519 Z', [535, 237]),
    room('r4', 'M519,266 H559 V357 H519 Z', [539, 311]),
    room('r5', 'M519,357 H559 V445 H519 Z', [539, 401]),
    room('r6', 'M519,445 H572 V527 H519 Z', [545, 486]),
    room('outer-right-upper', 'M572,259 H620 V314 H572 Z', [596, 286]),
    room('outer-right-middle', 'M572,314 H620 V357 H572 Z', [596, 335]),
    room('outer-right-lower', 'M572,357 H620 V527 H572 Z', [596, 442]),
  ],
};

export const industrialPlans: FloorPlan[] = [workshop];
