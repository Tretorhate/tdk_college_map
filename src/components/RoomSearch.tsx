import { useId, useRef } from 'react';
import type { RoomMatch } from '../data/types.ts';
import type { Locale } from '../i18n.ts';
import { buildingName, t } from '../i18n.ts';

interface RoomSearchProps {
  query: string;
  matches: RoomMatch[];
  open: boolean;
  locale: Locale;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onQuery: (q: string) => void;
  onOpen: (open: boolean) => void;
  onPick: (m: RoomMatch) => void;
  onEscape: () => void;
}

export default function RoomSearch({
  query,
  matches,
  open,
  locale,
  inputRef,
  onQuery,
  onOpen,
  onPick,
  onEscape,
}: RoomSearchProps): React.JSX.Element {
  const listId = useId();
  const listRef = useRef<HTMLUListElement | null>(null);

  return (
    <div className="room-search">
      <label className="visually-hidden" htmlFor="room-search-input">
        {t(locale, 'searchLabel')}
      </label>
      <input
        id="room-search-input"
        ref={inputRef}
        type="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={t(locale, 'searchPlaceholder')}
        value={query}
        onChange={(e) => {
          onQuery(e.target.value);
          onOpen(true);
        }}
        onFocus={() => {
          if (query.trim() !== '') onOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onEscape();
          } else if (e.key === 'ArrowDown' && open && matches.length > 0) {
            e.preventDefault();
            listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
          }
        }}
      />
      {query !== '' ? (
        <button
          type="button"
          className="search-clear"
          aria-label={t(locale, 'clearSearch')}
          onClick={() => onQuery('')}
        >
          ×
        </button>
      ) : null}
      {open && query.trim() !== '' ? (
        <div className="search-popover">
          {matches.length === 0 ? (
            <p className="search-empty" role="status">
              {t(locale, 'noResults')}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t(locale, 'searchLabel')} ref={listRef}>
              {matches.map((m) => {
                const title =
                  m.room.code !== ''
                    ? m.room.code
                    : (m.room.name[locale] !== '' ? m.room.name[locale] : t(locale, 'unnamedRoom'));
                return (
                  <li key={`${m.building.id}:${m.plan.id}:${m.room.id}`} role="option" aria-selected="false">
                    <button
                      type="button"
                      onClick={() => onPick(m)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          onEscape();
                        }
                      }}
                    >
                      <span className="result-title">{title}</span>
                      <span className="result-meta">
                        {buildingName(locale, m.building.id)} ·{' '}
                        {m.plan.floor !== null
                          ? locale === 'kk'
                            ? `${m.plan.floor}-қабат`
                            : `${m.plan.floor} этаж`
                          : t(locale, 'workshopPlan')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
