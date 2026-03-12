// ============================================================
// 상단 헤더 컴포넌트
// 모드 전환 탭, 다크모드 토글, 내보내기 버튼 포함
// ============================================================

import React from 'react';
import type { ConversionMode } from '../types';

interface HeaderProps {
  mode: ConversionMode;
  onModeChange: (mode: ConversionMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasImage: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  darkMode,
  onToggleDarkMode,
  hasImage,
  onExportPNG,
  onExportSVG,
}) => {
  return (
    <header
      className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      role="banner"
    >
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* 로고 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="0" y="0" width="4" height="4" />
              <rect x="6" y="0" width="4" height="4" />
              <rect x="12" y="0" width="4" height="4" />
              <rect x="0" y="6" width="4" height="4" />
              <circle cx="8" cy="8" r="2" />
              <rect x="12" y="6" width="4" height="4" />
              <rect x="0" y="12" width="4" height="4" />
              <rect x="6" y="12" width="4" height="4" />
              <rect x="12" y="12" width="4" height="4" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base hidden sm:block">
            픽셀 도트 변환기
          </span>
        </div>

        {/* 모드 전환 탭 */}
        <nav
          className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1"
          role="tablist"
          aria-label="변환 모드 선택"
        >
          <button
            role="tab"
            aria-selected={mode === 'pixel'}
            onClick={() => onModeChange('pixel')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              mode === 'pixel'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            픽셀 아트
          </button>
          <button
            role="tab"
            aria-selected={mode === 'dot'}
            onClick={() => onModeChange('dot')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              mode === 'dot'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            도트 아트
          </button>
        </nav>

        {/* 우측 버튼 그룹 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 내보내기 버튼 */}
          {hasImage && (
            <div className="flex items-center gap-1">
              <button
                onClick={onExportPNG}
                className="px-3 py-1.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="PNG로 내보내기"
              >
                PNG 저장
              </button>
              {mode === 'dot' && (
                <button
                  onClick={onExportSVG}
                  className="px-3 py-1.5 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="SVG로 내보내기"
                >
                  SVG 저장
                </button>
              )}
            </div>
          )}

          {/* 다크모드 토글 */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={darkMode ? '라이트 모드' : '다크 모드'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
