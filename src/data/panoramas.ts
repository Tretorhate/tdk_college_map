import { buildings } from './buildings.ts';
import type { PanoramaPoint } from './types.ts';


/**
 * Published panorama coverage. The placeholder entry is temporary development
 * content — replace it with approved real imagery before release.
 */
export const panoramaPoints: PanoramaPoint[] = [
  {
    id: 'it-1-foyer-placeholder',
    buildingId: 'it',
    planId: 'it-1',
    at: [475, 424],
    label: { kk: 'Фойе (тест)', ru: 'Фойе (тест)' },
    image: 'panoramas/placeholder.jpg',
    initialYaw: 0,
    initialPitch: 0,
  },
];

export function panoramasForPlan(buildingId: string, planId: string): PanoramaPoint[] {
  return panoramaPoints.filter((point) => point.buildingId === buildingId && point.planId === planId);
}

export function panoramaImageUrl(point: PanoramaPoint): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}${point.image.replace(/^\/+/, '')}`;
}

export function validatePanoramaPoints(points: readonly PanoramaPoint[] = panoramaPoints): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const plans = new Map(buildings.flatMap((building) => building.plans.map((plan) => [plan.id, { building, plan }])));

  for (const point of points) {
    if (!point.id || ids.has(point.id)) errors.push(`duplicate or empty panorama id: ${point.id || '(empty)'}`);
    ids.add(point.id);

    const target = plans.get(point.planId);
    if (!target || target.building.id !== point.buildingId) {
      errors.push(`${point.id}: unknown building/plan ${point.buildingId}/${point.planId}`);
      continue;
    }

    const [x, y] = point.at;
    const [vx, vy, vw, vh] = target.plan.viewBox;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < vx || x > vx + vw || y < vy || y > vy + vh) {
      errors.push(`${point.id}: coordinates outside ${point.planId} viewBox`);
    }
    if (!point.label.kk || !point.label.ru) errors.push(`${point.id}: missing localized label`);
    if (!point.image || /^https?:\/\//i.test(point.image)) errors.push(`${point.id}: image must be a relative local path`);
    if (!Number.isFinite(point.initialYaw) || point.initialYaw < -180 || point.initialYaw > 180) {
      errors.push(`${point.id}: initialYaw outside [-180, 180]`);
    }
    if (!Number.isFinite(point.initialPitch) || point.initialPitch < -90 || point.initialPitch > 90) {
      errors.push(`${point.id}: initialPitch outside [-90, 90]`);
    }
  }

  return errors;
}
