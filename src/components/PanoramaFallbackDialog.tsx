import { useEffect, useId, useRef } from 'react';
import { t, type Locale } from '../i18n.ts';

interface PanoramaFallbackDialogProps {
  title: string;
  message: string;
  locale: Locale;
  tone: 'loading' | 'error';
  onClose: () => void;
}

/**
 * Modal shown while the viewer module is still loading, and if that module
 * fails to load. Keeps Escape, focus, and a visible return control available
 * even when the viewer itself never mounts.
 */
export default function PanoramaFallbackDialog({
  title,
  message,
  locale,
  tone,
  onClose,
}: PanoramaFallbackDialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="panorama-dialog panorama-fallback"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="panorama-toolbar">
        <h2 id={titleId} className="panorama-title">
          {title}
        </h2>
        <button type="button" className="panorama-close" onClick={onClose} autoFocus>
          {t(locale, 'panoramaBack')}
        </button>
      </div>
      <p
        className={tone === 'error' ? 'panorama-status panorama-status-error' : 'panorama-status'}
        role={tone === 'error' ? 'alert' : 'status'}
      >
        {message}
      </p>
    </dialog>
  );
}
