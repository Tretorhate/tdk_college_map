import { useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { t, type Locale } from '../i18n.ts';
import type { FloorPlan, MapIcon } from '../data/types.ts';

interface CenterRequest {
  roomId: string;
  nonce: number;
}

interface MapCanvasProps {
  plan: FloorPlan;
  locale: Locale;
  selectedRoomId: string | null;
  highlightIds: ReadonlySet<string>;
  centerRequest: CenterRequest | null;
  onSelect: (roomId: string | null) => void;
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
  'it-1-service-upper-west': 'S01',
  'it-1-service-upper-middle': 'S02',
  'it-1-service-upper-east': 'S03',
  'it-1-service-upper-end': 'S04',
  'it-1-service-lower-west': 'S05',
  'it-1-service-lower-middle': 'S06',
  'it-1-service-lower-east': 'S07',
  'it-1-service-lower-end': 'S08',
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


export default function MapCanvas({
  plan,
  locale,
  selectedRoomId,
  highlightIds,
  centerRequest,
  onSelect,
}: MapCanvasProps): React.JSX.Element {
  const controlsRef = useRef<ReactZoomPanPinchRef | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    controlsRef.current?.resetTransform(0);
  }, [plan.id]);

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

  return (
    <div className="map-canvas" data-plan={plan.id}>
      <TransformWrapper
        ref={controlsRef}
        initialScale={1}
        minScale={0.4}
        maxScale={8}
        limitToBounds={false}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="zoom-controls" role="toolbar" aria-label={t(locale, 'fitView')}>
              <button type="button" onClick={() => zoomIn(0.35)} aria-label={t(locale, 'zoomIn')}>
                +
              </button>
              <button type="button" onClick={() => zoomOut(0.35)} aria-label={t(locale, 'zoomOut')}>
                −
              </button>
              <button type="button" onClick={() => resetTransform(200)} aria-label={t(locale, 'fitView')}>
                ⤢
              </button>
            </div>
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
                  const cls =
                    room.kind === 'toilet'
                      ? 'map-room map-toilet'
                      : room.kind === 'technical'
                        ? 'map-room map-technical'
                        : 'map-room';
                  const caption = ICON_ONLY_ROOM_IDS[room.id] ? '' : room.name[locale] || TEMP_ROOM_TAGS[room.id] || room.code;
                  return (
                    <g key={room.id}>
                      <path
                        id={`room-${room.id}`}
                        d={room.path}
                        className={active ? `${cls} is-active` : cls}
                        tabIndex={0}
                        role="button"
                        aria-label={room.name[locale] || room.code || t(locale, 'unnamedRoom')}
                        onPointerDown={(event) => {
                          pointerOrigin.current = { x: event.clientX, y: event.clientY };
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const origin = pointerOrigin.current;
                          if (e.detail > 0 && origin && Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 5) return;
                          onSelect(room.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(room.id);
                          }
                        }}
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
                    className="map-note"
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                  >
                    {note.label[locale]}
                  </text>
                ))}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
