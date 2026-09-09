import type { Building } from '../data/types.ts';
import type { Locale } from '../i18n.ts';
import { buildingName, floorLabel, t } from '../i18n.ts';

export type MainSection = 'horizontal' | 'l-shaped';

interface MapControlsProps {
  buildings: Building[];
  buildingId: string;
  planId: string;
  mainSection: MainSection;
  locale: Locale;
  onBuilding: (id: string) => void;
  onPlan: (id: string) => void;
  onSection: (s: MainSection) => void;
}

export default function MapControls({
  buildings,
  buildingId,
  planId,
  mainSection,
  locale,
  onBuilding,
  onPlan,
  onSection,
}: MapControlsProps): React.JSX.Element {
  const building = buildings.find((b) => b.id === buildingId) ?? buildings[0];
  const isMain = buildingId === 'main';
  const visiblePlans = isMain
    ? building.plans.filter((p) => p.sectionId === mainSection)
    : building.plans;

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
      {isMain ? (
        <div className="section-row" role="group" aria-label={t(locale, 'sectionLabel')}>
          <button
            type="button"
            className={mainSection === 'horizontal' ? 'is-active' : ''}
            aria-pressed={mainSection === 'horizontal'}
            onClick={() => onSection('horizontal')}
          >
            {t(locale, 'horizontalSection')}
          </button>
          <button
            type="button"
            className={mainSection === 'l-shaped' ? 'is-active' : ''}
            aria-pressed={mainSection === 'l-shaped'}
            onClick={() => onSection('l-shaped')}
          >
            {t(locale, 'lShapedSection')}
          </button>
        </div>
      ) : null}
      <div className="floor-row" role="group" aria-label={t(locale, 'floorsLabel')}>
        {visiblePlans.map((p) =>
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
