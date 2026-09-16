import type { FloorPlan, LocalizedText, Room } from './types.ts';

const IT_SRC = {
  it1: 'it_block/photo_2026-09-07_14-40-49.jpg',
  it2a: 'it_block/photo_2026-09-07_14-40-49 (2).jpg',
  it2b: 'it_block/photo_2026-09-07_14-40-50.jpg',
  it3: 'it_block/photo_2026-09-07_14-40-49 (3).jpg',
};

const blank = { kk: '', ru: '' };

function rect(x: number, y: number, w: number, h: number): string {
  return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
}

function firstRoom(
  suffix: string,
  path: string,
  labelAt: [number, number],
  code = '',
  name: LocalizedText = blank,
  kind: Room['kind'] = 'room',
): Room {
  return { id: `it-1-${suffix}`, code, name, path, labelAt, kind, source: IT_SRC.it1 };
}
function serviceRoom(suffix: string, path: string, labelAt: [number, number]): Room {
  return firstRoom(suffix, path, labelAt, '', blank, 'service');
}

// Manually traced from the plan at photo x239–890, y276–510.
// Coordinates remove the small photographic skew, not the drawing's stepped edges.
const it1: FloorPlan = {
  id: 'it-1',
  label: { kk: '1-қабат', ru: '1 этаж' },
  floor: 1,
  sectionId: null,
  viewBox: [7, 5, 1550, 590],
  sourceFiles: [IT_SRC.it1],
  outline: 'M146,25 H1278 V55 H1535 V507 H1292 V563 H415 V573 H27 V254 H146 Z',
  walls: [
    // Library, its lower passage and the stepped book store.
    'M466,25 V88 M466,109 V138 H210 M146,138 H173',
    'M466,138 V151 M466,171 V192',
    'M146,192 H201 M226,192 H529 V180 M529,151 V25',
    'M504,192 V313 H27',
    // Irregular room 157 wraps around the narrow space at its upper left.
    'M94,313 V436 M94,456 V472 H27',
    'M295,313 V465 H320 V486 M320,507 V573',
    // Upper room row, including the small narrow end room.
    'M590,25 V114 M590,135 V142 H707 V25',
    'M707,142 H839 M868,142 H953 M983,142 H1020 M1040,142 H1088',
    'M884,25 V142 M983,25 V142 M1048,25 V142',
    'M1001,25 V112',
    // Business room has an inset entry at its lower-left corner.
    'M1088,169 V265 H1222 V25',
    // Changing-area bays: short comb lines in the source are partitions,
    // not a third and fourth staircase.
    'M590,178 H722 M752,178 H866 M886,178 H917 M938,178 H957 M979,178 H1004 M1029,178 H1048 V282',
    'M590,178 V202 M590,220 V264',
    'M727,178 V264 M860,178 V264 M901,178 V264 M940,178 V308 H1089 M1118,308 H1169',
    'M590,226 H860',
    'M599,178 V195 M619,178 V195 M639,178 V195 M659,178 V195 M679,178 V195 M699,178 V195',
    'M748,209 V226 M768,209 V226 M788,209 V226 M808,209 V226 M828,209 V226 M848,209 V226',
    'M590,264 H686 M714,264 H741 M767,264 H940',
    'M883,237 V264 M922,237 V264',
    'M1004,178 V241 H940 M1004,232 H1048',
    'M940,308 H1048 M1048,299 V308',
    // Foyer/canteen boundary steps right above the lower stair.
    'M686,264 V310 M767,264 V321 M767,344 V359 H683 V563',
    'M320,548 H345 M394,548 H415 V563',
    'M943,563 V512 H983 M1019,512 H1057 V563',
    // Right-hand numbered stack; the corridor lies to its left.
    'M1278,55 V134 M1278,163 V187 M1278,213 V293',
    'M1278,158 H1535 M1278,260 H1535',
    'M1278,293 V356 H1535',
    // Small service room and kitchen below the business room.
    'M1169,295 H1278 M1169,295 V341 M1169,357 H1247 M1270,357 H1278',
    'M1169,357 V369 M1169,397 V563',
    // Small rooms below 161 are independent of that numbered room.
    'M1305,356 V394 H1342 M1366,394 H1379 M1399,394 H1418 M1441,394 H1475 M1494,394 H1535',
    'M1379,356 V394 M1418,356 V394 M1475,356 V394',
    'M1305,507 V425 H1316 M1342,425 H1383 M1409,425 H1420 V507',
    'M1368,425 V507 M1420,453 H1437 M1461,453 H1494 M1518,453 H1535',
    'M1478,453 V507 M1509,403 V418 H1535',
  ],
  stairs: [
    'M564,264 H663 V310 H564 Z M599,264 V310 M612,264 V310 M625,264 V310 M638,264 V310 M651,264 V310 M599,287 H663',
    'M594,469 H683 V514 H594 Z M606,469 V514 M618,469 V514 M630,469 V514 M642,469 V514 M654,469 V514 M594,491 H654',
  ],
  unclassifiedAreas: [],
  technicalAreas: [
    'M320,548 H415 V573 H320 Z',
    'M943,512 H1057 V563 H943 Z',
  ],
  icons: [
    { id: 'it-1-stairs-upper', kind: 'stairs', at: [613, 287], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
    { id: 'it-1-stairs-lower', kind: 'stairs', at: [638, 491], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
    { id: 'it-1-toilet-west', kind: 'toilet', at: [658, 202], size: 27, label: { kk: 'Дәретхана', ru: 'Туалет' } },
    { id: 'it-1-toilet-east', kind: 'toilet', at: [793, 202], size: 27, label: { kk: 'Дәретхана', ru: 'Туалет' } },
    { id: 'it-1-exit-north-west', kind: 'exit', at: [560, 25], size: 30, label: { kk: 'Шығу', ru: 'Выход' } },
    { id: 'it-1-exit-north-east', kind: 'exit', at: [1250, 55], size: 30, label: { kk: 'Шығу', ru: 'Выход' } },
    { id: 'it-1-exit-west', kind: 'exit', at: [370, 558], size: 30, label: { kk: 'Шығу', ru: 'Выход' } },
    { id: 'it-1-exit-east', kind: 'exit', at: [1001, 558], size: 30, label: { kk: 'Шығу', ru: 'Выход' } },
  ],
  notes: [
    { id: 'it-1-service-block', at: [1420, 410], size: 18, prominent: true, label: { kk: 'Көмекші бөлмелер', ru: 'Подсобные помещения' } },
  ],
  rooms: [
    firstRoom('library', rect(146, 25, 320, 113), [306, 81], '', { kk: 'Кітапхана', ru: 'Библиотека' }),
    firstRoom('bookfund', 'M146,192 H504 V313 H27 V254 H146 Z', [312, 253], '', { kk: 'Кітап қоймасы', ru: 'Книгохранилище' }),
    firstRoom('r157', 'M94,313 H295 V465 H320 V573 H27 V472 H94 Z', [197, 486], '157', { kk: 'Графикалық орталық', ru: 'Графический центр' }),
    firstRoom('left-compartment', rect(27, 313, 67, 159), [60.5, 392.5]),
    firstRoom('foyer', 'M295,313 H504 V192 H590 V264 H564 V310 H663 V264 H767 V359 H683 V469 H594 V514 H683 V563 H415 V548 H320 V465 H295 Z', [475, 424], '', { kk: 'Фойе', ru: 'Фойе' }),
    firstRoom('canteen', 'M767,264 H940 V308 H1169 V563 H1057 V512 H943 V563 H683 V359 H767 Z', [914, 421], '', { kk: 'Асхана', ru: 'Столовая' }),
    firstRoom('canteen-annex', 'M1169,357 H1305 V507 H1292 V563 H1169 Z', [1234, 461], '', { kk: 'Аспазхана', ru: 'Кухня' }),
    firstRoom('business', 'M1048,25 H1222 V265 H1088 V142 H1048 Z', [1148, 123], '', { kk: 'Бизнес стартап', ru: 'Бизнес стартап' }),
    firstRoom('r163', rect(1278, 55, 257, 103), [1406, 106], '163', { kk: 'Бұлтты бағдарламалау', ru: 'Облачное программирование' }),
    firstRoom('r162', rect(1278, 158, 257, 102), [1406, 209], '162', { kk: 'Деректер қоры', ru: 'База данных' }),
    firstRoom('r161', rect(1278, 260, 257, 96), [1406, 307], '161', { kk: 'Бағдарламалық жасақтаманы тестілеу', ru: 'Тестирование программного обеспечения' }),
    firstRoom('upper-a', rect(590, 25, 117, 117), [648, 84], '', { kk: 'NCCER кеңсесі', ru: 'Офис NCCER' }),
    firstRoom('upper-b', rect(707, 25, 177, 117), [795, 84], '158', { kk: 'Бұлтты бағдарламалау', ru: 'Облачное программирование' }),
    firstRoom('upper-c', rect(884, 25, 99, 117), [933, 84], '159', { kk: 'Имидж бөлімі', ru: 'Отдел имиджа' }),
    firstRoom('upper-d', rect(983, 25, 65, 117), [1016, 84], '', { kk: 'Элеватор', ru: 'Элеватор' }),
    firstRoom('central-west-upper', rect(590, 178, 137, 48), [658, 202], '', { kk: 'Дәретхана', ru: 'Туалет' }, 'toilet'),
    firstRoom('central-east-upper', rect(727, 178, 133, 48), [793, 202], '', { kk: 'Дәретхана', ru: 'Туалет' }, 'toilet'),
    firstRoom('central-west-lower', rect(590, 226, 137, 38), [658, 245], '', { kk: 'Киім ауыстыру бөлмесі', ru: 'Раздевалка' }),
    firstRoom('central-east-lower', rect(727, 226, 133, 38), [793, 245], '', { kk: 'Киім ауыстыру бөлмесі', ru: 'Раздевалка' }),
    firstRoom('central-narrow-west', rect(860, 178, 41, 86), [880, 221], '', { kk: 'Душ бөлмесі', ru: 'Душевая' }),
    firstRoom('central-narrow-east', rect(901, 178, 39, 86), [920, 221], '', { kk: 'Душ бөлмесі', ru: 'Душевая' }),
    firstRoom('central-inner', rect(940, 178, 64, 63), [972, 209], '', { kk: 'Бөлім меңгерушісі', ru: 'Заведующий отделением' }),
    firstRoom('central-corner', rect(1004, 178, 44, 54), [1026, 205], '', { kk: 'Электр қалқаны бөлмесі', ru: 'Электрощитовая' }),
    firstRoom('central-lower', 'M940,241 H1004 V232 H1048 V308 H940 Z', [993, 275], '', { kk: 'Мансап және жұмысқа орналастыру орталығы', ru: 'Центр карьеры и трудоустройства' }),
    firstRoom('kitchen-upper', rect(1169, 295, 109, 62), [1223, 326], '', { kk: 'Ыдыс жуу бөлмесі', ru: 'Моечная' }),
    serviceRoom('service-upper-west', rect(1305, 356, 74, 38), [1342, 375]),
    serviceRoom('service-upper-middle', rect(1379, 356, 39, 38), [1398, 375]),
    serviceRoom('service-upper-east', rect(1418, 356, 57, 38), [1446, 375]),
    serviceRoom('service-upper-end', rect(1475, 356, 60, 38), [1505, 375]),
    serviceRoom('service-lower-west', rect(1305, 425, 63, 82), [1336, 466]),
    serviceRoom('service-lower-middle', rect(1368, 425, 52, 82), [1394, 466]),
    serviceRoom('service-lower-east', rect(1420, 453, 58, 54), [1449, 480]),
    serviceRoom('service-lower-end', rect(1478, 453, 57, 54), [1506, 480]),
  ],
};

// The two photos show the same board. Rectified from its approximately
// 1000-by-350 plan; the narrow core is 96 units, left of the midpoint.
const it2: FloorPlan = {
  id: 'it-2',
  label: { kk: '2-қабат', ru: '2 этаж' },
  floor: 2,
  sectionId: null,
  viewBox: [0, 0, 1040, 390],
  sourceFiles: [IT_SRC.it2a, IT_SRC.it2b],
  outline: rect(20, 20, 1000, 350),
  walls: [
    'M420,20 V95 M420,120 V330 M420,353 V370',
    'M516,20 V45 M516,75 V207 M516,235 V330 M516,353 V370',
    'M420,135 H516 M420,245 H516',
    // The stage is a trapezoid inside the hall, not a rectangular room.
    'M41,87 L140,50 V343 L41,310',
  ],
  stairs: [
    'M420,20 H492 V80 H420 Z M450,20 V80 M460,20 V80 M470,20 V80 M480,20 V80 M420,52 H492',
    'M444,252 H516 V302 H444 Z M454,252 V302 M464,252 V302 M474,252 V302 M484,252 V302 M444,280 H516',
    'M140,82 H120 L140,132 Z M122,89 L140,85 M126,99 L140,92 M130,110 L140,100 M134,120 L140,108',
    'M140,270 L117,321 H140 Z M136,279 L140,288 M131,290 L140,302 M126,301 L140,315 M121,312 L137,321',
  ],
  icons: [
    { id: 'it-2-stairs-center-upper', kind: 'stairs', at: [456, 50], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
    { id: 'it-2-stairs-center-lower', kind: 'stairs', at: [480, 277], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
  ],
  unclassifiedAreas: [],
  rooms: [
    {
      id: 'it-2-act-hall',
      code: '',
      name: { kk: 'Акт залы', ru: 'Актовый зал' },
      path: rect(20, 20, 400, 350),
      labelAt: [258, 182],
      kind: 'room',
      source: IT_SRC.it2a,
    },
    {
      id: 'it-2-sport-hall',
      code: '',
      name: { kk: 'Спорт залы', ru: 'Спортивный зал' },
      path: rect(516, 20, 504, 350),
      labelAt: [768, 182],
      kind: 'room',
      source: IT_SRC.it2a,
    },
  ],
};

// The third-floor drawing has no room footprints in its blank side regions.
// Its core is wider than floor 2 and shifted farther left: 32–50.5% of width.
const it3: FloorPlan = {
  id: 'it-3',
  label: { kk: '3-қабат', ru: '3 этаж' },
  floor: 3,
  sectionId: null,
  viewBox: [0, 0, 1040, 390],
  sourceFiles: [IT_SRC.it3],
  outline: rect(20, 20, 1000, 350),
  walls: [
    'M340,20 V370 M525,20 V370',
    'M407,78 V370 M340,78 H382 M403,78 H435',
    'M340,309 H407',
  ],
  stairs: [
    'M456,27 H525 V78 H456 Z M463,27 V78 M470,27 V78 M477,27 V78 M484,27 V78 M491,27 V78 M498,27 V78 M456,51 H525',
    'M340,309 H407 V370 H340 Z M344,309 V370 M348,309 V370 M352,309 V370 M356,309 V370 M360,309 V370 M364,309 V370 M368,309 V370 M372,309 V370 M376,309 V370 M380,309 V370 M384,309 V370 M388,309 V370 M392,309 V370 M396,309 V370 M400,309 V370 M404,309 V370',
  ],
  icons: [
    { id: 'it-3-stairs-upper', kind: 'stairs', at: [490, 52], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
    { id: 'it-3-stairs-lower', kind: 'stairs', at: [373, 339], size: 34, label: { kk: 'Баспалдақ', ru: 'Лестница' } },
  ],
  unclassifiedAreas: [
    rect(20, 20, 320, 350),
    rect(525, 20, 495, 350),
    // Printed ventilation shaft: structural and noninteractive, not a classroom.
    rect(407, 78, 118, 292),
  ],
  rooms: [],
};

export const itPlans: FloorPlan[] = [it1, it2, it3];
