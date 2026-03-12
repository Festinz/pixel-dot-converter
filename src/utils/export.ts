// ============================================================
// PNG / SVG 내보내기 유틸리티
// ============================================================

/**
 * 캔버스를 PNG로 다운로드
 * @param canvas 내보낼 캔버스
 * @param filename 파일명
 * @param scale 배율 (1, 2, 4)
 */
export function exportToPNG(
  canvas: HTMLCanvasElement,
  filename: string,
  scale: 1 | 2 | 4 = 1,
): void {
  if (scale === 1) {
    // 배율 1이면 바로 다운로드
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${filename}.png`);
    }, 'image/png');
    return;
  }

  // 배율 적용: 새 캔버스에 확대 렌더링
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;
  const ctx = scaledCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

  scaledCanvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, `${filename}.png`);
  }, 'image/png');
}

/**
 * SVG 문자열을 파일로 다운로드
 */
export function exportToSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}.svg`);
}

/**
 * Blob을 파일로 다운로드하는 헬퍼
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 내보내기용 파일명 자동 생성
 * 예: originalName_pixel_16px
 */
export function generateFilename(
  originalName: string,
  mode: 'pixel' | 'dot',
  sizeParam: number,
): string {
  // 확장자 제거
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  // 특수문자 제거 및 공백을 언더스코어로
  const sanitized = baseName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
  const modeLabel = mode === 'pixel' ? 'pixel' : 'dot';
  return `${sanitized}_${modeLabel}_${sizeParam}px`;
}
