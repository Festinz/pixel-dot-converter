import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Web Worker 및 React 지원 설정
// base: './' — Electron에서 file:// 프로토콜로 로드할 때 상대 경로 필요
export default defineConfig({
  plugins: [react()],
  base: './',
  worker: {
    // Web Worker를 ES 모듈로 빌드
    format: 'es',
  },
});
