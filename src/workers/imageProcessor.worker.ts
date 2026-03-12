// ============================================================
// 이미지 처리 Web Worker
// 메인 스레드 블로킹 없이 색상 양자화와 디더링을 처리합니다.
// ============================================================

import { extractPaletteFromImageData } from '../utils/colorQuantization';
import { applyDithering } from '../utils/dithering';
import type { WorkerRequest, WorkerResponse, RGBColor } from '../types';
import { PRESET_PALETTES, hexToRgb } from '../utils/palettes';

/**
 * 밝기/대비 조정 헬퍼
 */
function adjustPixel(value: number, brightness: number, contrast: number): number {
  let v = value + (brightness / 100) * 128;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  v = factor * (v - 128) + 128;
  return Math.max(0, Math.min(255, v));
}

/**
 * ImageData에 밝기/대비 적용
 */
function applyBrightnessContrast(
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

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, imageData, mode, pixelSettings, dotSettings } = event.data;

  if (type !== 'process') return;

  try {
    const settings = mode === 'pixel' ? pixelSettings! : dotSettings!;
    const brightness = settings.brightness ?? 0;
    const contrast = settings.contrast ?? 0;
    const dithering = settings.dithering ?? 'none';

    // 진행률 보고
    self.postMessage({ type: 'progress', progress: 10 } as WorkerResponse);

    // 1단계: 밝기/대비 조정
    let processed = applyBrightnessContrast(imageData, brightness, contrast);

    self.postMessage({ type: 'progress', progress: 30 } as WorkerResponse);

    // 2단계: 팔레트 결정
    let palette: RGBColor[] = [];

    if (mode === 'pixel' && pixelSettings) {
      const { paletteSize, customPaletteColors } = pixelSettings;

      if (paletteSize !== 'none') {
        // 프리셋 팔레트 확인
        const presetNames = ['gameboy', 'nes', 'snes', 'monochrome'];
        const presetMatch = presetNames.find((n) => n === String(paletteSize));

        if (presetMatch) {
          const preset = PRESET_PALETTES.find((p) => p.name === presetMatch);
          palette = preset ? preset.colors : [];
        } else if (paletteSize === 'custom' && customPaletteColors.length > 0) {
          palette = customPaletteColors.map(hexToRgb);
        } else if (typeof paletteSize === 'number') {
          palette = extractPaletteFromImageData(processed, paletteSize);
        }
      }
    }

    self.postMessage({ type: 'progress', progress: 60 } as WorkerResponse);

    // 3단계: 디더링 적용
    if (dithering !== 'none' && palette.length > 0) {
      processed = applyDithering(processed, dithering, palette);
    }

    self.postMessage({ type: 'progress', progress: 90 } as WorkerResponse);

    // 결과 전송 (transferable로 버퍼 이동, 복사 없음)
    self.postMessage(
      {
        type: 'result',
        imageData: processed,
        palette,
      } as WorkerResponse,
      { transfer: [processed.data.buffer] },
    );
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    } as WorkerResponse);
  }
};
