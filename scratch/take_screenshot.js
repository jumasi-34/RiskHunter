const { chromium } = require('playwright-chromium');
const path = require('path');
const http = require('http');
const fs = require('fs');

// 로컬 정적 웹 서버 띄우기
const rootDir = path.resolve(__dirname, '..');
const PORT = 8099;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }
  
  const filePath = path.join(rootDir, reqPath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, async () => {
  console.log(`Temporary server running at http://localhost:${PORT}/`);
  
  try {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // 콘솔 에러 모니터링
    page.on('pageerror', exception => {
      console.log(`[PAGE ERROR] ${exception.toString()}`);
    });
    page.on('console', message => {
      if (message.type() === 'error') {
        console.log(`[CONSOLE ERROR] ${message.text()}`);
      }
    });

    console.log(`Navigating to http://localhost:${PORT}/index.html...`);
    await page.goto(`http://localhost:${PORT}/index.html`);
    
    // 데이터 비동기 로딩 및 렌더링 완료 대기 (3초)
    console.log('Waiting for data loading...');
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영 - 데스크탑 뷰
    console.log('Taking desktop screenshot...');
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.screenshot({ path: path.resolve(__dirname, '../image/dashboard_desktop.png'), fullPage: false });
    
    // 모바일 뷰포트 스크린샷 촬영 (반응형 검증)
    console.log('Taking mobile screenshot...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: path.resolve(__dirname, '../image/dashboard_mobile.png'), fullPage: false });

    await browser.close();
    console.log('Screenshots saved successfully in image/ directory.');
  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    server.close(() => {
      console.log('Temporary server stopped.');
    });
  }
});
