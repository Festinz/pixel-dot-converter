// ============================================================
// 메인 앱 컴포넌트
// 전체 상태 관리 및 레이아웃 조율
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { CanvasView } from './components/CanvasView';
import type { CanvasViewHandle } from './components/CanvasView';
import { PaletteDisplay } from './components/PaletteDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { exportToPNG, exportToSVG, generateFilename } from './utils/export';
import { renderDotArtToSVG } from './utils/dotArt';
import type {
  ConversionMode,
  PixelArtSettings,
  DotArtSettings,
  UploadedImage,
  HistoryItem,
} from './types';

// ─── 기본 설정값 ───────────────────────────────────────────
const DEFAULT_PIXEL_SETTINGS: PixelArtSettings = {
  pixelSize: 16,
  paletteSize: 'none',
  customPaletteColors: [],
  showGrid: false,
  gridColor: '#000000',
  dithering: 'none',
  brightness: 0,
  contrast: 0,
};

const DEFAULT_DOT_SETTINGS: DotArtSettings = {
  dotSize: 8,
  gap: 2,
  backgroundColor: '#ffffff',
  dotShape: 'circle',
  brightnessSizeVariation: false,
  dithering: 'none',
  brightness: 0,
  contrast: 0,
};

const MAX_HISTORY = 5;

function App() {
  // ─── 전역 상태 ──────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [mode, setMode] = useState<ConversionMode>('pixel');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [pixelSettings, setPixelSettings] = useState<PixelArtSettings>(DEFAULT_PIXEL_SETTINGS);
  const [dotSettings, setDotSettings] = useState<DotArtSettings>(DEFAULT_DOT_SETTINGS);
  const [exportScale, setExportScale] = useState<1 | 2 | 4>(1);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 캔버스 뷰 핸들러 참조
  const canvasViewRef = useRef<CanvasViewHandle>(null);

  // 출력 캔버스 참조 (imageProcessor에서 사용)
  const outputCanvasRefForProcessor = useRef<HTMLCanvasElement | null>(null);

  // 디바운스 적용 (설정 변경 후 300ms 대기)
  const debouncedPixelSettings = useDebouncedValue(pixelSettings, 300);
  const debouncedDotSettings = useDebouncedValue(dotSettings, 300);
  const debouncedMode = useDebouncedValue(mode, 100);

  // 이미지 처리 훅
  const { isProcessing, progress, extractedPalette, processImage } = useImageProcessor({
    mode: debouncedMode,
    pixelSettings: debouncedPixelSettings,
    dotSettings: debouncedDotSettings,
    uploadedImage,
    outputCanvasRef: outputCanvasRefForProcessor,
  });

  // 다크 모드 적용
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // CanvasView의 outputCanvas를 outputCanvasRefForProcessor에 동기화
  useEffect(() => {
    const canvas = canvasViewRef.current?.getOutputCanvas();
    if (canvas) {
      outputCanvasRefForProcessor.current = canvas;
    }
  });

  // 설정/이미지 변경 시 자동 처리
  useEffect(() => {
    if (!uploadedImage) return;
    // 렌더링 후 canvas 참조가 최신인지 확인
    requestAnimationFrame(() => {
      const canvas = canvasViewRef.current?.getOutputCanvas();
      if (canvas) {
        outputCanvasRefForProcessor.current = canvas;
        processImage();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImage, debouncedPixelSettings, debouncedDotSettings, debouncedMode]);

  /** 이미지 업로드 처리 */
  const handleImageLoad = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
  }, []);

  /** 변환 이력에 현재 결과 저장 */
  const saveToHistory = useCallback(() => {
    const outputCanvas = canvasViewRef.current?.getOutputCanvas();
    if (!outputCanvas || !uploadedImage) return;
    if (outputCanvas.width === 0) return;

    // 썸네일 생성 (64x64)
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 64;
    thumbCanvas.height = 64;
    const thumbCtx = thumbCanvas.getContext('2d')!;
    thumbCtx.imageSmoothingEnabled = false;
    thumbCtx.drawImage(outputCanvas, 0, 0, 64, 64);
    const thumbnailUrl = thumbCanvas.toDataURL('image/png');

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      originalName: uploadedImage.name,
      mode,
      thumbnailUrl,
      settings: mode === 'pixel' ? { ...pixelSettings } : { ...dotSettings },
    };

    setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY));
  }, [uploadedImage, mode, pixelSettings, dotSettings]);

  // 처리 완료 시 이력 저장
  const prevProgressRef = useRef(0);
  useEffect(() => {
    if (!isProcessing && progress === 100 && prevProgressRef.current < 100 && uploadedImage) {
      saveToHistory();
    }
    prevProgressRef.current = progress;
  }, [isProcessing, progress, uploadedImage, saveToHistory]);

  /** PNG 내보내기 */
  const handleExportPNG = useCallback(() => {
    const outputCanvas = canvasViewRef.current?.getOutputCanvas();
    if (!outputCanvas || !uploadedImage) return;

    const sizeParam = mode === 'pixel' ? pixelSettings.pixelSize : dotSettings.dotSize;
    const filename = generateFilename(uploadedImage.name, mode, sizeParam);
    exportToPNG(outputCanvas, filename, exportScale);
  }, [uploadedImage, mode, pixelSettings, dotSettings, exportScale]);

  /** SVG 내보내기 (도트 아트 모드만) */
  const handleExportSVG = useCallback(() => {
    const sourceCanvas = canvasViewRef.current?.getSourceCanvas();
    if (!sourceCanvas || !uploadedImage || mode !== 'dot') return;

    const svgString = renderDotArtToSVG(sourceCanvas, dotSettings, [], exportScale);
    const filename = generateFilename(uploadedImage.name, mode, dotSettings.dotSize);
    exportToSVG(svgString, filename);
  }, [uploadedImage, mode, dotSettings, exportScale]);

  /** 이력에서 선택 */
  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setMode(item.mode);
    if (item.mode === 'pixel') {
      setPixelSettings(item.settings as PixelArtSettings);
    } else {
      setDotSettings(item.settings as DotArtSettings);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* 헤더 */}
      <Header
        mode={mode}
        onModeChange={setMode}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        hasImage={!!uploadedImage}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
      />

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ─── 사이드바 (설정 패널) ─── */}
        <aside
          className={`
            hidden sm:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
            transition-[width] duration-300 shrink-0 overflow-hidden
            ${sidebarOpen ? 'w-72' : 'w-0'}
          `}
          aria-label="설정 패널"
          aria-hidden={!sidebarOpen}
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin w-72">
            {/* 업로드 섹션 */}
            {!uploadedImage ? (
              <div className="p-4">
                <ImageUploader onImageLoad={handleImageLoad} />
              </div>
            ) : (
              <div className="p-3">
                {/* 업로드된 이미지 정보 및 변경 버튼 */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={uploadedImage.url}
                    alt={uploadedImage.name}
                    className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {uploadedImage.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {uploadedImage.width}×{uploadedImage.height}
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
                    aria-label="이미지 변경"
                    title="이미지 변경"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                {/* 설정 패널 */}
                <SettingsPanel
                  mode={mode}
                  pixelSettings={pixelSettings}
                  dotSettings={dotSettings}
                  onPixelSettingsChange={setPixelSettings}
                  onDotSettingsChange={setDotSettings}
                  exportScale={exportScale}
                  onExportScaleChange={setExportScale}
                />
              </div>
            )}
          </div>

          {/* 팔레트 표시 */}
          {extractedPalette.length > 0 && (
            <PaletteDisplay palette={extractedPalette} />
          )}

          {/* 변환 이력 */}
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onClear={() => setHistory([])}
          />
        </aside>

        {/* ─── 사이드바 토글 버튼 (데스크톱) ─── */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`
            hidden sm:flex absolute top-1/2 -translate-y-1/2 z-20
            w-5 h-14 items-center justify-center
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            rounded-r-lg shadow-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
            transition-[left] duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500
          `}
          style={{ left: sidebarOpen ? '288px' : '0px' }}
          aria-label={sidebarOpen ? '설정 패널 닫기' : '설정 패널 열기'}
          aria-expanded={sidebarOpen}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ─── 메인 캔버스 영역 ─── */}
        <main className="flex-1 overflow-hidden" role="main" aria-label="캔버스 뷰">
          <CanvasView
            ref={canvasViewRef}
            uploadedImage={uploadedImage}
            isProcessing={isProcessing}
            progress={progress}
          />
        </main>
      </div>

      {/* ─── 모바일 하단 시트 (sm 미만) ─── */}
      {uploadedImage && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <MobileBottomSheet
            mode={mode}
            pixelSettings={pixelSettings}
            dotSettings={dotSettings}
            onPixelSettingsChange={setPixelSettings}
            onDotSettingsChange={setDotSettings}
            exportScale={exportScale}
            onExportScaleChange={setExportScale}
          />
        </div>
      )}

      {/* ─── 모바일: 이미지 미업로드 시 업로더 표시 ─── */}
      {!uploadedImage && (
        <div className="sm:hidden flex-1 p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-full max-w-md">
            <ImageUploader onImageLoad={handleImageLoad} />
          </div>
        </div>
      )}
    </div>
  );
}

/** 모바일용 하단 접이식 설정 시트 */
const MobileBottomSheet: React.FC<{
  mode: ConversionMode;
  pixelSettings: PixelArtSettings;
  dotSettings: DotArtSettings;
  onPixelSettingsChange: (s: PixelArtSettings) => void;
  onDotSettingsChange: (s: DotArtSettings) => void;
  exportScale: 1 | 2 | 4;
  onExportScaleChange: (s: 1 | 2 | 4) => void;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        aria-expanded={isOpen}
        aria-controls="mobile-settings"
      >
        <span>설정 패널</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id="mobile-settings" className="max-h-64 overflow-y-auto border-t border-gray-100 dark:border-gray-800">
          <SettingsPanel {...props} />
        </div>
      )}
    </div>
  );
};

export default App;
