import type { Building, RoomMatch } from '../data/types.ts';

export function buildRoomIndex(buildings: Building[]): RoomMatch[] {
  const index: RoomMatch[] = [];
  for (const building of buildings) {
    for (const plan of building.plans) {
      for (const room of plan.rooms) {
        index.push({ building, plan, room });
      }
    }
  }
  return index;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function searchRooms(index: RoomMatch[], query: string): RoomMatch[] {
  const q = normalize(query);
  if (q === '') return [];
  const exact: RoomMatch[] = [];
  const partial: RoomMatch[] = [];
  for (const match of index) {
    const code = normalize(match.room.code);
    const kk = normalize(match.room.name.kk);
    const ru = normalize(match.room.name.ru);
    const hasName = kk !== '' || ru !== '';
    // Entirely unnamed blank-code rooms are selectable but absent from search.
    if (code === '' && !hasName) continue;
    if (code !== '' && code === q) {
      exact.push(match);
      continue;
    }
    if (
      (code !== '' && code.toLowerCase().includes(q)) ||
      (kk !== '' && kk.includes(q)) ||
      (ru !== '' && ru.includes(q))
    ) {
      partial.push(match);
    }
  }
  return [...exact, ...partial];
}
