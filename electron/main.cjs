// ============================================================
// Electron 메인 프로세스
// 앱 윈도우 생성 및 라이프사이클 관리
// ============================================================

const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

// 개발 모드 여부 (NODE_ENV=development 이면 Vite dev 서버 사용)
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: '픽셀 도트 변환기',
    // 준비되기 전까지 창 숨김 (흰 화면 깜빡임 방지)
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      // 보안: nodeIntegration 비활성화, contextIsolation 활성화
      nodeIntegration: false,
      contextIsolation: true,
      // Web Worker 지원 활성화
      webSecurity: true,
    },
  });

  // 메뉴바 간소화 (파일/편집/보기 수준)
  const menuTemplate = [
    {
      label: '파일',
      submenu: [
        { role: 'quit', label: '종료' },
      ],
    },
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
      ],
    },
    {
      label: '보기',
      submenu: [
        { role: 'reload', label: '새로고침' },
        { type: 'separator' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { role: 'resetZoom', label: '원래 크기' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체화면' },
        ...(isDev ? [{ role: 'toggleDevTools', label: '개발자 도구' }] : []),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    // 개발 모드: Vite dev 서버에 연결
    win.loadURL('http://localhost:5173');
  } else {
    // 프로덕션 모드: 빌드된 index.html 로드
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 준비 완료 후 창 표시 (깔끔한 시작)
  win.once('ready-to-show', () => {
    win.show();
  });

  // 외부 링크는 기본 브라우저로 열기
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 앱 준비 완료 시 창 생성
app.whenReady().then(() => {
  createWindow();

  // macOS: 독(Dock)에서 앱 아이콘 클릭 시 창 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 모든 창 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
