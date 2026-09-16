import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { buildings } from './data/buildings.ts';
import { panoramaPoints } from './data/panoramas.ts';
import type { RoomMatch } from './data/types.ts';
import { buildRoomIndex, searchRooms } from './lib/search.ts';
import type { Locale } from './i18n.ts';
import { LOCALE_STORAGE_KEY, documentTitle, t } from './i18n.ts';
import MapCanvas from './components/MapCanvas.tsx';
import MapControls from './components/MapControls.tsx';
import RoomSearch from './components/RoomSearch.tsx';
import RoomDetails from './components/RoomDetails.tsx';
import SettingsDrawer from './components/SettingsDrawer.tsx';
import PanoramaErrorBoundary from './components/PanoramaErrorBoundary.tsx';
import PanoramaFallbackDialog from './components/PanoramaFallbackDialog.tsx';

const PanoramaViewer = lazy(() => import('./components/PanoramaViewer.tsx'));

const roomIndex = buildRoomIndex(buildings);

function readLocale(): Locale {
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return v === 'ru' ? 'ru' : 'kk';
  } catch {
    return 'kk';
  }
}

export default function App(): React.JSX.Element {
  const [buildingId, setBuildingId] = useState('main');
  const [planId, setPlanId] = useState('main-floor-1');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(() => readLocale());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [centerNonce, setCenterNonce] = useState(0);
  const [activePanoramaId, setActivePanoramaId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectionOriginRef = useRef<HTMLElement | SVGElement | null>(null);
  const panoramaOriginRef = useRef<HTMLElement | SVGElement | null>(null);

  const building = buildings.find((b) => b.id === buildingId) ?? buildings[0];
  const plan = building.plans.find((p) => p.id === planId) ?? building.plans[0];

  const matches = useMemo(() => searchRooms(roomIndex, query), [query]);
  const highlightIds = useMemo(() => new Set(matches.map((m) => m.room.id)), [matches]);

  const activePanorama = useMemo(
    () => panoramaPoints.find((p) => p.id === activePanoramaId) ?? null,
    [activePanoramaId],
  );

  useEffect(() => {
    if (
      activePanorama !== null &&
      (activePanorama.buildingId !== building.id || activePanorama.planId !== plan.id)
    ) {
      setActivePanoramaId(null);
      panoramaOriginRef.current = null;
    }
  }, [activePanorama, building.id, plan.id]);

  const selectedMatch: RoomMatch | null = useMemo(() => {
    if (selectedRoomId === null) return null;
    for (const b of buildings) {
      for (const p of b.plans) {
        const room = p.rooms.find((r) => r.id === selectedRoomId);
        if (room) return { building: b, plan: p, room };
      }
    }
    return null;
  }, [selectedRoomId]);

  useEffect(() => {
    document.documentElement.lang = locale === 'kk' ? 'kk' : 'ru';
    document.title = documentTitle(locale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage unavailable: keep locale in memory only.
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleBuilding(id: string): void {
    const next = buildings.find((b) => b.id === id);
    if (!next) return;
    setBuildingId(id);
    const first = next.plans[0];
    setPlanId(first.id);
    setSelectedRoomId(null);
    setQuery('');
    setSearchOpen(false);
    setActivePanoramaId(null);
    panoramaOriginRef.current = null;
  }

  function handlePlan(id: string): void {
    setPlanId(id);
    setSelectedRoomId(null);
    setQuery('');
    setSearchOpen(false);
    setActivePanoramaId(null);
    panoramaOriginRef.current = null;
  }

  function handlePick(m: RoomMatch): void {
    selectionOriginRef.current = searchInputRef.current;
    setBuildingId(m.building.id);
    setPlanId(m.plan.id);
    setSelectedRoomId(m.room.id);
    setCenterNonce((n) => n + 1);
    setSearchOpen(false);
    searchInputRef.current?.focus();
    setActivePanoramaId(null);
    panoramaOriginRef.current = null;
  }

  function handleOpenPanorama(pointId: string): void {
    const point = panoramaPoints.find((p) => p.id === pointId);
    if (!point || point.buildingId !== building.id || point.planId !== plan.id) return;
    const active = document.activeElement;
    panoramaOriginRef.current =
      active instanceof HTMLElement || active instanceof SVGElement ? active : null;
    setActivePanoramaId(point.id);
  }

  function handleClosePanorama(): void {
    setActivePanoramaId(null);
    requestAnimationFrame(() => {
      const origin = panoramaOriginRef.current;
      if (origin?.isConnected) {
        origin.focus();
      } else {
        document.querySelector<HTMLElement>('.panorama-person')?.focus();
      }
    });
  }

  function handleSearchEscape(): void {
    setSearchOpen(false);
    searchInputRef.current?.focus();
  }

  function handleDetailsClose(): void {
    setSelectedRoomId(null);
    selectionOriginRef.current?.focus();
  }

  function handleSettingsEscape(): void {
    setSettingsOpen(false);
    settingsButtonRef.current?.focus();
  }

  return (
    <div className="app-shell">
      <header className="top-strip" inert={activePanorama !== null}>
        <div className="title-block">
          <h1>{t(locale, 'title')}</h1>
          <button
            ref={settingsButtonRef}
            type="button"
            className="settings-button"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          >
            {t(locale, 'settings')}
          </button>
        </div>
        <RoomSearch
          query={query}
          matches={matches}
          open={searchOpen}
          locale={locale}
          inputRef={searchInputRef}
          onQuery={(q) => setQuery(q)}
          onOpen={setSearchOpen}
          onPick={handlePick}
          onEscape={handleSearchEscape}
        />
        <MapControls
          buildings={buildings}
          buildingId={buildingId}
          planId={plan.id}
          locale={locale}
          onBuilding={handleBuilding}
          onPlan={handlePlan}
        />
      </header>
      <main className="map-area" inert={activePanorama !== null}>
        <MapCanvas
          locale={locale}
          buildingId={building.id}
          plan={plan}
          selectedRoomId={selectedRoomId}
          highlightIds={highlightIds}
          centerRequest={selectedRoomId !== null && centerNonce > 0 ? { roomId: selectedRoomId, nonce: centerNonce } : null}
          onSelect={(id) => {
            selectionOriginRef.current = id ? document.getElementById(`room-${id}`) : null;
            setSelectedRoomId(id);
            setSearchOpen(false);
          }}
          onOpenPanorama={handleOpenPanorama}
        />
        <RoomDetails
          match={selectedMatch}
          locale={locale}
          onClose={handleDetailsClose}
          onEscape={handleDetailsClose}
        />
      </main>
      <div inert={activePanorama !== null} style={{ display: 'contents' }}>
        <SettingsDrawer
          open={settingsOpen}
          locale={locale}
          theme={theme}
          onLocale={setLocale}
          onTheme={setTheme}
          onClose={() => {
            setSettingsOpen(false);
            settingsButtonRef.current?.focus();
          }}
          onEscape={handleSettingsEscape}
        />
      </div>
      {activePanorama ? (
        <PanoramaErrorBoundary
          key={activePanorama.id}
          fallback={
            <PanoramaFallbackDialog
              title={activePanorama.label[locale]}
              message={t(locale, 'panoramaError')}
              locale={locale}
              tone="error"
              onClose={handleClosePanorama}
            />
          }
        >
          <Suspense
            fallback={
              <PanoramaFallbackDialog
                title={activePanorama.label[locale]}
                message={t(locale, 'panoramaLoading')}
                locale={locale}
                tone="loading"
                onClose={handleClosePanorama}
              />
            }
          >
            <PanoramaViewer point={activePanorama} locale={locale} onClose={handleClosePanorama} />
          </Suspense>
        </PanoramaErrorBoundary>
      ) : null}
    </div>
  );
}
