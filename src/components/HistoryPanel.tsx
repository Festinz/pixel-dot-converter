// ============================================================
// 변환 이력 패널 컴포넌트
// 세션 내 최대 5개의 최근 변환 이력을 표시합니다.
// ============================================================

import React from 'react';
import type { HistoryItem, ConversionMode } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const MODE_LABELS: Record<ConversionMode, string> = {
  pixel: '픽셀 아트',
  dot: '도트 아트',
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          최근 변환 이력
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          aria-label="이력 전체 삭제"
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-1.5" role="list" aria-label="변환 이력">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            role="listitem"
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label={`${item.originalName} - ${MODE_LABELS[item.mode]} 불러오기`}
          >
            {/* 썸네일 */}
            <img
              src={item.thumbnailUrl}
              alt={item.originalName}
              className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-600 shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {item.originalName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {MODE_LABELS[item.mode]} · {new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
