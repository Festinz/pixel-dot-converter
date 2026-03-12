// ============================================================
// 도트 아트 렌더링 함수
// 각 픽셀을 원형/사각형/다이아몬드 도트로 렌더링합니다.
// ============================================================

import type { DotArtSettings, RGBColor } from '../types';
import { findClosestPaletteColor } from './colorQuantization';

/**
 * 도트 하나를 지정된 모양으로 캔버스에 그립니다.
 */
function drawDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  shape: DotArtSettings['dotShape'],
): void {
  ctx.beginPath();

  switch (shape) {
    case 'circle':
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      break;

    case 'square': {
      const half = radius;
      ctx.rect(cx - half, cy - half, half * 2, half * 2);
      break;
    }

    case 'diamond': {
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx + radius, cy);
      ctx.lineTo(cx, cy + radius);
      ctx.lineTo(cx - radius, cy);
      ctx.closePath();
      break;
    }
  }

  ctx.fill();
}

/**
 * 도트 아트 렌더링
 * @param sourceCanvas 원본 이미지가 그려진 캔버스
 * @param outputCanvas 결과를 그릴 캔버스
 * @param settings 도트 아트 설정
 * @param palette 색상 팔레트 (없으면 원본 색상 사용)
 */
export function renderDotArt(
  sourceCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  settings: DotArtSettings,
  palette: RGBColor[],
): void {
  const {
    dotSize,
    gap,
    backgroundColor,
    dotShape,
    brightnessSizeVariation,
    brightness,
    contrast,
  } = settings;

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;

  // 각 도트가 차지하는 셀 크기
  const cellSize = dotSize + gap;

  // 목표 해상도 (셀 기준)
  const cols = Math.ceil(srcWidth / cellSize);
  const rows = Math.ceil(srcHeight / cellSize);

  // 다운샘플링 캔버스
  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = cols;
  smallCanvas.height = rows;
  const smallCtx = smallCanvas.getContext('2d')!;
  smallCtx.imageSmoothingEnabled = true; // 도트 아트는 부드러운 다운샘플링
  smallCtx.drawImage(sourceCanvas, 0, 0, cols, rows);

  const imageData = smallCtx.getImageData(0, 0, cols, rows);

  // 출력 캔버스 크기 설정
  outputCanvas.width = srcWidth;
  outputCanvas.height = srcHeight;
  const ctx = outputCanvas.getContext('2d')!;

  // 배경 색상 채우기
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, srcWidth, srcHeight);

  const { data } = imageData;
  const maxRadius = dotSize / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offset = (row * cols + col) * 4;
      let r = data[offset];
      let g = data[offset + 1];
      let b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) continue;

      // 밝기/대비 조정
      r = adjustPixel(r, brightness, contrast);
      g = adjustPixel(g, brightness, contrast);
      b = adjustPixel(b, brightness, contrast);

      let finalR = r, finalG = g, finalB = b;

      // 팔레트 색상 매핑
      if (palette.length > 0) {
        const idx = findClosestPaletteColor({ r, g, b }, palette);
        finalR = palette[idx].r;
        finalG = palette[idx].g;
        finalB = palette[idx].b;
      }

      // 도트 중심 좌표
      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;

      // 밝기 기반 도트 크기 변화
      let radius = maxRadius;
      if (brightnessSizeVariation) {
        // 밝기 계산 (0~1)
        const luminance = (finalR * 0.299 + finalG * 0.587 + finalB * 0.114) / 255;
        // 밝은 픽셀 = 작은 도트, 어두운 픽셀 = 큰 도트
        radius = maxRadius * (1 - luminance * 0.8);
        radius = Math.max(0.5, radius);
      }

      ctx.fillStyle = `rgb(${finalR},${finalG},${finalB})`;
      drawDot(ctx, cx, cy, radius, dotShape);
    }
  }
}

/**
 * 도트 아트를 SVG 문자열로 내보냅니다.
 */
export function renderDotArtToSVG(
  sourceCanvas: HTMLCanvasElement,
  settings: DotArtSettings,
  palette: RGBColor[],
  scale: number = 1,
): string {
  const {
    dotSize,
    gap,
    backgroundColor,
    dotShape,
    brightnessSizeVariation,
    brightness,
    contrast,
  } = settings;

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  const cellSize = dotSize + gap;
  const cols = Math.ceil(srcWidth / cellSize);
  const rows = Math.ceil(srcHeight / cellSize);

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = cols;
  smallCanvas.height = rows;
  const smallCtx = smallCanvas.getContext('2d')!;
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(sourceCanvas, 0, 0, cols, rows);

  const imageData = smallCtx.getImageData(0, 0, cols, rows);
  const { data } = imageData;
  const maxRadius = dotSize / 2;

  const svgWidth = srcWidth * scale;
  const svgHeight = srcHeight * scale;

  const shapes: string[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offset = (row * cols + col) * 4;
      let r = data[offset];
      let g = data[offset + 1];
      let b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) continue;

      r = adjustPixel(r, brightness, contrast);
      g = adjustPixel(g, brightness, contrast);
      b = adjustPixel(b, brightness, contrast);

      let finalR = r, finalG = g, finalB = b;

      if (palette.length > 0) {
        const idx = findClosestPaletteColor({ r, g, b }, palette);
        finalR = palette[idx].r;
        finalG = palette[idx].g;
        finalB = palette[idx].b;
      }

      const cx = (col * cellSize + cellSize / 2) * scale;
      const cy = (row * cellSize + cellSize / 2) * scale;
      const fill = `rgb(${finalR},${finalG},${finalB})`;

      let radius = maxRadius * scale;
      if (brightnessSizeVariation) {
        const luminance = (finalR * 0.299 + finalG * 0.587 + finalB * 0.114) / 255;
        radius = maxRadius * scale * (1 - luminance * 0.8);
        radius = Math.max(0.5, radius);
      }

      let shape = '';
      if (dotShape === 'circle') {
        shape = `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" fill="${fill}"/>`;
      } else if (dotShape === 'square') {
        const half = radius;
        shape = `<rect x="${(cx - half).toFixed(1)}" y="${(cy - half).toFixed(1)}" width="${(half * 2).toFixed(1)}" height="${(half * 2).toFixed(1)}" fill="${fill}"/>`;
      } else if (dotShape === 'diamond') {
        const pts = [
          `${cx.toFixed(1)},${(cy - radius).toFixed(1)}`,
          `${(cx + radius).toFixed(1)},${cy.toFixed(1)}`,
          `${cx.toFixed(1)},${(cy + radius).toFixed(1)}`,
          `${(cx - radius).toFixed(1)},${cy.toFixed(1)}`,
        ].join(' ');
        shape = `<polygon points="${pts}" fill="${fill}"/>`;
      }

      shapes.push(shape);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}"/>
  ${shapes.join('\n  ')}
</svg>`;
}

/** 밝기/대비 조정 헬퍼 */
function adjustPixel(value: number, brightness: number, contrast: number): number {
  let v = value + (brightness / 100) * 128;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  v = factor * (v - 128) + 128;
  return Math.max(0, Math.min(255, v));
}
