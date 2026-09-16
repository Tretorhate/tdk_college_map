// The package is a side-effect script with no module exports.
declare module 'pannellum' {}

// Only the equirectangular, preloaded-image API used by PanoramaViewer is declared.
interface PannellumConfig {
  type: 'equirectangular';
  panorama: HTMLImageElement;
  dynamic: boolean;
  autoLoad: boolean;
  yaw: number;
  pitch: number;
  hfov: number;
  minHfov: number;
  maxHfov: number;
  compass: boolean;
  showControls: boolean;
  disableKeyboardCtrl: boolean;
  orientationOnByDefault: boolean;
}

interface PannellumViewer {
  destroy(): void;
  getYaw(): number;
  getPitch(): number;
  getHfov(): number;
  setYaw(yaw: number, animated?: boolean | number): PannellumViewer;
  setPitch(pitch: number, animated?: boolean | number): PannellumViewer;
  setHfov(hfov: number, animated?: boolean | number): PannellumViewer;
  stopMovement(): void;
  isLoaded(): boolean | undefined;
  getConfig(): PannellumConfig;
  setUpdate(enabled: boolean): PannellumViewer;
}

interface Window {
  pannellum: {
    viewer(container: HTMLElement, config: PannellumConfig): PannellumViewer;
  };
}
