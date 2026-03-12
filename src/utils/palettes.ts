// ============================================================
// 프리셋 팔레트 데이터 정의
// ============================================================

import type { RGBColor } from '../types';

/** 팔레트 정보 */
export interface PalettePreset {
  name: string;
  label: string;
  colors: RGBColor[];
}

/** Game Boy 4색 팔레트 */
const GAMEBOY: RGBColor[] = [
  { r: 15, g: 56, b: 15 },
  { r: 48, g: 98, b: 48 },
  { r: 139, g: 172, b: 15 },
  { r: 155, g: 188, b: 15 },
];

/** NES 54색 팔레트 (대표색 선별) */
const NES: RGBColor[] = [
  { r: 124, g: 124, b: 124 },
  { r: 0, g: 0, b: 252 },
  { r: 0, g: 0, b: 188 },
  { r: 68, g: 40, b: 188 },
  { r: 148, g: 0, b: 132 },
  { r: 168, g: 0, b: 32 },
  { r: 168, g: 16, b: 0 },
  { r: 136, g: 20, b: 0 },
  { r: 80, g: 48, b: 0 },
  { r: 0, g: 120, b: 0 },
  { r: 0, g: 104, b: 0 },
  { r: 0, g: 88, b: 0 },
  { r: 0, g: 64, b: 88 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 188, g: 188, b: 188 },
  { r: 0, g: 120, b: 248 },
  { r: 0, g: 88, b: 248 },
  { r: 104, g: 68, b: 252 },
  { r: 216, g: 0, b: 204 },
  { r: 228, g: 0, b: 88 },
  { r: 248, g: 56, b: 0 },
  { r: 228, g: 92, b: 16 },
  { r: 172, g: 124, b: 0 },
  { r: 0, g: 184, b: 0 },
  { r: 0, g: 168, b: 0 },
  { r: 0, g: 168, b: 68 },
  { r: 0, g: 136, b: 136 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 248, g: 248, b: 248 },
  { r: 60, g: 188, b: 252 },
  { r: 104, g: 136, b: 252 },
  { r: 152, g: 120, b: 248 },
  { r: 248, g: 120, b: 248 },
  { r: 248, g: 88, b: 152 },
  { r: 248, g: 120, b: 88 },
  { r: 252, g: 160, b: 68 },
  { r: 248, g: 184, b: 0 },
  { r: 184, g: 248, b: 24 },
  { r: 88, g: 216, b: 84 },
  { r: 88, g: 248, b: 152 },
  { r: 0, g: 232, b: 216 },
  { r: 120, g: 120, b: 120 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 252, g: 252, b: 252 },
  { r: 164, g: 228, b: 252 },
  { r: 184, g: 184, b: 248 },
  { r: 216, g: 184, b: 248 },
  { r: 248, g: 184, b: 248 },
  { r: 248, g: 164, b: 192 },
];

/** 흑백 팔레트 (16단계) */
const MONOCHROME: RGBColor[] = Array.from({ length: 16 }, (_, i) => {
  const v = Math.round((i / 15) * 255);
  return { r: v, g: v, b: v };
});

/** SNES 256색 팔레트 (대표 색상 선별) */
const SNES: RGBColor[] = (() => {
  const colors: RGBColor[] = [];
  // 기본 8색
  colors.push(
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 0, g: 255, b: 255 },
    { r: 255, g: 0, b: 255 },
  );
  // R, G, B 각 채널 4단계씩 조합 (4*4*4 = 64색)
  for (let r = 0; r <= 3; r++) {
    for (let g = 0; g <= 3; g++) {
      for (let b = 0; b <= 3; b++) {
        colors.push({
          r: Math.round((r / 3) * 255),
          g: Math.round((g / 3) * 255),
          b: Math.round((b / 3) * 255),
        });
      }
    }
  }
  // 그레이스케일 16단계
  for (let i = 0; i < 16; i++) {
    const v = Math.round((i / 15) * 255);
    colors.push({ r: v, g: v, b: v });
  }
  // 중간톤 추가
  const midTones = [128, 64, 192];
  for (const r of midTones) {
    for (const g of midTones) {
      for (const b of midTones) {
        colors.push({ r, g, b });
      }
    }
  }
  // 중복 제거
  const unique = new Map<string, RGBColor>();
  for (const c of colors) {
    unique.set(`${c.r},${c.g},${c.b}`, c);
  }
  return Array.from(unique.values()).slice(0, 256);
})();

/** 사용 가능한 프리셋 팔레트 목록 */
export const PRESET_PALETTES: PalettePreset[] = [
  { name: 'gameboy', label: 'Game Boy (4색)', colors: GAMEBOY },
  { name: 'nes', label: 'NES (54색)', colors: NES },
  { name: 'snes', label: 'SNES (256색)', colors: SNES },
  { name: 'monochrome', label: '흑백 (16단계)', colors: MONOCHROME },
];

/** hex 문자열을 RGBColor로 변환 */
export function hexToRgb(hex: string): RGBColor {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/** RGBColor를 hex 문자열로 변환 */
export function rgbToHex(color: RGBColor): string {
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}
