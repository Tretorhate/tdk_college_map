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
        <div className="drawer-footer">
          <p className="footer-icons">
            <a
              className="icon-link"
              href="https://github.com/Tretorhate/tdk_college_map"
              target="_blank"
              rel="noreferrer"
              aria-label={t(locale, 'projectCredit')}
              title={t(locale, 'projectCredit')}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            </a>
            <a
              className="icon-link"
              href="./third-party-licenses.txt"
              target="_blank"
              rel="noreferrer"
              aria-label={t(locale, 'licenseLink')}
              title={t(locale, 'licenseLink')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </a>
          </p>
          <p className="attribution-note">
            Based on and inspired by{' '}
            <a href="https://github.com/Yuujiso/aitumap" target="_blank" rel="noreferrer">
              aitumap
            </a>{' '}
            by Yuujiso · {t(locale, 'attributionNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
