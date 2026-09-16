import { Component, type ErrorInfo, type ReactNode } from 'react';

interface PanoramaErrorBoundaryProps {
  /** Rendered instead of the viewer once it throws, including a failed module load. */
  fallback: ReactNode;
  children: ReactNode;
}

interface PanoramaErrorBoundaryState {
  failed: boolean;
}

/**
 * Contains failures from the lazily loaded viewer so a rejected chunk request
 * or a render error cannot unmount the map. Remount with a `key` to retry.
 */
export default class PanoramaErrorBoundary extends Component<
  PanoramaErrorBoundaryProps,
  PanoramaErrorBoundaryState
> {
  state: PanoramaErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): PanoramaErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Panorama viewer failed to load', error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
