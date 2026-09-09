import { useEffect, useRef } from 'react';
import type { RoomMatch } from '../data/types.ts';
import type { Locale } from '../i18n.ts';
import { buildingName, t } from '../i18n.ts';

interface RoomDetailsProps {
  match: RoomMatch | null;
  locale: Locale;
  onClose: () => void;
  onEscape: () => void;
}

export default function RoomDetails({ match, locale, onClose, onEscape }: RoomDetailsProps): React.JSX.Element | null {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [match?.room.id]);

  if (match === null) return null;

  const title =
    match.room.name[locale] !== ''
      ? match.room.name[locale]
      : match.room.code !== ''
        ? match.room.code
        : t(locale, 'unnamedRoom');

  return (
    <div
      ref={panelRef}
      className="room-details"
      role="dialog"
      aria-label={t(locale, 'detailsTitle')}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onEscape();
        }
      }}
    >
      <div className="details-head">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label={t(locale, 'close')}>
          ×
        </button>
      </div>
      <dl>
        {match.room.code !== '' ? (
          <div>
            <dt>{t(locale, 'roomCode')}</dt>
            <dd>{match.room.code}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t(locale, 'buildingsLabel')}</dt>
          <dd>{buildingName(locale, match.building.id)}</dd>
        </div>
        <div>
          <dt>{t(locale, 'floorsLabel')}</dt>
          <dd>
            {match.plan.floor !== null
              ? locale === 'kk'
                ? `${match.plan.floor}-қабат`
                : `${match.plan.floor} этаж`
              : t(locale, 'workshopPlan')}
          </dd>
        </div>
      </dl>
    </div>
  );
}
