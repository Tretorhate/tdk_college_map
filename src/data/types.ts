export interface LocalizedText {
  kk: string;
  ru: string;
}

export type RoomKind = 'room' | 'toilet' | 'technical';

export interface Room {
  /** Globally unique, building/floor-qualified; never shown as a room code. */
  id: string;
  /** Printed room code, or '' when absent/illegible/ambiguous. */
  code: string;
  name: LocalizedText;
  /** SVG path data for the room footprint. */
  path: string;
  /** Label/centering coordinates within the plan viewBox. */
  labelAt: [number, number];
  kind: RoomKind;
  /** Original relative source filename under /home/tret/Downloads/college_plan. */
  source: string;
}

export type PlanSectionId = 'horizontal' | 'l-shaped' | null;
export type MapIconKind = 'stairs' | 'toilet' | 'exit';

export interface MapIcon {
  /** Stable plan-local identifier for the non-interactive visual marker. */
  id: string;
  kind: MapIconKind;
  /** Center point in the plan's SVG coordinate system. */
  at: [number, number];
  /** Badge size in plan units. */
  size?: number;
  label: LocalizedText;
}
export interface MapNote {
  /** Stable plan-local note identifier. */
  id: string;
  /** Note anchor in the plan's SVG coordinate system. */
  at: [number, number];
  label: LocalizedText;
}



export interface FloorPlan {
  /** Globally unique plan id. */
  id: string;
  label: LocalizedText;
  /** Printed floor, or null when the source prints none. */
  floor: number | null;
  sectionId: PlanSectionId;
  viewBox: [number, number, number, number];
  /** Original relative source files, including additional views of the same plan. */
  sourceFiles: string[];
  outline: string;
  walls: string[];
  /** Explicit perimeter strokes when the source shows exterior doorway gaps. */
  exteriorWalls?: string[];
  /** Dashed source boundaries, without inferring their material or purpose. */
  dashedLines?: string[];
  stairs: string[];
  /** Reference-style facility markers backed by source-plan evidence. */
  icons?: MapIcon[];
  /** Non-interactive evidence notes shown on the plan. */
  notes?: MapNote[];
  /** Non-interactive light-gray escape/stair compartments shown as rooms. */
  technicalAreas?: string[];
  unclassifiedAreas: string[];
  rooms: Room[];
}

export interface Building {
  id: string;
  name: LocalizedText;
  plans: FloorPlan[];
}

export interface RoomMatch {
  building: Building;
  plan: FloorPlan;
  room: Room;
}
