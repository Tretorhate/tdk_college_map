import type { Building } from '../data/types.ts';
import type { Locale } from '../i18n.ts';
import { buildingName, floorLabel, t } from '../i18n.ts';

interface MapControlsProps {
  buildings: Building[];
  buildingId: string;
  planId: string;
  locale: Locale;
  onBuilding: (id: string) => void;
  onPlan: (id: string) => void;
}

export default function MapControls({
  buildings,
  buildingId,
  planId,
  locale,
  onBuilding,
  onPlan,
}: MapControlsProps): React.JSX.Element {
  const building = buildings.find((b) => b.id === buildingId) ?? buildings[0];

  return (
    <div className="map-controls">
      <select
        className="building-row"
        aria-label={t(locale, 'buildingsLabel')}
        value={buildingId}
        onChange={(event) => onBuilding(event.target.value)}
      >
        {buildings.map((b) => (
          <option key={b.id} value={b.id}>{buildingName(locale, b.id)}</option>
        ))}
      </select>
      <div className="floor-row" role="group" aria-label={t(locale, 'floorsLabel')}>
        {building.plans.map((p) =>
          p.floor === null ? (
            <span key={p.id} className="workshop-label">
              {t(locale, 'workshopPlan')}
            </span>
          ) : (
            <button
              key={p.id}
              type="button"
              className={p.id === planId ? 'is-active' : ''}
              aria-pressed={p.id === planId}
              aria-label={floorLabel(locale, p.floor)}
              title={floorLabel(locale, p.floor)}
              onClick={() => onPlan(p.id)}
            >
              {p.floor}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
