// ============================================================
// 픽셀 아트 렌더링 함수
// 이미지를 다운샘플링 후 정사각형 블록으로 렌더링합니다.
// ============================================================

import type { PixelArtSettings, RGBColor } from '../types';
import { findClosestPaletteColor } from './colorQuantization';

/**
 * 밝기/대비 조정이 적용된 값을 계산합니다.
 * @param value 원본 픽셀 값 (0~255)
 * @param brightness 밝기 (-100~100)
 * @param contrast 대비 (-100~100)
 */
function adjustPixel(value: number, brightness: number, contrast: number): number {
  // 밝기 조정: 단순 오프셋
  let v = value + (brightness / 100) * 128;
  // 대비 조정: 중간값(128) 기준 스케일링
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  v = factor * (v - 128) + 128;
  return Math.max(0, Math.min(255, v));
}

/**
 * 픽셀 아트 렌더링
 * @param sourceCanvas 원본 이미지가 그려진 캔버스
 * @param outputCanvas 결과를 그릴 캔버스
 * @param settings 픽셀 아트 설정
 * @param palette 색상 팔레트 (없으면 원본 색상 사용)
 */
/** 샘플링 캔버스의 최대 변 길이 (메모리 안전 상한선) */
const MAX_SAMPLE_DIMENSION = 8192;

export function renderPixelArt(
  sourceCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  settings: PixelArtSettings,
  palette: RGBColor[],
  processedImageData?: ImageData, // Worker에서 처리된 데이터 (선택)
): void {
  const { pixelSize, showGrid, gridColor, brightness, contrast } = settings;
  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;

  // 목표 샘플 해상도 계산
  // pixelSize < 1 이면 업스케일(고화질), >= 1 이면 다운스케일(픽셀화)
  const rawTargetWidth = Math.ceil(srcWidth / pixelSize);
  const rawTargetHeight = Math.ceil(srcHeight / pixelSize);

  // 메모리 안전을 위해 최대 크기 제한
  const scale = Math.min(1, MAX_SAMPLE_DIMENSION / Math.max(rawTargetWidth, rawTargetHeight));
  const targetWidth = Math.max(1, Math.round(rawTargetWidth * scale));
  const targetHeight = Math.max(1, Math.round(rawTargetHeight * scale));
  // 실제 블록 크기 = 출력 캔버스 기준 (스케일 보정 포함)
  const effectivePixelSize = srcWidth / targetWidth;

  // 샘플링 캔버스 생성
  // pixelSize < 1 이면 업스케일이므로 부드러운 보간 사용 (고화질 보존)
  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = targetWidth;
  smallCanvas.height = targetHeight;
  const smallCtx = smallCanvas.getContext('2d')!;
  smallCtx.imageSmoothingEnabled = pixelSize < 1; // 소형 픽셀은 부드럽게, 큰 픽셀은 nearest-neighbor
  smallCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

  // 픽셀 데이터 추출
  let imageData = processedImageData ?? smallCtx.getImageData(0, 0, targetWidth, targetHeight);

  // 출력 캔버스 설정
  outputCanvas.width = srcWidth;
  outputCanvas.height = srcHeight;
  const ctx = outputCanvas.getContext('2d')!;
  ctx.clearRect(0, 0, srcWidth, srcHeight);

  const { data } = imageData;

  // 각 픽셀을 블록으로 렌더링
  for (let py = 0; py < targetHeight; py++) {
    for (let px = 0; px < targetWidth; px++) {
      const offset = (py * targetWidth + px) * 4;
      let r = data[offset];
      let g = data[offset + 1];
      let b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) continue; // 투명 픽셀 스킵

      // 밝기/대비 조정 (디더링이 없을 때만 여기서 처리)
      if (!processedImageData) {
        r = adjustPixel(r, brightness, contrast);
        g = adjustPixel(g, brightness, contrast);
        b = adjustPixel(b, brightness, contrast);
      }

      let finalR = r, finalG = g, finalB = b;

      // 팔레트 색상 매핑
      if (palette.length > 0) {
        const idx = findClosestPaletteColor({ r, g, b }, palette);
        finalR = palette[idx].r;
        finalG = palette[idx].g;
        finalB = palette[idx].b;
      }

      // 블록 그리기 (실제 표시 크기는 effectivePixelSize 기준)
      const blockX = px * effectivePixelSize;
      const blockY = py * effectivePixelSize;
      // 블록 크기는 캔버스 경계를 넘지 않도록 + 인접 블록 간 틈 방지를 위해 ceil
      const blockW = Math.min(Math.ceil(effectivePixelSize), srcWidth - Math.floor(blockX));
      const blockH = Math.min(Math.ceil(effectivePixelSize), srcHeight - Math.floor(blockY));

      ctx.fillStyle = `rgb(${finalR},${finalG},${finalB})`;
      ctx.fillRect(blockX, blockY, blockW, blockH);
    }
  }

  // 격자선 그리기 (블록이 4px 이상일 때만 의미 있음)
  if (showGrid && effectivePixelSize >= 4) {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    for (let px = 0; px <= targetWidth; px++) {
      const x = Math.round(px * effectivePixelSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, srcHeight);
      ctx.stroke();
    }
    for (let py = 0; py <= targetHeight; py++) {
      const y = Math.round(py * effectivePixelSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(srcWidth, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}

/**
 * 밝기/대비 조정이 적용된 ImageData 반환
 * Web Worker에 넘기기 전 전처리용
 */
export function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number,
): ImageData {
  if (brightness === 0 && contrast === 0) return imageData;

  const result = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const { data: out } = result;

  for (let i = 0; i < data.length; i += 4) {
    out[i] = adjustPixel(data[i], brightness, contrast);
    out[i + 1] = adjustPixel(data[i + 1], brightness, contrast);
    out[i + 2] = adjustPixel(data[i + 2], brightness, contrast);
    out[i + 3] = data[i + 3];
  }

  return result;
}
