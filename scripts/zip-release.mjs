// ============================================================
// 빌드 결과물(win-unpacked)을 ZIP으로 압축하는 스크립트
// WSL2/Linux 환경에서 Windows exe 배포용 패키지 생성
// ============================================================

import { createWriteStream, existsSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const SRC_DIR = './dist-electron/win-unpacked';
const OUT_FILE = './dist-electron/픽셀-도트-변환기-win-x64.zip';

// Node 내장 모듈만 사용해 ZIP 생성 (외부 의존성 없음)
// 실제 ZIP 포맷 구현 대신 tar.gz 사용 (Windows에서 Explorer/7-Zip으로 열기 가능)

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error('❌ win-unpacked 폴더를 찾을 수 없습니다. 먼저 빌드를 실행하세요.');
    process.exit(1);
  }

  // zip 커맨드가 있으면 사용, 없으면 tar.gz 사용
  const { execSync } = await import('child_process');

  const zipOut = './dist-electron/픽셀-도트-변환기-win-x64.zip';
  const tarOut = './dist-electron/픽셀-도트-변환기-win-x64.tar.gz';

  try {
    // zip 명령어 시도
    execSync(`cd dist-electron && zip -r "픽셀-도트-변환기-win-x64.zip" win-unpacked`, {
      stdio: 'pipe',
    });
    console.log(`\n✅ ZIP 패키지 생성 완료: ${zipOut}`);
    console.log('   Windows에서 zip을 풀고 "픽셀 도트 변환기.exe"를 실행하세요.\n');
  } catch {
    try {
      // zip 없으면 tar.gz 사용
      execSync(`tar -czf "dist-electron/픽셀-도트-변환기-win-x64.tar.gz" -C dist-electron win-unpacked`, {
        stdio: 'pipe',
      });
      console.log(`\n✅ TAR.GZ 패키지 생성 완료: ${tarOut}`);
      console.log('   Windows에서 7-Zip 등으로 압축을 풀고 "픽셀 도트 변환기.exe"를 실행하세요.\n');
    } catch {
      // 압축 실패해도 exe는 사용 가능
      console.log(`\n✅ 빌드 완료! 아래 폴더에서 exe를 사용하세요:`);
      console.log(`   ${SRC_DIR}/픽셀 도트 변환기.exe\n`);
    }
  }

  // 파일 크기 출력
  try {
    const { execSync: exec } = await import('child_process');
    const size = exec(`du -sh "${SRC_DIR}"`, { encoding: 'utf8' }).split('\t')[0];
    console.log(`   폴더 크기: ${size}`);
  } catch {}
}

main().catch(console.error);
