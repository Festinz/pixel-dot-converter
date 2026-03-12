// ============================================================
// Median Cut 색상 양자화 알고리즘
// 이미지 픽셀 데이터에서 대표 색상 팔레트를 추출합니다.
// ============================================================

import type { RGBColor } from '../types';

/** 픽셀 배열에서 팔레트를 추출하는 함수 */
export function medianCut(pixels: RGBColor[], maxColors: number): RGBColor[] {
  if (pixels.length === 0) return [];
  if (maxColors <= 0) return [];

  // 픽셀 수가 원하는 색상 수보다 적으면 그대로 반환
  if (pixels.length <= maxColors) {
    return [...pixels];
  }

  // 초기 버킷 생성
  let buckets: RGBColor[][] = [pixels];

  // 목표 색상 수에 도달할 때까지 버킷 분할
  while (buckets.length < maxColors) {
    // 가장 범위가 넓은 버킷 선택
    let maxRange = -1;
    let splitIndex = 0;

    for (let i = 0; i < buckets.length; i++) {
      const range = getBucketRange(buckets[i]);
      if (range > maxRange) {
        maxRange = range;
        splitIndex = i;
      }
    }

    // 더 이상 분할할 수 없으면 종료
    if (maxRange === 0) break;

    // 선택된 버킷을 분할
    const [left, right] = splitBucket(buckets[splitIndex]);
    buckets.splice(splitIndex, 1, left, right);

    // 빈 버킷 제거
    buckets = buckets.filter((b) => b.length > 0);
  }

  // 각 버킷의 평균 색상 반환
  return buckets.map(getAverageColor);
}

/** 버킷의 RGB 범위 중 최대값 반환 */
function getBucketRange(bucket: RGBColor[]): number {
  let minR = 255, maxR = 0;
  let minG = 255, maxG = 0;
  let minB = 255, maxB = 0;

  for (const { r, g, b } of bucket) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (g < minG) minG = g;
    if (g > maxG) maxG = g;
    if (b < minB) minB = b;
    if (b > maxB) maxB = b;
  }

  return Math.max(maxR - minR, maxG - minG, maxB - minB);
}

/** 버킷을 가장 넓은 채널 기준으로 중앙값에서 분할 */
function splitBucket(bucket: RGBColor[]): [RGBColor[], RGBColor[]] {
  let minR = 255, maxR = 0;
  let minG = 255, maxG = 0;
  let minB = 255, maxB = 0;

  for (const { r, g, b } of bucket) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (g < minG) minG = g;
    if (g > maxG) maxG = g;
    if (b < minB) minB = b;
    if (b > maxB) maxB = b;
  }

  const rangeR = maxR - minR;
  const rangeG = maxG - minG;
  const rangeB = maxB - minB;

  // 범위가 가장 넓은 채널 기준으로 정렬
  let sorted: RGBColor[];
  if (rangeR >= rangeG && rangeR >= rangeB) {
    sorted = [...bucket].sort((a, b) => a.r - b.r);
  } else if (rangeG >= rangeB) {
    sorted = [...bucket].sort((a, b) => a.g - b.g);
  } else {
    sorted = [...bucket].sort((a, b) => a.b - b.b);
  }

  // 중앙값에서 분할
  const mid = Math.floor(sorted.length / 2);
  return [sorted.slice(0, mid), sorted.slice(mid)];
}

/** 버킷의 평균 색상 계산 */
function getAverageColor(bucket: RGBColor[]): RGBColor {
  const len = bucket.length;
  if (len === 0) return { r: 0, g: 0, b: 0 };

  let sumR = 0, sumG = 0, sumB = 0;
  for (const { r, g, b } of bucket) {
    sumR += r;
    sumG += g;
    sumB += b;
  }

  return {
    r: Math.round(sumR / len),
    g: Math.round(sumG / len),
    b: Math.round(sumB / len),
  };
}

/** 가장 가까운 팔레트 색상 인덱스를 반환 (유클리드 거리 기반) */
export function findClosestPaletteColor(color: RGBColor, palette: RGBColor[]): number {
  let minDist = Infinity;
  let closest = 0;

  for (let i = 0; i < palette.length; i++) {
    const dr = color.r - palette[i].r;
    const dg = color.g - palette[i].g;
    const db = color.b - palette[i].b;
    // 인간의 눈 가중치 적용 (R: 0.299, G: 0.587, B: 0.114)
    const dist = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }

  return closest;
}

/**
 * ImageData에서 픽셀 샘플을 추출하여 팔레트 생성
 * 성능을 위해 최대 10000개 픽셀만 샘플링
 */
export function extractPaletteFromImageData(
  imageData: ImageData,
  maxColors: number,
): RGBColor[] {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const sampleStep = Math.max(1, Math.floor(totalPixels / 10000));

  const pixels: RGBColor[] = [];
  for (let i = 0; i < totalPixels; i += sampleStep) {
    const offset = i * 4;
    const a = data[offset + 3];
    if (a > 128) { // 투명 픽셀 제외
      pixels.push({
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
      });
    }
  }

  return medianCut(pixels, maxColors);
}
