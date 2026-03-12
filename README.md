Here is the full README content in **English only**, formatted exactly for you to copy and paste into your GitHub editor.

```markdown
# Pixel Dot Converter 🎨

A client-side web application that converts images to pixel art or dot art. All processing happens entirely in your browser—no images are ever sent to a server.

---

## 📥 Download Executable (Desktop App)
**Download and use the compiled executable (.exe / .dmg) immediately:**
> **[👉 Download Latest Version (Google Drive)](https://drive.google.com/file/d/1hKiGm_Ox-ruUp-9x1m57LGV68eKAssYj/view?usp=sharing)**

---

## Features

### Pixel Art Mode
- **Pixel Size Control**: Adjust resolution from 4px to 64px.
- **Color Palette Limiting**: Select 8, 16, 32, 64 colors, or a custom count.
- **Grid Overlay**: Toggle grids with customizable colors.
- **Image Adjustments**: Fine-tune brightness and contrast.
- **Dithering**: Supports Floyd-Steinberg, Ordered (Bayer 4x4), and Atkinson algorithms.

### Dot Art Mode
- **Dot Configuration**: Adjust size (2-32px) and spacing (0-16px).
- **Dot Shapes**: Choose between Circle, Square, and Diamond.
- **Background Customization**: Select any background color.
- **Brightness Size Variation**: Dynamically resize dots based on image luminosity.
- **Dithering**: Supports Floyd-Steinberg, Ordered (Bayer 4x4), and Atkinson.

### General Capabilities
- **Preset Palettes**: Includes Game Boy, NES, SNES, and Monochrome.
- **High-Quality Export**: Export as PNG (1x, 2x, 4x scaling) or SVG (Vector).
- **Interactive Canvas**: Side-by-side view with synchronized zooming and panning.
- **UI/UX**: Dark mode support and a session history of the last 5 conversions.
- **Performance**: Powered by Web Workers for non-blocking asynchronous processing.
- **Upload**: Easy drag-and-drop support.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
```bash
git clone [https://github.com/](https://github.com/)<your-username>/pixel-dot-converter.git
cd pixel-dot-converter
npm install

```

### Development (Web)

```bash
npm run dev

```

Open `http://localhost:5173` in your browser.

### Build (Web)

```bash
npm run build
npm run preview   # Verify build results locally

```

---

## Desktop App (Electron)

Build for Windows, macOS, or Linux using Electron.

```bash
# Dev mode (Electron + Vite HMR)
npm run electron:dev

# Platform-specific builds
npm run electron:build:win    # Windows x64
npm run electron:build:mac    # macOS dmg
npm run electron:build:linux  # Linux AppImage

```

---

## Project Structure

```
pixel-dot-converter/
├── electron/               # Electron main process
├── public/                 # Static assets (icons, etc.)
├── src/
│   ├── components/         # UI Components (Header, Canvas, Panels)
│   ├── hooks/              # Custom Hooks (Processor, Interaction)
│   ├── utils/              # Algorithms (Pixel/Dot, Quantization)
│   ├── workers/            # Image processing Web Worker
│   └── types/              # TypeScript definitions
└── package.json

```

---

## Tech Stack

| Category | Library / Tool |
| --- | --- |
| **Framework** | React 19 + TypeScript 5 |
| **Build** | Vite 7 |
| **Styling** | Tailwind CSS 3 |
| **Rendering** | HTML5 Canvas API |
| **Performance** | Web Workers (Transferable ImageData) |
| **Desktop** | Electron 41 + electron-builder |

*Note: This project does not use external image processing libraries. Everything is implemented using native Canvas API and Web Workers.*

---

## Algorithms

* **Color Quantization**: **Median Cut** — Recursively splits the color space to extract representative colors.
* **Dithering**:
* **Floyd-Steinberg**: Error diffusion for natural gradients.
* **Ordered (Bayer 4x4)**: Regular threshold patterns for a retro aesthetic.
* **Atkinson**: Preserves bright areas and highlights effectively.



---

## License

MIT License — see [LICENSE](https://www.google.com/search?q=./LICENSE) for details.

```

Would you like me to help you draft the `LICENSE` file or a `CONTRIBUTING.md` guide next?

```
