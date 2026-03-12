// ============================================================
// 디더링 알고리즘 구현
// Floyd-Steinberg, Ordered(Bayer 4x4), Atkinson 지원
// ============================================================

import type { RGBColor } from '../types';
import { findClosestPaletteColor } from './colorQuantization';

/** ImageData를 RGBColor 2D 배열로 변환 (처리 편의를 위해) */
function imageDataToGrid(imageData: ImageData): RGBColor[][] {
  const { data, width, height } = imageData;
  const grid: RGBColor[][] = [];

  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      grid[y][x] = {
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
      };
    }
  }

  return grid;
}

/** RGBColor 2D 배열을 ImageData에 기록 */
function gridToImageData(grid: RGBColor[][], imageData: ImageData): void {
  const { data, width } = imageData;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const offset = (y * width + x) * 4;
      data[offset] = Math.max(0, Math.min(255, grid[y][x].r));
      data[offset + 1] = Math.max(0, Math.min(255, grid[y][x].g));
      data[offset + 2] = Math.max(0, Math.min(255, grid[y][x].b));
    }
  }
}

/**
 * Floyd-Steinberg 디더링
 * 오차를 인접 4픽셀에 분산: 우(7/16), 좌하(3/16), 하(5/16), 우하(1/16)
 */
export function floydSteinbergDithering(imageData: ImageData, palette: RGBColor[]): ImageData {
  const { width, height } = imageData;
  const grid = imageDataToGrid(imageData);
  const result = new ImageData(width, height);

  // 원본 alpha 채널 복사
  for (let i = 3; i < imageData.data.length; i += 4) {
    result.data[i] = imageData.data[i];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldColor = grid[y][x];
      const paletteIdx = findClosestPaletteColor(oldColor, palette);
      const newColor = palette[paletteIdx];

      // 오차 계산
      const errR = oldColor.r - newColor.r;
      const errG = oldColor.g - newColor.g;
      const errB = oldColor.b - newColor.b;

      // 오차 분산
      if (x + 1 < width) {
        grid[y][x + 1].r += (errR * 7) / 16;
        grid[y][x + 1].g += (errG * 7) / 16;
        grid[y][x + 1].b += (errB * 7) / 16;
      }
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          grid[y + 1][x - 1].r += (errR * 3) / 16;
          grid[y + 1][x - 1].g += (errG * 3) / 16;
          grid[y + 1][x - 1].b += (errB * 3) / 16;
        }
        grid[y + 1][x].r += (errR * 5) / 16;
        grid[y + 1][x].g += (errG * 5) / 16;
        grid[y + 1][x].b += (errB * 5) / 16;
        if (x + 1 < width) {
          grid[y + 1][x + 1].r += (errR * 1) / 16;
          grid[y + 1][x + 1].g += (errG * 1) / 16;
          grid[y + 1][x + 1].b += (errB * 1) / 16;
        }
      }

      grid[y][x] = newColor;
    }
  }

  gridToImageData(grid, result);
  return result;
}

/**
 * Ordered (Bayer 4x4) 디더링
 * 임계값 행렬 기반 디더링
 */
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function orderedDithering(imageData: ImageData, palette: RGBColor[]): ImageData {
  const { data, width, height } = imageData;
  const result = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const threshold = ((BAYER_4X4[y % 4][x % 4] / 16) - 0.5) * 64;

      const adjustedColor: RGBColor = {
        r: Math.max(0, Math.min(255, data[offset] + threshold)),
        g: Math.max(0, Math.min(255, data[offset + 1] + threshold)),
        b: Math.max(0, Math.min(255, data[offset + 2] + threshold)),
      };

      const paletteIdx = findClosestPaletteColor(adjustedColor, palette);
      const newColor = palette[paletteIdx];

      result.data[offset] = newColor.r;
      result.data[offset + 1] = newColor.g;
      result.data[offset + 2] = newColor.b;
      result.data[offset + 3] = data[offset + 3];
    }
  }

  return result;
}

/**
 * Atkinson 디더링
 * 오차의 1/8을 6개 인접 픽셀에 분산
 */
export function atkinsonDithering(imageData: ImageData, palette: RGBColor[]): ImageData {
  const { width, height } = imageData;
  const grid = imageDataToGrid(imageData);
  const result = new ImageData(width, height);

  // 원본 alpha 채널 복사
  for (let i = 3; i < imageData.data.length; i += 4) {
    result.data[i] = imageData.data[i];
  }

  const addError = (
    grid: RGBColor[][],
    x: number,
    y: number,
    errR: number,
    errG: number,
    errB: number,
    height: number,
    width: number,
  ) => {
    if (y >= 0 && y < height && x >= 0 && x < width) {
      grid[y][x].r += errR / 8;
      grid[y][x].g += errG / 8;
      grid[y][x].b += errB / 8;
    }
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldColor = grid[y][x];
      const paletteIdx = findClosestPaletteColor(oldColor, palette);
      const newColor = palette[paletteIdx];

      const errR = oldColor.r - newColor.r;
      const errG = oldColor.g - newColor.g;
      const errB = oldColor.b - newColor.b;

      // 6개 인접 픽셀에 오차 분산
      addError(grid, x + 1, y, errR, errG, errB, height, width);
      addError(grid, x + 2, y, errR, errG, errB, height, width);
      addError(grid, x - 1, y + 1, errR, errG, errB, height, width);
      addError(grid, x, y + 1, errR, errG, errB, height, width);
      addError(grid, x + 1, y + 1, errR, errG, errB, height, width);
      addError(grid, x, y + 2, errR, errG, errB, height, width);

      grid[y][x] = newColor;
    }
  }

  gridToImageData(grid, result);
  return result;
}

/**
 * 디더링 적용 함수 (타입에 따라 선택)
 * palette가 비어있으면 원본 ImageData 반환
 */
export function applyDithering(
  imageData: ImageData,
  type: 'none' | 'floyd-steinberg' | 'ordered' | 'atkinson',
  palette: RGBColor[],
): ImageData {
  if (type === 'none' || palette.length === 0) return imageData;

  switch (type) {
    case 'floyd-steinberg':
      return floydSteinbergDithering(imageData, palette);
    case 'ordered':
      return orderedDithering(imageData, palette);
    case 'atkinson':
      return atkinsonDithering(imageData, palette);
    default:
      return imageData;
  }
}
