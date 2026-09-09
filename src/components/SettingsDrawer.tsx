import { useEffect, useRef } from 'react';
import type { Locale } from '../i18n.ts';
import { documentTitle, t } from '../i18n.ts';

interface SettingsDrawerProps {
  open: boolean;
  locale: Locale;
  theme: 'light' | 'dark';
  onLocale: (l: Locale) => void;
  onTheme: (th: 'light' | 'dark') => void;
  onClose: () => void;
  onEscape: () => void;
}

export default function SettingsDrawer({
  open,
  locale,
  theme,
  onLocale,
  onTheme,
  onClose,
  onEscape,
}: SettingsDrawerProps): React.JSX.Element | null {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open ]);

  if (!open) return null;

  return (
    <div className="settings-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        className="settings-drawer"
        role="dialog"
        aria-label={t(locale, 'settings')}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onEscape();
          }
        }}
      >
        <div className="details-head">
          <h2>{documentTitle(locale)}</h2>
          <button type="button" onClick={onClose} aria-label={t(locale, 'close')}>
            ×
          </button>
        </div>
        <div className="settings-row" role="group" aria-label={t(locale, 'language')}>
          <span>{t(locale, 'language')}</span>
          <button
            type="button"
            className={locale === 'kk' ? 'is-active' : ''}
            aria-pressed={locale === 'kk'}
            onClick={() => onLocale('kk')}
          >
            ҚАЗ
          </button>
          <button
            type="button"
            className={locale === 'ru' ? 'is-active' : ''}
            aria-pressed={locale === 'ru'}
            onClick={() => onLocale('ru')}
          >
            РУС
          </button>
        </div>
        <div className="settings-row" role="group" aria-label={t(locale, 'theme')}>
          <span>{t(locale, 'theme')}</span>
          <button
            type="button"
            className={theme === 'light' ? 'is-active' : ''}
            aria-pressed={theme === 'light'}
            onClick={() => onTheme('light')}
          >
            {t(locale, 'lightTheme')}
          </button>
          <button
            type="button"
            className={theme === 'dark' ? 'is-active' : ''}
            aria-pressed={theme === 'dark'}
            onClick={() => onTheme('dark')}
          >
            {t(locale, 'darkTheme')}
          </button>
        </div>
        <p className="attribution">
          <a href="https://github.com/Yuujiso/aitumap" target="_blank" rel="noreferrer">
            {t(locale, 'attribution')}
          </a>
        </p>
        <p className="attribution-note">{t(locale, 'attributionNote')}</p>
        <p>
          <a href="./third-party-licenses.txt" target="_blank" rel="noreferrer">
            {t(locale, 'licenseLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
