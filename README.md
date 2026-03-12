# Pixel Dot Converter

이미지를 픽셀 아트 또는 도트 아트로 변환하는 클라이언트 사이드 웹 앱입니다.
A client-side web application that converts images to pixel art or dot art.

> 외부 서버로 이미지가 전송되지 않습니다. 모든 처리는 브라우저에서 이루어집니다.
> No image is sent to any server. All processing happens entirely in your browser.

---

## Features

### Pixel Art Mode (픽셀 아트)
- 픽셀 크기 조절 (4 ~ 64px)
- 색상 팔레트 제한 (8 / 16 / 32 / 64 colors, 또는 사용자 지정)
- 그리드 오버레이 (색상 선택 가능)
- 밝기 / 대비 조절
- 디더링: Floyd-Steinberg, Ordered (Bayer 4x4), Atkinson

### Dot Art Mode (도트 아트)
- 도트 크기 (2 ~ 32px), 간격 (0 ~ 16px) 조절
- 도트 모양: Circle, Square, Diamond
- 배경색 선택
- 밝기에 따른 도트 크기 변형 (Brightness Size Variation)
- 디더링: Floyd-Steinberg, Ordered (Bayer 4x4), Atkinson

### 공통
- 프리셋 팔레트: Game Boy, NES, SNES, Monochrome
- PNG 내보내기 (1x / 2x / 4x 배율)
- SVG 내보내기 (벡터 — 무한 확대 가능)
- 원본 / 결과 나란히 보기 (줌 & 패닝)
- 다크 모드
- 변환 이력 (최근 5개)
- Web Worker 기반 비동기 처리 (UI 블로킹 없음)
- 드래그 앤 드롭 이미지 업로드

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/<your-username>/pixel-dot-converter.git
cd pixel-dot-converter
npm install
```

### Development (Web)

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열면 됩니다.

### Build (Web)

```bash
npm run build
npm run preview   # 빌드 결과 로컬 확인
```

`dist/` 폴더를 GitHub Pages, Vercel, Netlify 등 정적 호스팅 어디든 그대로 배포할 수 있습니다.

---

## Desktop App (Electron)

Electron으로 Windows / macOS / Linux 데스크탑 앱으로도 빌드할 수 있습니다.

```bash
# 개발 모드 (Electron + Vite HMR 동시 실행)
npm run electron:dev

# 플랫폼별 빌드
npm run electron:build:win    # Windows x64
npm run electron:build:mac    # macOS dmg
npm run electron:build:linux  # Linux AppImage
```

빌드 결과물은 `dist-electron/` 폴더에 생성됩니다.

---

## Usage

1. **이미지 업로드** — 드래그 앤 드롭 또는 클릭하여 파일 선택 (PNG, JPG, WEBP 등)
2. **모드 선택** — 상단 탭에서 `Pixel Art` 또는 `Dot Art` 선택
3. **설정 조정** — 우측 패널에서 크기, 팔레트, 디더링 등 조절
4. **실시간 미리보기** — 설정 변경 시 300ms 디바운스 후 자동 업데이트
5. **내보내기** — 상단 `Export` 버튼으로 PNG 또는 SVG 다운로드

---

## Project Structure

```
pixel-dot-converter/
├── electron/
│   └── main.cjs                    # Electron 메인 프로세스
├── public/
│   ├── icon.png                    # 앱 아이콘
│   └── icon.svg
├── scripts/
│   └── zip-release.mjs             # 릴리즈 패키징 스크립트
├── src/
│   ├── App.tsx                     # 루트 컴포넌트 (전역 상태 관리)
│   ├── main.tsx                    # React 진입점
│   ├── index.css                   # Tailwind CSS 글로벌 스타일
│   │
│   ├── components/
│   │   ├── Header.tsx              # 헤더, 모드 탭, 다크모드 토글, 내보내기
│   │   ├── ImageUploader.tsx       # 드래그앤드롭 업로드 UI
│   │   ├── SettingsPanel.tsx       # 픽셀/도트 설정 사이드바
│   │   ├── CanvasView.tsx          # 원본+결과 나란히, 줌/패닝 (forwardRef)
│   │   ├── PaletteDisplay.tsx      # 추출된 색상 스와치, hex 복사
│   │   └── HistoryPanel.tsx        # 세션 변환 이력 (최대 5개)
│   │
│   ├── hooks/
│   │   ├── useImageProcessor.ts    # Web Worker 통신, 변환 요청/응답 관리
│   │   ├── useCanvasInteraction.ts # 캔버스 줌/패닝 인터랙션
│   │   └── useDebouncedValue.ts    # 설정 변경 디바운스 (300ms)
│   │
│   ├── utils/
│   │   ├── pixelArt.ts             # 픽셀 아트 Canvas 렌더링
│   │   ├── dotArt.ts               # 도트 아트 Canvas 렌더링 + SVG 생성
│   │   ├── colorQuantization.ts    # Median Cut 색상 양자화 알고리즘
│   │   ├── dithering.ts            # Floyd-Steinberg / Ordered / Atkinson
│   │   ├── palettes.ts             # Game Boy, NES, SNES, Monochrome 프리셋
│   │   └── export.ts               # PNG / SVG 파일 내보내기 유틸리티
│   │
│   ├── workers/
│   │   └── imageProcessor.worker.ts  # 색상 양자화 + 디더링 Web Worker
│   │
│   └── types/
│       └── index.ts                # 전체 TypeScript 타입 정의
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3 |
| Rendering | HTML5 Canvas API |
| Performance | Web Workers (Transferable ImageData) |
| Desktop | Electron 41 + electron-builder |
| Linting | ESLint 9 + Prettier |

외부 이미지 처리 라이브러리를 일절 사용하지 않습니다. Canvas API와 Web Worker만으로 구현되었습니다.

---

## Algorithms

- **Color Quantization**: Median Cut — 이미지 색상 공간을 재귀적으로 분할하여 지정 수의 대표 색상 추출
- **Dithering**:
  - **Floyd-Steinberg** — 인접 픽셀로 오차 확산, 자연스러운 그라데이션
  - **Ordered (Bayer 4x4)** — 규칙적 임계값 패턴, 레트로 느낌
  - **Atkinson** — Floyd-Steinberg 변형, 밝은 영역 보존에 유리

---

## Contributing

PR과 Issue 모두 환영합니다.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
