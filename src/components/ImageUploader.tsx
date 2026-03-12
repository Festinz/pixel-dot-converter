// ============================================================
// 이미지 업로드 컴포넌트
// 드래그 앤 드롭 + 파일 선택 버튼 지원
// ============================================================

import React, { useRef, useState, useCallback } from 'react';
import type { UploadedImage } from '../types';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageUploaderProps {
  onImageLoad: (image: UploadedImage) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 파일 유효성 검사 및 처리 */
  const processFile = useCallback(
    (file: File) => {
      setError(null);

      // 파일 형식 검사
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('지원하지 않는 파일 형식입니다. PNG, JPG, GIF, BMP, WebP만 지원합니다.');
        return;
      }

      // 파일 크기 검사
      if (file.size > MAX_FILE_SIZE) {
        setError('파일 크기가 10MB를 초과합니다. 더 작은 이미지를 사용해주세요.');
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        onImageLoad({
          file,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError('이미지 로드에 실패했습니다. 다른 파일을 선택해주세요.');
      };

      img.src = url;
    },
    [onImageLoad],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // 같은 파일 재선택 가능하도록 초기화
      e.target.value = '';
    },
    [processFile],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [],
  );

  return (
    <div className="w-full">
      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="이미지 업로드 영역. 파일을 드래그하거나 클릭하여 선택하세요"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[280px] rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 select-none
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          ${isDragOver
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10'
          }
        `}
      >
        {/* 아이콘 */}
        <div className={`mb-4 p-4 rounded-full transition-colors ${isDragOver ? 'bg-sky-100 dark:bg-sky-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <svg
            className={`w-10 h-10 transition-colors ${isDragOver ? 'text-sky-500' : 'text-gray-400 dark:text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* 텍스트 */}
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {isDragOver ? '여기에 놓으세요!' : '이미지를 드래그하거나 클릭하여 업로드'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          PNG, JPG, JPEG, GIF, BMP, WebP (최대 10MB)
        </p>

        <button
          type="button"
          tabIndex={-1}
          className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors pointer-events-none"
          aria-hidden="true"
        >
          파일 선택
        </button>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="파일 선택"
        tabIndex={-1}
      />

      {/* 에러 메시지 */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
