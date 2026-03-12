---

# README.md (English Default + Korean Toggle)

````markdown
# Pixel Dot Converter

A client-side web application that converts images into **pixel art** or **dot art**.

[한국어로 보기 🇰🇷](#-pixel-dot-converter-한국어)

---

## 📥 Download Executable (Desktop App)

Download the compiled executable directly:

👉 **[Download Latest Release (Google Drive)](https://drive.google.com/file/d/1hKiGm_Ox-ruUp-9x1m57LGV68eKAssYj/view?usp=sharing)**

> No image is sent to any external server.  
> All processing happens entirely in your browser.

---

# Features

## Pixel Art Mode

- Adjustable pixel size (4 ~ 64px)
- Color palette limitation (8 / 16 / 32 / 64 colors or custom)
- Grid overlay (custom color)
- Brightness / contrast adjustment
- Dithering algorithms
  - Floyd–Steinberg
  - Ordered (Bayer 4×4)
  - Atkinson

## Dot Art Mode

- Dot size (2 ~ 32px) and spacing (0 ~ 16px)
- Dot shapes
  - Circle
  - Square
  - Diamond
- Background color selection
- Brightness-based dot size variation
- Dithering
  - Floyd–Steinberg
  - Ordered (Bayer 4×4)
  - Atkinson

## Shared Features

- Preset palettes
  - Game Boy
  - NES
  - SNES
  - Monochrome
- PNG export (1x / 2x / 4x scale)
- SVG export (vector — infinitely scalable)
- Side-by-side original / result preview
- Zoom & panning
- Dark mode
- Conversion history (last 5)
- Web Worker asynchronous processing (no UI blocking)
- Drag & drop image upload

---

# Getting Started

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Installation

```bash
git clone https://github.com/<your-username>/pixel-dot-converter.git
cd pixel-dot-converter
npm install
````

---

## Development (Web)

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## Build (Web)

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to any static hosting:

* GitHub Pages
* Vercel
* Netlify

---

# Desktop App (Electron)

You can also build it as a desktop application.

```bash
npm run electron:dev
```

Build for platforms:

```bash
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

Output files are generated in:

```
dist-electron/
```

---

# Usage

1. Upload an image (drag & drop or click)
2. Choose mode (`Pixel Art` or `Dot Art`)
3. Adjust settings
4. Preview updates automatically
5. Export as PNG or SVG

---

# Project Structure

```
pixel-dot-converter/
├── electron/
│   └── main.cjs
├── public/
│   ├── icon.png
│   └── icon.svg
├── scripts/
│   └── zip-release.mjs
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── workers/
│   └── types/
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

# Tech Stack

| Category    | Tool                  |
| ----------- | --------------------- |
| Framework   | React 19 + TypeScript |
| Build       | Vite                  |
| Styling     | Tailwind CSS          |
| Rendering   | Canvas API            |
| Performance | Web Workers           |
| Desktop     | Electron              |
| Linting     | ESLint + Prettier     |

No external image processing libraries are used.

Everything is implemented using **Canvas API + Web Workers**.

---

# Algorithms

## Color Quantization

Median Cut

Splits color space recursively to extract representative colors.

## Dithering

### Floyd–Steinberg

Error diffusion to neighboring pixels.

### Ordered (Bayer 4×4)

Regular threshold pattern.

### Atkinson

Variant of Floyd–Steinberg optimized for brighter regions.

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch

```
git checkout -b feature/amazing-feature
```

3. Commit

```
git commit -m "Add amazing feature"
```

4. Push

```
git push origin feature/amazing-feature
```

5. Open Pull Request

---

# License

MIT License

See `LICENSE` for details.

---

---

# 🇰🇷 Pixel Dot Converter (한국어)

이미지를 **픽셀 아트 또는 도트 아트로 변환하는 클라이언트 사이드 웹 애플리케이션**입니다.

---

## 📥 실행 파일 다운로드

👉 **[최신 버전 다운로드](https://drive.google.com/file/d/1hKiGm_Ox-ruUp-9x1m57LGV68eKAssYj/view?usp=sharing)**

> 이미지가 외부 서버로 전송되지 않습니다.
> 모든 처리는 브라우저에서 이루어집니다.

---

## 주요 기능

### Pixel Art Mode

* 픽셀 크기 조절 (4 ~ 64px)
* 색상 팔레트 제한
* 그리드 오버레이
* 밝기 / 대비 조절
* 디더링

### Dot Art Mode

* 도트 크기 / 간격 조절
* 도트 모양 선택
* 배경색 선택
* 밝기에 따른 도트 크기 변형

---

## 공통 기능

* Game Boy / NES / SNES 팔레트
* PNG / SVG 내보내기
* 원본 / 결과 비교
* 줌 & 패닝
* 다크모드
* 변환 이력
* Web Worker 비동기 처리
* 드래그 앤 드롭 업로드

---

## 설치

```bash
git clone https://github.com/<your-username>/pixel-dot-converter.git
cd pixel-dot-converter
npm install
```

---

## 개발 실행

```bash
npm run dev
```

브라우저에서

```
http://localhost:5173
```

열면 됩니다.

---

## 라이선스

MIT License

```

---

## 👍 이 README 구조의 장점

GitHub에서

- **기본 English**
- **한국어 바로 이동 링크**
- **README 하나로 관리 가능**
- **오픈소스 표준 스타일**

---

