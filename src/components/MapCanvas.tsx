import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { t, type Locale } from '../i18n.ts';
import { panoramasForPlan } from '../data/panoramas.ts';
import type { FloorPlan, MapIcon } from '../data/types.ts';

interface CenterRequest {
  roomId: string;
  nonce: number;
}

interface MapCanvasProps {
  buildingId: string;
  plan: FloorPlan;
  locale: Locale;
  selectedRoomId: string | null;
  highlightIds: ReadonlySet<string>;
  centerRequest: CenterRequest | null;
  onSelect: (roomId: string | null) => void;
  onOpenPanorama: (pointId: string) => void;
}
// TEMP reference tags for walkthrough; remove after labeling pass.
// Keyed by room id, rendered as captions only — never enters search or data.
const TEMP_ROOM_TAGS: Record<string, string> = {
  'industrial-workshop-l1': 'W01',
  'industrial-workshop-l2': 'W02',
  'industrial-workshop-l3': 'W03',
  'industrial-workshop-l4': 'W04',
  'industrial-workshop-l5': 'W05',
  'industrial-workshop-l6': 'W06',
  'industrial-workshop-l7': 'W07',
  'industrial-workshop-l8': 'W08',
  'industrial-workshop-l9': 'W09',
  'industrial-workshop-l10': 'W10',
  'industrial-workshop-bridge-upper-left': 'B01',
  'industrial-workshop-bridge-upper-middle': 'B02',
  'industrial-workshop-bridge-upper-right': 'B03',
  'industrial-workshop-bridge-inset': 'B04',
  'industrial-workshop-bridge-small-upper': 'B05',
  'industrial-workshop-bridge-small-lower': 'B06',
  'industrial-workshop-bridge-lower-right': 'B07',
  'industrial-workshop-r1': 'E01',
  'industrial-workshop-r2': 'E02',
  'industrial-workshop-r3': 'E03',
  'industrial-workshop-r4': 'E04',
  'industrial-workshop-r5': 'E05',
  'industrial-workshop-r6': 'E06',
  'industrial-workshop-outer-right-upper': 'E07',
  'industrial-workshop-outer-right-middle': 'E08',
  'industrial-workshop-outer-right-lower': 'E09',
  'it-1-library': 'L01',
  'it-1-bookfund': 'L02',
  'it-1-r157': 'L03',
  'it-1-left-compartment': 'L04',
  'it-1-foyer': 'F01',
  'it-1-canteen': 'F02',
  'it-1-canteen-annex': 'F03',
  'it-1-kitchen-upper': 'F04',
  'it-1-business': 'B01',
  'it-1-r163': 'R01',
  'it-1-r162': 'R02',
  'it-1-r161': 'R03',
  'it-1-upper-a': 'U01',
  'it-1-upper-b': 'U02',
  'it-1-upper-c': 'U03',
  'it-1-upper-d': 'U04',
  'it-1-central-west-upper': 'C01',
  'it-1-central-east-upper': 'C02',
  'it-1-central-west-lower': 'C03',
  'it-1-central-east-lower': 'C04',
  'it-1-central-narrow-west': 'C05',
  'it-1-central-narrow-east': 'C06',
  'it-1-central-inner': 'C07',
  'it-1-central-corner': 'C08',
  'it-1-central-lower': 'C09',
  'it-2-act-hall': 'H01',
  'it-2-sport-hall': 'H02',
};
const ICON_ONLY_ROOM_IDS: Record<string, true> = {
  'it-1-central-west-upper': true,
  'it-1-central-east-upper': true,
};

function fitTemporaryLabel(label: SVGTextElement | null): void {
  if (!label) return;
  const room = label.previousElementSibling as SVGPathElement;
  const bounds = label.getBBox();
  const x = label.x.baseVal.getItem(0).value;
  const y = label.y.baseVal.getItem(0).value;
  const fontSize = Number.parseFloat(label.style.fontSize);
  const point = new DOMPoint();
  const fits = (scale: number): boolean => {
    // Check the padded text box against the actual room, including inset edges.
    for (let row = 0; row <= 4; row++) {
      for (let col = 0; col <= 8; col++) {
        point.x = x + (bounds.x - x + bounds.width * col / 8) * scale * 1.2;
        point.y = y + (bounds.y - y + bounds.height * row / 4) * scale * 1.2;
        if (!room.isPointInFill(point)) return false;
      }
    }
    return true;
  };
  if (fits(1)) return;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 10; step++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  label.style.fontSize = `${fontSize * low}px`;
}
function FacilityIcon({ icon, locale }: { icon: MapIcon; locale: Locale }): React.JSX.Element {
  const size = icon.size ?? 28;
  const half = size / 2;
  const stroke = Math.max(1.2, size * 0.07);
  return (
    <g
      className={`map-icon map-icon-${icon.kind}`}
      transform={`translate(${icon.at[0]} ${icon.at[1]})`}
      role="img"
      aria-label={icon.label[locale]}
      pointerEvents="none"
    >
      <rect className="map-icon-badge" x={-half} y={-half} width={size} height={size} rx={size * 0.12} />
      {icon.kind === 'stairs' ? (
        <path
          className="map-icon-symbol"
          d={`M${-size * 0.25},${size * 0.25} H${size * 0.25} V${size * 0.08} H${size * 0.08} V${-size * 0.08} H${-size * 0.08} V${-size * 0.25} H${-size * 0.25}`}
          strokeWidth={stroke}
        />
      ) : null}
      {icon.kind === 'toilet' ? (
        <g className="map-icon-symbol" strokeWidth={stroke}>
          <circle cx={-size * 0.14} cy={-size * 0.2} r={size * 0.055} />
          <path d={`M${-size * 0.14},${-size * 0.12} V${size * 0.2} M${-size * 0.25},${size * 0.02} H${-size * 0.03} M${-size * 0.14},${size * 0.2} l${-size * 0.1},${size * 0.14} M${-size * 0.14},${size * 0.2} l${size * 0.1},${size * 0.14}`} />
          <circle cx={size * 0.14} cy={-size * 0.2} r={size * 0.055} />
          <path d={`M${size * 0.14},${-size * 0.12} V${size * 0.08} M${size * 0.02},${size * 0.02} H${size * 0.26} M${size * 0.14},${size * 0.08} l${-size * 0.1},${size * 0.22} M${size * 0.14},${size * 0.08} l${size * 0.1},${size * 0.22}`} />
        </g>
      ) : null}
      {icon.kind === 'exit' ? (
        <g className="map-icon-symbol" strokeWidth={stroke}>
          <circle cx={-size * 0.08} cy={-size * 0.22} r={size * 0.055} />
          <path d={`M${-size * 0.08},${-size * 0.14} l${-size * 0.08},${size * 0.16} l${size * 0.13},${size * 0.09} M${-size * 0.08},${size * 0.02} l${size * 0.02},${size * 0.22} M${-size * 0.08},${size * 0.02} l${-size * 0.16},${size * 0.14} M${size * 0.06},${size * 0.12} H${size * 0.27} M${size * 0.18},${size * 0.03} l${size * 0.09},${size * 0.09} l${-size * 0.09},${size * 0.09}`} />
        </g>
      ) : null}
    </g>
  );
}

interface PanoramaGesture {
  kind: 'person' | 'marker';
  pointerId: number;
  originX: number;
  originY: number;
  moved: boolean;
  target: HTMLButtonElement | SVGGElement;
  pointId: string | null;
}

interface PersonDrag {
  x: number;
  y: number;
  moved: boolean;
  candidateId: string | null;
}

function PanoramaPersonIcon(): React.JSX.Element {
  return (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 9c-3 0-5 1.8-5 4.5V17h3l.7 5h2.6l.7-5h3v-3.5C17 10.8 15 9 12 9Z" />
    </>
  );
}


export default function MapCanvas({
  buildingId,
  plan,
  locale,
  selectedRoomId,
  highlightIds,
  centerRequest,
  onSelect,
  onOpenPanorama,
}: MapCanvasProps): React.JSX.Element {
  const controlsRef = useRef<ReactZoomPanPinchRef | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const personRef = useRef<HTMLButtonElement | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement | null>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const gestureRef = useRef<PanoramaGesture | null>(null);
  const markerTapRef = useRef<string | null>(null);
  const suppressClick = useRef(false);
  const [screenScale, setScreenScale] = useState(1);
  const [panoMode, setPanoMode] = useState(false);
  const [drag, setDrag] = useState<PersonDrag | null>(null);
  const [personHovered, setPersonHovered] = useState(false);
  const [personFocused, setPersonFocused] = useState(false);
  const [notice, setNotice] = useState<'unavailable' | 'miss' | null>(null);
  const panoramaPoints = useMemo(() => panoramasForPlan(buildingId, plan.id), [buildingId, plan.id]);
  const panoramaAvailable = panoramaPoints.length > 0;

  const releaseGesture = useCallback(() => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    gestureRef.current = null;
    if (gesture.target.hasPointerCapture(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId);
    }
    if (gesture.kind === 'person') setDrag(null);
  }, []);

  const cancelGesture = useCallback(() => {
    if (!gestureRef.current) return;
    suppressClick.current = true;
    markerTapRef.current = null;
    releaseGesture();
  }, [releaseGesture]);

  const updateScreenScale = useCallback(() => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return;
    const scale = Math.hypot(ctm.a, ctm.b);
    if (Number.isFinite(scale) && scale > 0) {
      setScreenScale((previous) => previous === scale ? previous : scale);
    }
  }, []);

  useLayoutEffect(() => {
    cancelGesture();
    void controlsRef.current?.resetTransform(0);
    setPanoMode(false);
    setNotice(null);
    markerTapRef.current = null;
    updateScreenScale();
    return cancelGesture;
  }, [buildingId, plan.id, cancelGesture, updateScreenScale]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (!svg || !canvas) return;
    const observer = new ResizeObserver(updateScreenScale);
    observer.observe(svg);
    observer.observe(canvas);
    updateScreenScale();
    return () => observer.disconnect();
  }, [updateScreenScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // The transform library listens natively below React's event delegation.
    // Capture legacy mouse/touch events before they can start a map gesture.
    function blockMapGesture(event: Event): void {
      const personDragging = gestureRef.current?.kind === 'person';
      const onMarker = event.target instanceof Element && event.target.closest('.panorama-marker');
      if (!personDragging && (!onMarker || event.type === 'wheel')) return;
      if (personDragging && event.cancelable) event.preventDefault();
      event.stopPropagation();
    }
    const events = ['mousedown', 'mousemove', 'touchstart', 'touchmove', 'wheel', 'dblclick'];
    for (const event of events) canvas.addEventListener(event, blockMapGesture, { capture: true, passive: false });
    window.addEventListener('blur', cancelGesture);
    return () => {
      for (const event of events) canvas.removeEventListener(event, blockMapGesture, true);
      window.removeEventListener('blur', cancelGesture);
    };
  }, [cancelGesture]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || (!panoMode && !gestureRef.current)) return;
      if (event.target instanceof Element && event.target.closest('dialog, [role="dialog"]')) return;
      event.preventDefault();
      event.stopPropagation();
      cancelGesture();
      setPanoMode(false);
      setNotice(null);
      personRef.current?.focus({ preventScroll: true });
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [panoMode, cancelGesture]);


  useEffect(() => {
    if (centerRequest === null) return;
    const frame = requestAnimationFrame(() => {
      const room = document.getElementById(`room-${centerRequest.roomId}`);
      const controls = controlsRef.current;
      const viewport = svgRef.current?.closest('.map-canvas')?.getBoundingClientRect();
      if (!room || !controls || !viewport) return;
      const bounds = room.getBoundingClientRect();
      const point = controls.clientToContent(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      void controls.setTransform(viewport.width / 2 - point.x * 2.2, viewport.height / 2 - point.y * 2.2, 2.2, 250);
    });
    return () => cancelAnimationFrame(frame);
  }, [centerRequest?.roomId, centerRequest?.nonce]);

  const [vx, vy, vw, vh] = plan.viewBox;
  const markerR = 24 / screenScale;
  const feedbackVisible = notice !== null || personHovered || personFocused || panoMode;
  const feedbackText = t(locale, !panoramaAvailable || notice === 'unavailable' ? 'panoramaUnavailable' : 'panoramaNoDrop');

  function nearestCandidate(clientX: number, clientY: number): string | null {
    const svg = svgRef.current;
    const canvas = canvasRef.current?.getBoundingClientRect();
    const ctm = svg?.getScreenCTM();
    if (!svg || !canvas || !ctm) return null;
    const feedback = feedbackRef.current?.classList.contains('is-visible')
      ? feedbackRef.current.getBoundingClientRect()
      : null;
    function isVisibleMapPosition(x: number, y: number): boolean {
      if (x < canvas!.left || x >= canvas!.right || y < canvas!.top || y >= canvas!.bottom) return false;
      if (feedback && x >= feedback.left && x <= feedback.right && y >= feedback.top && y <= feedback.bottom) return false;
      const topmost = document.elementFromPoint(x, y);
      return topmost !== null && svg!.contains(topmost);
    }
    if (!isVisibleMapPosition(clientX, clientY)) return null;
    let bestId: string | null = null;
    let bestDistance = 24 * 24;
    for (const point of panoramaPoints) {
      const x = ctm.a * point.at[0] + ctm.c * point.at[1] + ctm.e;
      const y = ctm.b * point.at[0] + ctm.d * point.at[1] + ctm.f;
      const distance = (x - clientX) ** 2 + (y - clientY) ** 2;
      if (distance > bestDistance || !isVisibleMapPosition(x, y)) continue;
      if (distance < bestDistance || bestId === null || point.id < bestId) {
        bestId = point.id;
        bestDistance = distance;
      }
    }
    return bestId;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement | SVGGElement>): void {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gesture.moved ||= Math.hypot(event.clientX - gesture.originX, event.clientY - gesture.originY) > 5;
    if (gesture.kind !== 'person' || !gesture.moved) return;
    setPanoMode(true);
    setDrag({
      x: event.clientX,
      y: event.clientY,
      moved: true,
      candidateId: nearestCandidate(event.clientX, event.clientY),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement | SVGGElement>): void {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.stopPropagation();
    gesture.moved ||= Math.hypot(event.clientX - gesture.originX, event.clientY - gesture.originY) > 5;
    const candidate = gesture.moved || gesture.kind === 'marker'
      ? nearestCandidate(event.clientX, event.clientY)
      : null;
    if (gesture.moved) suppressClick.current = true;
    if (gesture.kind === 'marker') {
      markerTapRef.current = !gesture.moved && candidate === gesture.pointId ? gesture.pointId : null;
      if (!markerTapRef.current) suppressClick.current = true;
    }
    releaseGesture();
    if (gesture.kind === 'person' && gesture.moved) {
      setPanoMode(true);
      if (candidate) {
        setNotice(null);
        onOpenPanorama(candidate);
      } else {
        setNotice('miss');
      }
    }
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLButtonElement | SVGGElement>): void {
    if (gestureRef.current?.pointerId === event.pointerId) cancelGesture();
  }


  return (
    <div
      ref={canvasRef}
      className="map-canvas"
      data-plan={plan.id}
      onPointerDownCapture={(event) => {
        if (gestureRef.current) {
          if (gestureRef.current.pointerId !== event.pointerId) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        if (event.isPrimary && event.button === 0) {
          suppressClick.current = false;
          markerTapRef.current = null;
        }
      }}
      onClickCapture={(event) => {
        if ((suppressClick.current && event.detail > 0) || gestureRef.current?.kind === 'person') {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <TransformWrapper
        ref={controlsRef}
        initialScale={1}
        minScale={0.4}
        maxScale={8}
        limitToBounds={false}
        disabled={drag !== null}
        wheel={{ step: 0.15, disabled: drag !== null }}
        pinch={{ step: 5, disabled: drag !== null }}
        doubleClick={{ disabled: drag !== null, step: 0.7 }}
        panning={{ velocityDisabled: true, disabled: drag !== null }}
        onTransform={updateScreenScale}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="zoom-controls" role="toolbar" aria-label={t(locale, 'fitView')}>
              <button type="button" disabled={drag !== null} onClick={() => zoomIn(0.35)} aria-label={t(locale, 'zoomIn')}>
                +
              </button>
              <button type="button" disabled={drag !== null} onClick={() => zoomOut(0.35)} aria-label={t(locale, 'zoomOut')}>
                −
              </button>
              <button type="button" disabled={drag !== null} onClick={() => resetTransform(200)} aria-label={t(locale, 'fitView')}>
                ⤢
              </button>
            </div>
              <button
                ref={personRef}
                type="button"
                className={`panorama-person${panoMode ? ' is-active' : ''}`}
                aria-label={t(locale, 'panoramaControl')}
                aria-describedby="panorama-feedback"
                aria-disabled={!panoramaAvailable}
                aria-pressed={panoMode}
                title={feedbackText}
                onPointerEnter={() => setPersonHovered(true)}
                onPointerLeave={() => setPersonHovered(false)}
                onFocus={() => setPersonFocused(true)}
                onBlur={() => setPersonFocused(false)}
                onPointerDown={(event) => {
                  if (!event.isPrimary || event.button !== 0 || gestureRef.current || !panoramaAvailable) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.focus({ preventScroll: true });
                  event.currentTarget.setPointerCapture(event.pointerId);
                  gestureRef.current = {
                    kind: 'person',
                    pointerId: event.pointerId,
                    originX: event.clientX,
                    originY: event.clientY,
                    moved: false,
                    target: event.currentTarget,
                    pointId: null,
                  };
                  setNotice(null);
                  setDrag({ x: event.clientX, y: event.clientY, moved: false, candidateId: null });
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onLostPointerCapture={handlePointerCancel}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!panoramaAvailable) {
                    setNotice('unavailable');
                    return;
                  }
                  setNotice(null);
                  setPanoMode((mode) => !mode);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <PanoramaPersonIcon />
                </svg>
              </button>
              <p
                ref={feedbackRef}
                id="panorama-feedback"
                className={`panorama-feedback${feedbackVisible ? ' is-visible' : ''}`}
                role="status"
              >
                {feedbackText}
              </p>
              {drag?.moved ? (
                <div className="panorama-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <PanoramaPersonIcon />
                  </svg>
                </div>
              ) : null}
            <TransformComponent wrapperClass="map-transform-wrapper" contentClass="map-transform-content">
              <svg
                ref={svgRef}
                viewBox={`${vx} ${vy} ${vw} ${vh}`}
                className="map-svg"
                role="application"
                aria-label={plan.label[locale]}
              >
                <path d={plan.outline} className="map-outline" style={plan.exteriorWalls ? { stroke: 'none' } : undefined} pointerEvents="none" />
                {plan.unclassifiedAreas.map((d, i) => (
                  <path key={`u${i}`} d={d} className="map-unclassified" pointerEvents="none" />
                ))}
                {plan.rooms.map((room) => {
                  const active = room.id === selectedRoomId || highlightIds.has(room.id);
                  const interactive = room.kind !== 'service';
                  const cls = `map-room${room.kind === 'room' ? '' : ` map-${room.kind}`}`;
                  const caption = ICON_ONLY_ROOM_IDS[room.id] ? '' : room.name[locale] || TEMP_ROOM_TAGS[room.id] || room.code;
                  return (
                    <g key={room.id}>
                      <path
                        id={`room-${room.id}`}
                        d={room.path}
                        className={active ? `${cls} is-active` : cls}
                        pointerEvents={interactive ? undefined : 'none'}
                        tabIndex={interactive ? 0 : undefined}
                        role={interactive ? 'button' : undefined}
                        aria-label={interactive ? room.name[locale] || room.code || t(locale, 'unnamedRoom') : undefined}
                        onPointerDown={
                          interactive
                            ? (event) => {
                                pointerOrigin.current = { x: event.clientX, y: event.clientY };
                              }
                            : undefined
                        }
                        onClick={
                          interactive
                            ? (e) => {
                                e.stopPropagation();
                                const origin = pointerOrigin.current;
                                if (e.detail > 0 && origin && Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 5) return;
                                onSelect(room.id);
                              }
                            : undefined
                        }
                        onKeyDown={
                          interactive
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onSelect(room.id);
                                }
                              }
                            : undefined
                        }
                      />
                      {caption ? (
                        <text
                          key={caption}
                          ref={caption ? fitTemporaryLabel : undefined}
                          x={room.labelAt[0]}
                          y={room.labelAt[1]}
                          className="map-label"
                          style={{ fontSize: vw / 65 }}
                          textAnchor="middle"
                          dominantBaseline="central"
                          pointerEvents="none"
                        >
                          {caption}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                {plan.technicalAreas?.map((d, i) => (
                  <path key={`t${i}`} d={d} className="map-technical-area" pointerEvents="none" />
                ))}
                {plan.walls.map((d, i) => (
                  <path key={`w${i}`} d={d} className="map-wall" pointerEvents="none" />
                ))}
                {plan.exteriorWalls?.map((d, i) => (
                  <path key={`e${i}`} d={d} className="map-wall" pointerEvents="none" />
                ))}
                {plan.dashedLines?.map((d, i) => (
                  <path key={`d${i}`} d={d} className="map-wall" style={{ strokeWidth: 0.65 }} strokeDasharray="1.5 1" pointerEvents="none" />
                ))}
                {plan.stairs.map((d, i) => (
                  <path key={`s${i}`} d={d} className="map-stairs" pointerEvents="none" />
                ))}
                {plan.icons?.map((icon) => (
                  <FacilityIcon key={icon.id} icon={icon} locale={locale} />
                ))}
                {plan.notes?.map((note) => (
                  <text
                    key={note.id}
                    x={note.at[0]}
                    y={note.at[1]}
                    className={note.prominent ? 'map-label' : 'map-note'}
                    style={{ fontSize: note.size ?? (note.prominent ? vw / 65 : undefined) }}
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                  >
                    {note.label[locale]}
                  </text>
                ))}
                {(panoMode || drag?.moved) &&
                  panoramaPoints.map((p) => (
                    <g
                      key={p.id}
                      className={`panorama-marker${drag?.candidateId === p.id ? ' is-candidate' : ''}`}
                      transform={`translate(${p.at[0]} ${p.at[1]})`}
                      role="button"
                      tabIndex={0}
                      aria-label={p.label[locale]}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        if (!event.isPrimary || event.button !== 0 || gestureRef.current) return;
                        event.preventDefault();
                        event.currentTarget.focus({ preventScroll: true });
                        event.currentTarget.setPointerCapture(event.pointerId);
                        gestureRef.current = {
                          kind: 'marker',
                          pointerId: event.pointerId,
                          originX: event.clientX,
                          originY: event.clientY,
                          moved: false,
                          target: event.currentTarget,
                          pointId: p.id,
                        };
                      }}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      onLostPointerCapture={handlePointerCancel}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.detail > 0 && markerTapRef.current !== p.id) return;
                        markerTapRef.current = null;
                        setNotice(null);
                        onOpenPanorama(p.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.repeat || gestureRef.current) return;
                          setNotice(null);
                          onOpenPanorama(p.id);
                        }
                      }}
                    >
                      <circle r={markerR} className="panorama-marker-hit" />
                      <circle r={markerR * 0.55} className="panorama-marker-dot" />
                      <g transform={`scale(${1 / screenScale}) translate(-12 -12)`} className="panorama-marker-icon">
                        <PanoramaPersonIcon />
                      </g>
                    </g>
                  ))}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
