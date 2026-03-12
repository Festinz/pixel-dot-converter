// ============================================================
// 팔레트 스와치 표시 컴포넌트
// 추출된 색상 팔레트를 표시하고 hex 코드 복사 기능 제공
// ============================================================

import React, { useState, useCallback } from 'react';
import type { RGBColor } from '../types';
import { rgbToHex } from '../utils/palettes';

interface PaletteDisplayProps {
  palette: RGBColor[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ palette }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /** hex 코드를 클립보드에 복사 */
  const copyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1500);
    } catch {
      // clipboard API 미지원 시 폴백
      const textarea = document.createElement('textarea');
      textarea.value = hex;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1500);
    }
  }, []);

  if (palette.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* 토글 헤더 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
        aria-expanded={isOpen}
        aria-controls="palette-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            추출된 팔레트
          </span>
          {/* 색상 수 뱃지 */}
          <span className="text-[10px] font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-full">
            {palette.length}색
          </span>
          {/* 닫혀 있을 때 미리보기 스와치 5개 */}
          {!isOpen && (
            <div className="flex gap-0.5">
              {palette.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }}
                />
              ))}
              {palette.length > 5 && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-3 ml-0.5">
                  +{palette.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 접이식 내용 */}
      {isOpen && (
        <div id="palette-content" className="px-4 pb-3">
          <div
            className="flex flex-wrap gap-1.5"
            role="list"
            aria-label="추출된 색상 팔레트"
          >
            {palette.map((color, index) => {
              const hex = rgbToHex(color);
              const isCopied = copiedHex === hex;

              return (
                <button
                  key={index}
                  role="listitem"
                  onClick={() => copyHex(hex)}
                  title={`${hex} (클릭하여 복사)`}
                  aria-label={`색상 ${hex} 복사`}
                  className="group relative flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
                >
                  <div
                    className="w-8 h-8 rounded-md border border-black/10 dark:border-white/10 transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm"
                    style={{ backgroundColor: `rgb(${color.r},${color.g},${color.b})` }}
                  />
                  {/* hover 시 hex 코드 표시 */}
                  <span className="absolute -bottom-5 text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-700 text-white px-1 py-0.5 rounded z-10">
                    {hex}
                  </span>
                  {/* 복사 완료 피드백 */}
                  {isCopied && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 text-white text-[10px] font-bold"
                      aria-live="polite"
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-gray-400 dark:text-gray-500">
            색상 클릭 시 hex 코드가 복사됩니다
          </p>
        </div>
      )}
    </div>
  );
};
