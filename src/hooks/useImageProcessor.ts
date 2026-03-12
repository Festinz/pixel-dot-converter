// ============================================================
// 이미지 처리 훅
// Web Worker를 통해 이미지 변환을 비동기로 처리합니다.
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react';
import type {
  ConversionMode,
  PixelArtSettings,
  DotArtSettings,
  RGBColor,
  UploadedImage,
} from '../types';
import { renderPixelArt } from '../utils/pixelArt';
import { renderDotArt } from '../utils/dotArt';

interface UseImageProcessorOptions {
  mode: ConversionMode;
  pixelSettings: PixelArtSettings;
  dotSettings: DotArtSettings;
  uploadedImage: UploadedImage | null;
  outputCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

interface UseImageProcessorReturn {
  isProcessing: boolean;
  progress: number;
  extractedPalette: RGBColor[];
  processImage: () => void;
}

export function useImageProcessor({
  mode,
  pixelSettings,
  dotSettings,
  uploadedImage,
  outputCanvasRef,
}: UseImageProcessorOptions): UseImageProcessorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedPalette, setExtractedPalette] = useState<RGBColor[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // 소스 캔버스에 원본 이미지 로드
  const loadSourceImage = useCallback((): Promise<HTMLCanvasElement | null> => {
    if (!uploadedImage) return Promise.resolve(null);

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        sourceCanvasRef.current = canvas;
        resolve(canvas);
      };
      img.onerror = () => resolve(null);
      img.src = uploadedImage.url;
    });
  }, [uploadedImage]);

  /** 이미지 처리 실행 */
  const processImage = useCallback(async () => {
    if (!uploadedImage || !outputCanvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    const sourceCanvas = await loadSourceImage();
    if (!sourceCanvas) {
      setIsProcessing(false);
      return;
    }

    const srcCtx = sourceCanvas.getContext('2d');
    if (!srcCtx) {
      setIsProcessing(false);
      return;
    }

    // 픽셀 아트 모드: 샘플링 후 Worker에서 팔레트 추출/디더링
    if (mode === 'pixel') {
      const { pixelSize } = pixelSettings;
      const MAX_DIM = 8192; // 메모리 안전 상한선

      const rawW = Math.ceil(sourceCanvas.width / pixelSize);
      const rawH = Math.ceil(sourceCanvas.height / pixelSize);
      const scale = Math.min(1, MAX_DIM / Math.max(rawW, rawH));
      const targetWidth = Math.max(1, Math.round(rawW * scale));
      const targetHeight = Math.max(1, Math.round(rawH * scale));

      // 샘플 캔버스 (픽셀 크기 < 1이면 업스케일이므로 부드러운 보간 사용)
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = targetWidth;
      smallCanvas.height = targetHeight;
      const smallCtx = smallCanvas.getContext('2d')!;
      smallCtx.imageSmoothingEnabled = pixelSize < 1;
      smallCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
      const imageData = smallCtx.getImageData(0, 0, targetWidth, targetHeight);

      // Worker로 처리
      processWithWorker(imageData, sourceCanvas, outputCanvasRef.current);
    } else {
      // 도트 아트 모드: Worker 없이 직접 렌더링 (도트는 셀 기반이라 빠름)
      setProgress(50);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        renderDotArt(sourceCanvas, outputCanvasRef.current!, dotSettings, []);
        setProgress(100);
        setIsProcessing(false);
      });
    }
  }, [uploadedImage, mode, pixelSettings, dotSettings, outputCanvasRef, loadSourceImage]);

  /** Worker를 통한 비동기 처리 */
  const processWithWorker = useCallback(
    (imageData: ImageData, sourceCanvas: HTMLCanvasElement, outputCanvas: HTMLCanvasElement) => {
      // 기존 Worker 종료
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker(
        new URL('../workers/imageProcessor.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerRef.current = worker;

      worker.onmessage = (event) => {
        const response = event.data;

        if (response.type === 'progress') {
          setProgress(response.progress);
        } else if (response.type === 'result') {
          setExtractedPalette(response.palette ?? []);
          setProgress(95);

          // requestAnimationFrame으로 렌더링
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => {
            renderPixelArt(sourceCanvas, outputCanvas, pixelSettings, response.palette ?? [], response.imageData);
            setProgress(100);
            setIsProcessing(false);
          });

          worker.terminate();
          workerRef.current = null;
        } else if (response.type === 'error') {
          console.error('Worker 오류:', response.error);
          // 오류 발생 시 기본 렌더링으로 폴백
          renderPixelArt(sourceCanvas, outputCanvas, pixelSettings, []);
          setIsProcessing(false);
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.onerror = (e) => {
        console.error('Worker 오류:', e);
        renderPixelArt(sourceCanvas, outputCanvas, pixelSettings, []);
        setIsProcessing(false);
      };

      // ImageData의 버퍼를 transferable로 전송
      const transferData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height,
      );

      worker.postMessage(
        {
          type: 'process',
          imageData: transferData,
          mode,
          pixelSettings,
          dotSettings,
        },
        [transferData.data.buffer],
      );
    },
    [mode, pixelSettings, dotSettings],
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    isProcessing,
    progress,
    extractedPalette,
    processImage,
  };
}
