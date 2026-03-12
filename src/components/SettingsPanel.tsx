// ============================================================
// 설정 패널 컴포넌트
// 픽셀 아트 / 도트 아트 설정 슬라이더 및 옵션 제공
// ============================================================

import React, { useState } from 'react';
import type {
  ConversionMode,
  PixelArtSettings,
  DotArtSettings,
  DitheringType,
} from '../types';
import { PRESET_PALETTES } from '../utils/palettes';

interface SettingsPanelProps {
  mode: ConversionMode;
  pixelSettings: PixelArtSettings;
  dotSettings: DotArtSettings;
  onPixelSettingsChange: (settings: PixelArtSettings) => void;
  onDotSettingsChange: (settings: DotArtSettings) => void;
  exportScale: 1 | 2 | 4;
  onExportScaleChange: (scale: 1 | 2 | 4) => void;
}

/** 슬라이더 컴포넌트 */
const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  id: string;
}> = ({ label, value, min, max, step = 1, unit = '', onChange, id }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
        {value}{unit}
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
      aria-label={`${label}: ${value}${unit}`}
    />
    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

/** 섹션 헤더 */
const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-5 mb-3 first:mt-0">
    {children}
  </h3>
);

/** 토글 스위치 */
const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}> = ({ label, checked, onChange, id }) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
      {label}
    </label>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        checked ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  mode,
  pixelSettings,
  dotSettings,
  onPixelSettingsChange,
  onDotSettingsChange,
  exportScale,
  onExportScaleChange,
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const updatePixel = <K extends keyof PixelArtSettings>(key: K, value: PixelArtSettings[K]) => {
    onPixelSettingsChange({ ...pixelSettings, [key]: value });
  };

  const updateDot = <K extends keyof DotArtSettings>(key: K, value: DotArtSettings[K]) => {
    onDotSettingsChange({ ...dotSettings, [key]: value });
  };

  const ditheringOptions: { value: DitheringType; label: string }[] = [
    { value: 'none', label: '없음' },
    { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
    { value: 'ordered', label: 'Ordered (Bayer)' },
    { value: 'atkinson', label: 'Atkinson' },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-4 py-4 space-y-1">
      {/* ─── 공통: 이미지 조정 ─── */}
      <SectionHeader>이미지 조정</SectionHeader>

      <Slider
        id="brightness"
        label="밝기"
        value={mode === 'pixel' ? pixelSettings.brightness : dotSettings.brightness}
        min={-100}
        max={100}
        onChange={(v) =>
          mode === 'pixel' ? updatePixel('brightness', v) : updateDot('brightness', v)
        }
      />
      <div className="mt-3">
        <Slider
          id="contrast"
          label="대비"
          value={mode === 'pixel' ? pixelSettings.contrast : dotSettings.contrast}
          min={-100}
          max={100}
          onChange={(v) =>
            mode === 'pixel' ? updatePixel('contrast', v) : updateDot('contrast', v)
          }
        />
      </div>

      {/* ─── 디더링 ─── */}
      <SectionHeader>디더링</SectionHeader>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          알고리즘
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ditheringOptions.map((opt) => {
            const current = mode === 'pixel' ? pixelSettings.dithering : dotSettings.dithering;
            return (
              <button
                key={opt.value}
                onClick={() =>
                  mode === 'pixel'
                    ? updatePixel('dithering', opt.value)
                    : updateDot('dithering', opt.value)
                }
                className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  current === opt.value
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-400'
                }`}
                aria-pressed={current === opt.value}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 픽셀 아트 설정 ─── */}
      {mode === 'pixel' && (
        <>
          <SectionHeader>픽셀 아트 설정</SectionHeader>

          <Slider
            id="pixelSize"
            label="픽셀 크기"
            value={pixelSettings.pixelSize}
            min={0.5}
            max={64}
            step={0.5}
            unit="px"
            onChange={(v) => updatePixel('pixelSize', v)}
          />
          {/* 픽셀 크기에 따른 품질 힌트 */}
          <div className="flex items-center justify-between mt-1 px-0.5">
            {([
              { size: 0.5, label: '초고화질' },
              { size: 1, label: '고화질' },
              { size: 2, label: '선명' },
              { size: 4, label: '표준' },
              { size: 8, label: '픽셀' },
            ] as const).map(({ size, label }) => (
              <button
                key={size}
                onClick={() => updatePixel('pixelSize', size)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  pixelSettings.pixelSize === size
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-400 dark:text-gray-500 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
                aria-label={`픽셀 크기 ${size}px (${label})`}
                title={`${size}px — ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <SectionHeader>컬러 팔레트</SectionHeader>

            {/* 프리셋 팔레트 */}
            <div className="space-y-1.5 mb-3">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setActivePreset(preset.name);
                    updatePixel('paletteSize', 'custom');
                    updatePixel(
                      'customPaletteColors',
                      preset.colors.map(
                        (c) => `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`,
                      ),
                    );
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    activePreset === preset.name
                      ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-400 text-sky-700 dark:text-sky-300'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-300'
                  }`}
                  aria-pressed={activePreset === preset.name}
                >
                  <span>{preset.label}</span>
                  <div className="flex gap-0.5">
                    {preset.colors.slice(0, 6).map((c, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-sm border border-black/10"
                        style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* 색상 수 제한 */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              색상 수 제한
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['none', 8, 16, 32, 64] as const).map((size) => (
                <button
                  key={String(size)}
                  onClick={() => {
                    setActivePreset(null);
                    updatePixel('paletteSize', size);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    pixelSettings.paletteSize === size && activePreset === null
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-400'
                  }`}
                  aria-pressed={pixelSettings.paletteSize === size && activePreset === null}
                >
                  {size === 'none' ? '원본' : `${size}색`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Toggle
              id="showGrid"
              label="격자선 표시"
              checked={pixelSettings.showGrid}
              onChange={(v) => updatePixel('showGrid', v)}
            />
            {pixelSettings.showGrid && (
              <div className="flex items-center justify-between pl-4">
                <label
                  htmlFor="gridColor"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  격자선 색상
                </label>
                <input
                  id="gridColor"
                  type="color"
                  value={pixelSettings.gridColor}
                  onChange={(e) => updatePixel('gridColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  aria-label="격자선 색상 선택"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── 도트 아트 설정 ─── */}
      {mode === 'dot' && (
        <>
          <SectionHeader>도트 아트 설정</SectionHeader>

          <Slider
            id="dotSize"
            label="도트 크기"
            value={dotSettings.dotSize}
            min={2}
            max={32}
            unit="px"
            onChange={(v) => updateDot('dotSize', v)}
          />
          <div className="mt-3">
            <Slider
              id="gap"
              label="간격"
              value={dotSettings.gap}
              min={0}
              max={16}
              unit="px"
              onChange={(v) => updateDot('gap', v)}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              도트 모양
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { value: 'circle', label: '원형' },
                { value: 'square', label: '사각형' },
                { value: 'diamond', label: '다이아몬드' },
              ] as const).map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => updateDot('dotShape', shape.value)}
                  className={`py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    dotSettings.dotShape === shape.value
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-400'
                  }`}
                  aria-pressed={dotSettings.dotShape === shape.value}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="bgColor"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                배경 색상
              </label>
              <input
                id="bgColor"
                type="color"
                value={dotSettings.backgroundColor}
                onChange={(e) => updateDot('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                aria-label="배경 색상 선택"
              />
            </div>

            <Toggle
              id="brightnessSizeVariation"
              label="밝기 기반 크기 변화"
              checked={dotSettings.brightnessSizeVariation}
              onChange={(v) => updateDot('brightnessSizeVariation', v)}
            />
          </div>
        </>
      )}

      {/* ─── 내보내기 설정 ─── */}
      <SectionHeader>내보내기 배율</SectionHeader>
      <div className="grid grid-cols-3 gap-1.5">
        {([1, 2, 4] as const).map((scale) => (
          <button
            key={scale}
            onClick={() => onExportScaleChange(scale)}
            className={`py-1.5 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              exportScale === scale
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-400'
            }`}
            aria-pressed={exportScale === scale}
          >
            {scale}x
          </button>
        ))}
      </div>
    </div>
  );
};
