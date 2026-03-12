// ============================================================
// 캔버스 뷰 컴포넌트
// 원본 이미지와 변환 결과를 나란히 표시
// 줌, 패닝, 진행률 표시 포함
// ============================================================

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { UploadedImage } from '../types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';

interface CanvasViewProps {
  uploadedImage: UploadedImage | null;
  isProcessing: boolean;
  progress: number;
}

export interface CanvasViewHandle {
  getOutputCanvas: () => HTMLCanvasElement | null;
  getSourceCanvas: () => HTMLCanvasElement | null;
}

export const CanvasView = forwardRef<CanvasViewHandle, CanvasViewProps>(
  ({ uploadedImage, isProcessing, progress }, ref) => {
    const outputCanvasRef = useRef<HTMLCanvasElement>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);

    const {
      transform,
      containerRef,
      zoomIn,
      zoomOut,
      resetTransform,
      handleWheel,
      handleMouseDown,
      isDragging,
    } = useCanvasInteraction();

    // 외부에서 canvas 접근 가능하도록 노출
    useImperativeHandle(ref, () => ({
      getOutputCanvas: () => outputCanvasRef.current,
      getSourceCanvas: () => sourceCanvasRef.current,
    }));

    // 원본 이미지를 소스 canvas에 렌더링
    useEffect(() => {
      if (!uploadedImage || !sourceCanvasRef.current) return;

      const canvas = sourceCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = uploadedImage.url;
    }, [uploadedImage]);

    // 키보드 줌 지원
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-') zoomOut();
        if (e.key === '0') resetTransform();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomIn, zoomOut, resetTransform]);

    const transformStyle: React.CSSProperties = {
      transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
      transformOrigin: 'center center',
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950">
        {/* 줌 컨트롤 바 */}
        <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              className="w-7 h-7 flex items-center justify-center rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="축소"
              title="축소 (-)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 text-center">
              {Math.round(transform.scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="w-7 h-7 flex items-center justify-center rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="확대"
              title="확대 (+)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={resetTransform}
              className="px-2 h-7 text-xs font-medium rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="원래 크기로"
              title="원래 크기로 (0)"
            >
              초기화
            </button>
          </div>

          <div className="flex items-center gap-2">
            {uploadedImage && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {uploadedImage.width} × {uploadedImage.height}px
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
              드래그로 이동 · 휠로 줌
            </span>
          </div>
        </div>

        {/* 진행률 바 */}
        {isProcessing && (
          <div className="relative h-1 bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="처리 중">
            <div
              className="h-full bg-sky-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* 캔버스 영역 */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none' }}
        >
          {!uploadedImage ? (
            // 이미지 없을 때 안내 메시지
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium">이미지를 업로드하면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={transformStyle}
            >
              {/* 원본 + 변환 결과 나란히 */}
              <div className="flex gap-4 items-start">
                {/* 원본 이미지 */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm">
                    원본
                  </span>
                  <canvas
                    ref={sourceCanvasRef}
                    className="block max-w-none shadow-lg rounded-sm"
                    style={{ imageRendering: 'pixelated' }}
                    aria-label="원본 이미지"
                  />
                </div>

                {/* 구분선 */}
                <div className="w-px self-stretch bg-gray-300 dark:bg-gray-600 mt-7" aria-hidden="true" />

                {/* 변환 결과 */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm">
                    변환 결과
                  </span>
                  <div className="relative">
                    <canvas
                      ref={outputCanvasRef}
                      className="block max-w-none shadow-lg rounded-sm"
                      style={{ imageRendering: 'pixelated' }}
                      aria-label="변환된 픽셀/도트 아트"
                    />
                    {/* 처리 중 오버레이 */}
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-sm">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-white text-sm font-medium">{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CanvasView.displayName = 'CanvasView';
