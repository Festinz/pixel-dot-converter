// ============================================================
// 애플리케이션 전체에서 사용하는 TypeScript 타입 정의
// ============================================================

/** 변환 모드 */
export type ConversionMode = 'pixel' | 'dot';

/** 도트 모양 */
export type DotShape = 'circle' | 'square' | 'diamond';

/** 디더링 알고리즘 */
export type DitheringType = 'none' | 'floyd-steinberg' | 'ordered' | 'atkinson';

/** 컬러 팔레트 제한 수 */
export type PaletteSize = 'none' | 8 | 16 | 32 | 64 | 'custom';

/** 프리셋 팔레트 이름 */
export type PresetPaletteName = 'gameboy' | 'nes' | 'snes' | 'monochrome';

/** RGB 색상 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/** RGBA 색상 */
export interface RGBAColor extends RGBColor {
  a: number;
}

/** 픽셀 아트 설정 */
export interface PixelArtSettings {
  pixelSize: number;           // 4 ~ 64
  paletteSize: PaletteSize;
  customPaletteColors: string[]; // 사용자 지정 팔레트
  showGrid: boolean;
  gridColor: string;
  dithering: DitheringType;
  brightness: number;          // -100 ~ 100
  contrast: number;            // -100 ~ 100
}

/** 도트 아트 설정 */
export interface DotArtSettings {
  dotSize: number;             // 2 ~ 32
  gap: number;                 // 0 ~ 16
  backgroundColor: string;
  dotShape: DotShape;
  brightnessSizeVariation: boolean;
  dithering: DitheringType;
  brightness: number;          // -100 ~ 100
  contrast: number;            // -100 ~ 100
}

/** 내보내기 설정 */
export interface ExportSettings {
  scale: 1 | 2 | 4;
  format: 'png' | 'svg';
}

/** 업로드된 이미지 정보 */
export interface UploadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
  name: string;
}

/** 변환 이력 항목 */
export interface HistoryItem {
  id: string;
  timestamp: number;
  originalName: string;
  mode: ConversionMode;
  thumbnailUrl: string;
  settings: PixelArtSettings | DotArtSettings;
}

/** 이미지 처리 Worker 요청 */
export interface WorkerRequest {
  type: 'process';
  imageData: ImageData;
  mode: ConversionMode;
  pixelSettings?: PixelArtSettings;
  dotSettings?: DotArtSettings;
  palette?: RGBColor[];
}

/** 이미지 처리 Worker 응답 */
export interface WorkerResponse {
  type: 'result' | 'error' | 'progress';
  imageData?: ImageData;
  palette?: RGBColor[];
  progress?: number;
  error?: string;
}

/** 앱 전역 상태 */
export interface AppState {
  darkMode: boolean;
  mode: ConversionMode;
  uploadedImage: UploadedImage | null;
  pixelSettings: PixelArtSettings;
  dotSettings: DotArtSettings;
  exportSettings: ExportSettings;
  extractedPalette: RGBColor[];
  history: HistoryItem[];
  isProcessing: boolean;
  processingProgress: number;
}
