import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { t, type Locale } from '../i18n.ts';
import { panoramaImageUrl } from '../data/panoramas.ts';
import type { PanoramaPoint } from '../data/types.ts';
// Pannellum is a plain script: importing this lazy component assigns window.pannellum.
import 'pannellum';
import 'pannellum/build/pannellum.css';

type ViewerStatus = 'loading' | 'ready' | 'error';

interface PanoramaViewerProps {
  point: PanoramaPoint;
  locale: Locale;
  onClose: () => void;
}

export default function PanoramaViewer({ point, locale, onClose }: PanoramaViewerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const [status, setStatus] = useState<ViewerStatus>('loading');
  const titleId = useId();
  const instructionsId = useId();
  const imageUrl = panoramaImageUrl(point);
  const { id, initialYaw, initialPitch } = point;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let viewer: PannellumViewer | null = null;
    const image = new Image();
    setStatus('loading');

    function destroyViewer(): void {
      if (viewerRef.current === viewer) viewerRef.current = null;
      viewer?.destroy();
      viewer = null;
    }

    // Pannellum 2.5.7 does not cancel its XHR / FileReader / Image callbacks on
    // destroy. Own image loading so a closed or StrictMode-disposed viewer can
    // never be initialized by a late library callback.
    image.onload = () => {
      if (cancelled) return;
      try {
        viewer = window.pannellum.viewer(container, {
          type: 'equirectangular',
          panorama: image,
          dynamic: true,
          autoLoad: true,
          yaw: initialYaw,
          pitch: initialPitch,
          hfov: 100,
          minHfov: 40,
          maxHfov: 120,
          compass: false,
          showControls: false,
          disableKeyboardCtrl: true,
          orientationOnByDefault: false,
        });
        // The dynamic-input path accepts a decoded Image without starting a
        // loader. Switch to a still texture before synchronous initialization,
        // avoiding both repeated GPU uploads and a continuous animation loop.
        viewer.getConfig().dynamic = false;
        viewer.setUpdate(false);
        if (viewer.isLoaded()) {
          viewerRef.current = viewer;
          setStatus('ready');
        } else {
          destroyViewer();
          setStatus('error');
        }
      } catch {
        destroyViewer();
        setStatus('error');
      }
    };
    image.onerror = () => {
      if (!cancelled) setStatus('error');
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      destroyViewer();
      image.removeAttribute('src');
    };
  }, [id, imageUrl, initialYaw, initialPitch]);

  function zoom(delta: number): void {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.stopMovement();
    viewer.setHfov(viewer.getHfov() + delta, false);
  }

  function lookWithKeyboard(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const viewer = viewerRef.current;
    if (!viewer) return;
    const step = event.shiftKey ? 15 : 5;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        viewer.stopMovement();
        viewer.setYaw(viewer.getYaw() + (event.key === 'ArrowLeft' ? -step : step), false);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        viewer.stopMovement();
        viewer.setPitch(viewer.getPitch() + (event.key === 'ArrowUp' ? step : -step), false);
        break;
      case '+':
      case '=':
        zoom(-10);
        break;
      case '-':
      case '_':
        zoom(10);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <dialog
      ref={dialogRef}
      className="panorama-dialog"
      role="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="panorama-toolbar">
        <h2 id={titleId} className="panorama-title">{point.label[locale]}</h2>
        <button type="button" className="panorama-close" onClick={onClose} autoFocus>
          {t(locale, 'panoramaBack')}
        </button>
        <div className="panorama-controls">
          <button type="button" onClick={() => zoom(-10)} disabled={status !== 'ready'} aria-label={t(locale, 'zoomIn')} title={t(locale, 'zoomIn')}>
            +
          </button>
          <button type="button" onClick={() => zoom(10)} disabled={status !== 'ready'} aria-label={t(locale, 'zoomOut')} title={t(locale, 'zoomOut')}>
            −
          </button>
        </div>
      </div>
      <p id={instructionsId} className="panorama-instructions">{t(locale, 'panoramaInstructions')}</p>
      <div
        ref={containerRef}
        className="panorama-stage"
        role="application"
        aria-label={point.label[locale]}
        aria-describedby={instructionsId}
        aria-busy={status === 'loading'}
        tabIndex={0}
        onKeyDown={lookWithKeyboard}
      />
      {status === 'loading' ? (
        <p className="panorama-status" role="status">
          {t(locale, 'panoramaLoading')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="panorama-status panorama-status-error" role="alert">
          {t(locale, 'panoramaError')}
        </p>
      ) : null}
    </dialog>
  );
}
