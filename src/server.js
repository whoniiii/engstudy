const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const CERTS_DIR = path.join(__dirname, '..', 'certs');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'words.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ─── Default Data ───────────────────────────────────────────────
const DEFAULT_DATA = {
  words: [
    { id: 'w001', english: 'cat', korean: '고양이', emoji: '🐱', category: 'animals' },
    { id: 'w002', english: 'dog', korean: '강아지', emoji: '🐶', category: 'animals' },
    { id: 'w003', english: 'bird', korean: '새', emoji: '🐦', category: 'animals' },
    { id: 'w004', english: 'fish', korean: '물고기', emoji: '🐟', category: 'animals' },
    { id: 'w005', english: 'rabbit', korean: '토끼', emoji: '🐰', category: 'animals' },
    { id: 'w006', english: 'bear', korean: '곰', emoji: '🐻', category: 'animals' },
    { id: 'w007', english: 'lion', korean: '사자', emoji: '🦁', category: 'animals' },
    { id: 'w008', english: 'elephant', korean: '코끼리', emoji: '🐘', category: 'animals' },
    { id: 'w009', english: 'monkey', korean: '원숭이', emoji: '🐵', category: 'animals' },
    { id: 'w010', english: 'pig', korean: '돼지', emoji: '🐷', category: 'animals' },
    { id: 'w011', english: 'apple', korean: '사과', emoji: '🍎', category: 'fruits' },
    { id: 'w012', english: 'banana', korean: '바나나', emoji: '🍌', category: 'fruits' },
    { id: 'w013', english: 'grape', korean: '포도', emoji: '🍇', category: 'fruits' },
    { id: 'w014', english: 'orange', korean: '오렌지', emoji: '🍊', category: 'fruits' },
    { id: 'w015', english: 'strawberry', korean: '딸기', emoji: '🍓', category: 'fruits' },
    { id: 'w016', english: 'watermelon', korean: '수박', emoji: '🍉', category: 'fruits' },
    { id: 'w017', english: 'peach', korean: '복숭아', emoji: '🍑', category: 'fruits' },
    { id: 'w018', english: 'lemon', korean: '레몬', emoji: '🍋', category: 'fruits' },
    { id: 'w019', english: 'red', korean: '빨간색', emoji: '🔴', category: 'colors' },
    { id: 'w020', english: 'blue', korean: '파란색', emoji: '🔵', category: 'colors' },
    { id: 'w021', english: 'yellow', korean: '노란색', emoji: '🟡', category: 'colors' },
    { id: 'w022', english: 'green', korean: '초록색', emoji: '🟢', category: 'colors' },
    { id: 'w023', english: 'white', korean: '하얀색', emoji: '⚪', category: 'colors' },
    { id: 'w024', english: 'black', korean: '검정색', emoji: '⚫', category: 'colors' },
    { id: 'w025', english: 'pink', korean: '분홍색', emoji: '🩷', category: 'colors' },
    { id: 'w026', english: 'purple', korean: '보라색', emoji: '🟣', category: 'colors' },
    { id: 'w027', english: 'one', korean: '하나', emoji: '1️⃣', category: 'numbers' },
    { id: 'w028', english: 'two', korean: '둘', emoji: '2️⃣', category: 'numbers' },
    { id: 'w029', english: 'three', korean: '셋', emoji: '3️⃣', category: 'numbers' },
    { id: 'w030', english: 'four', korean: '넷', emoji: '4️⃣', category: 'numbers' },
    { id: 'w031', english: 'five', korean: '다섯', emoji: '5️⃣', category: 'numbers' },
    { id: 'w032', english: 'six', korean: '여섯', emoji: '6️⃣', category: 'numbers' },
    { id: 'w033', english: 'seven', korean: '일곱', emoji: '7️⃣', category: 'numbers' },
    { id: 'w034', english: 'eight', korean: '여덟', emoji: '8️⃣', category: 'numbers' },
    { id: 'w035', english: 'head', korean: '머리', emoji: '👤', category: 'body' },
    { id: 'w036', english: 'hand', korean: '손', emoji: '✋', category: 'body' },
    { id: 'w037', english: 'foot', korean: '발', emoji: '🦶', category: 'body' },
    { id: 'w038', english: 'eye', korean: '눈', emoji: '👁️', category: 'body' },
    { id: 'w039', english: 'nose', korean: '코', emoji: '👃', category: 'body' },
    { id: 'w040', english: 'mouth', korean: '입', emoji: '👄', category: 'body' },
    { id: 'w041', english: 'ear', korean: '귀', emoji: '👂', category: 'body' },
    { id: 'w042', english: 'arm', korean: '팔', emoji: '💪', category: 'body' },
    { id: 'w043', english: 'milk', korean: '우유', emoji: '🥛', category: 'food' },
    { id: 'w044', english: 'bread', korean: '빵', emoji: '🍞', category: 'food' },
    { id: 'w045', english: 'rice', korean: '밥', emoji: '🍚', category: 'food' },
    { id: 'w046', english: 'egg', korean: '달걀', emoji: '🥚', category: 'food' },
    { id: 'w047', english: 'water', korean: '물', emoji: '💧', category: 'food' },
    { id: 'w048', english: 'cake', korean: '케이크', emoji: '🎂', category: 'food' },
    { id: 'w049', english: 'pizza', korean: '피자', emoji: '🍕', category: 'food' },
    { id: 'w050', english: 'chicken', korean: '치킨', emoji: '🍗', category: 'food' },
  ],
  categories: [
    { id: 'animals', name: '동물', emoji: '🐾' },
    { id: 'fruits', name: '과일', emoji: '🍎' },
    { id: 'colors', name: '색깔', emoji: '🎨' },
    { id: 'numbers', name: '숫자', emoji: '🔢' },
    { id: 'body', name: '신체', emoji: '🦶' },
    { id: 'food', name: '음식', emoji: '🍔' },
  ],
  stats: {
    totalGames: 0,
    totalStars: 0,
    wordStats: {},
  },
  settings: {
    adminPin: '1234',
  },
};

// ─── MIME Types ──────────────────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ─── Data Helpers ───────────────────────────────────────────────
async function ensureDataFile() {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.promises.access(DATA_FILE);
      // Validate existing file is parseable JSON
      const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
      JSON.parse(raw);
    } catch {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      console.log('📁 Created default words.json');
    }
  } catch (err) {
    console.error('Failed to initialize data file:', err);
    throw err;
  }
}

async function readData() {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ Corrupted data file, resetting to defaults:', err.message);
    const data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
}

// Write lock to prevent concurrent write race conditions
let writeLock = Promise.resolve();

async function writeData(data) {
  writeLock = writeLock.then(async () => {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }).catch((err) => {
    console.error('Write error:', err.message);
    throw err;
  });
  return writeLock;
}

// ─── Request Helpers ────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, { error: message });
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Route Matching ─────────────────────────────────────────────
function matchRoute(pathname, pattern) {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

// ─── API Handlers ───────────────────────────────────────────────
async function handleAPI(req, res, pathname, url) {
  const method = req.method;

  // OPTIONS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // Helper: safely parse body with 400 on invalid JSON
  async function safeParseBody() {
    try {
      return await parseBody(req);
    } catch (err) {
      sendError(res, 400, 'Invalid JSON body');
      return null;
    }
  }

  try {
    // GET /api/words
    if (method === 'GET' && pathname === '/api/words') {
      const data = await readData();
      const category = url.searchParams.get('category');
      let words = data.words;
      if (category) {
        words = words.filter((w) => w.category === category);
      }
      sendJSON(res, 200, { words, categories: data.categories });
      return;
    }

    // GET /api/categories
    if (method === 'GET' && pathname === '/api/categories') {
      const data = await readData();
      sendJSON(res, 200, { categories: data.categories });
      return;
    }

    // POST /api/categories
    if (method === 'POST' && pathname === '/api/categories') {
      const body = await safeParseBody();
      if (body === null) return;
      const { id, name, emoji } = body;
      if (!id || !name) {
        sendError(res, 400, 'id and name are required');
        return;
      }
      const data = await readData();
      const exists = data.categories.find((c) => c.id === id);
      if (exists) {
        sendError(res, 409, 'Category already exists');
        return;
      }
      const newCategory = { id, name, emoji: emoji || '📁' };
      data.categories.push(newCategory);
      await writeData(data);
      sendJSON(res, 201, newCategory);
      return;
    }

    // PUT /api/categories/:id
    const catPutParams = matchRoute(pathname, '/api/categories/:id');
    if (method === 'PUT' && catPutParams) {
      const body = await safeParseBody();
      if (body === null) return;
      const data = await readData();
      const idx = data.categories.findIndex((c) => c.id === catPutParams.id);
      if (idx === -1) {
        sendError(res, 404, 'Category not found');
        return;
      }
      if (body.name !== undefined) data.categories[idx].name = body.name;
      if (body.emoji !== undefined) data.categories[idx].emoji = body.emoji;
      await writeData(data);
      sendJSON(res, 200, data.categories[idx]);
      return;
    }

    // DELETE /api/categories/:id
    const catDelParams = matchRoute(pathname, '/api/categories/:id');
    if (method === 'DELETE' && catDelParams) {
      const data = await readData();
      const idx = data.categories.findIndex((c) => c.id === catDelParams.id);
      if (idx === -1) {
        sendError(res, 404, 'Category not found');
        return;
      }
      const hasWords = data.words.some((w) => w.category === catDelParams.id);
      if (hasWords) {
        sendError(res, 400, '이 카테고리에 단어가 있어서 삭제할 수 없습니다');
        return;
      }
      data.categories.splice(idx, 1);
      await writeData(data);
      sendJSON(res, 200, { success: true });
      return;
    }

    // GET /api/quiz
    if (method === 'GET' && pathname === '/api/quiz') {
      const data = await readData();
      const category = url.searchParams.get('category');
      const count = parseInt(url.searchParams.get('count') || '10', 10);
      let pool = data.words;
      if (category) {
        pool = pool.filter((w) => w.category === category);
      }
      const shuffled = shuffleArray(pool);
      const questions = shuffled.slice(0, Math.min(count, shuffled.length));
      sendJSON(res, 200, { questions });
      return;
    }

    // GET /api/stats
    if (method === 'GET' && pathname === '/api/stats') {
      const data = await readData();
      const stats = data.stats || { totalGames: 0, totalStars: 0, wordStats: {} };
      sendJSON(res, 200, {
        totalGames: stats.totalGames || 0,
        totalCorrect: stats.totalCorrect || 0,
        totalStars: stats.totalStars || 0,
        wordStats: stats.wordStats || {},
      });
      return;
    }

    // POST /api/stats
    if (method === 'POST' && pathname === '/api/stats') {
      const body = await safeParseBody();
      if (body === null) return;
      const { wordId, stars, attempts } = body;

      if (!wordId || stars == null || attempts == null) {
        sendError(res, 400, 'wordId, stars, and attempts are required');
        return;
      }

      const data = await readData();
      if (!data.stats) {
        data.stats = { totalGames: 0, totalCorrect: 0, totalStars: 0, wordStats: {} };
      }
      if (!data.stats.wordStats) data.stats.wordStats = {};

      data.stats.totalGames = (data.stats.totalGames || 0) + 1;
      data.stats.totalStars = (data.stats.totalStars || 0) + stars;
      data.stats.totalCorrect = (data.stats.totalCorrect || 0) + 1;

      const ws = data.stats.wordStats[wordId] || { attempts: 0, totalStars: 0, bestStars: 0 };
      ws.attempts += attempts;
      ws.totalStars += stars;
      ws.bestStars = Math.max(ws.bestStars, stars);
      data.stats.wordStats[wordId] = ws;

      await writeData(data);
      sendJSON(res, 200, { success: true });
      return;
    }

    // POST /api/admin/verify
    if (method === 'POST' && pathname === '/api/admin/verify') {
      const body = await safeParseBody();
      if (body === null) return;
      const data = await readData();
      const correctPin = (data.settings && data.settings.adminPin) || '1234';
      const success = body.pin === correctPin;
      sendJSON(res, 200, { success });
      return;
    }

    // GET /api/words/:id
    const wordGetParams = matchRoute(pathname, '/api/words/:id');
    if (method === 'GET' && wordGetParams) {
      const data = await readData();
      const word = data.words.find((w) => w.id === wordGetParams.id);
      if (!word) {
        sendError(res, 404, 'Word not found');
        return;
      }
      sendJSON(res, 200, word);
      return;
    }

    // POST /api/words
    if (method === 'POST' && pathname === '/api/words') {
      const body = await safeParseBody();
      if (body === null) return;
      const { english, korean, emoji, category } = body;
      if (!english || !korean || !emoji || !category) {
        sendError(res, 400, 'english, korean, emoji, and category are required');
        return;
      }
      const data = await readData();
      const newWord = {
        id: `w${Date.now()}`,
        english,
        korean,
        emoji,
        category,
      };
      data.words.push(newWord);
      await writeData(data);
      sendJSON(res, 201, newWord);
      return;
    }

    // PUT /api/words/:id
    const wordPutParams = matchRoute(pathname, '/api/words/:id');
    if (method === 'PUT' && wordPutParams) {
      const body = await safeParseBody();
      if (body === null) return;
      const data = await readData();
      const idx = data.words.findIndex((w) => w.id === wordPutParams.id);
      if (idx === -1) {
        sendError(res, 404, 'Word not found');
        return;
      }
      const allowedFields = ['english', 'korean', 'emoji', 'category'];
      for (const key of allowedFields) {
        if (body[key] !== undefined) {
          data.words[idx][key] = body[key];
        }
      }
      await writeData(data);
      sendJSON(res, 200, data.words[idx]);
      return;
    }

    // DELETE /api/words/:id
    const wordDelParams = matchRoute(pathname, '/api/words/:id');
    if (method === 'DELETE' && wordDelParams) {
      const data = await readData();
      const idx = data.words.findIndex((w) => w.id === wordDelParams.id);
      if (idx === -1) {
        sendError(res, 404, 'Word not found');
        return;
      }
      data.words.splice(idx, 1);
      await writeData(data);
      sendJSON(res, 200, { success: true });
      return;
    }

    // No matching API route
    sendError(res, 404, 'API endpoint not found');
  } catch (err) {
    console.error('API Error:', err.message);
    sendError(res, 500, 'Internal server error');
  }
}

// ─── Static File Serving ────────────────────────────────────────
async function serveStatic(req, res, pathname) {
  // Map routes to files
  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  } else if (pathname === '/admin') {
    pathname = '/admin.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      sendError(res, 404, 'Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await fs.promises.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    sendError(res, 404, 'Not found');
  }
}

// ─── Request Handler ────────────────────────────────────────────
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    await handleAPI(req, res, pathname, url);
  } else {
    await serveStatic(req, res, pathname);
  }
}

// ─── Server Setup ───────────────────────────────────────────────
function requestListener(req, res) {
  handleRequest(req, res).catch((err) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
      sendError(res, 500, 'Internal server error');
    }
  });
}

const server = http.createServer(requestListener);
let httpsServer = null;

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(interfaces)) {
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        ips.push(info.address);
      }
    }
  }
  return ips;
}

async function ensureCerts() {
  try {
    const keyPath = path.join(CERTS_DIR, 'key.pem');
    const certPath = path.join(CERTS_DIR, 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    // 인증서가 없으면 selfsigned로 자동 생성
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'engstudy' }];
    const pems = await selfsigned.generate(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: 'sha256',
    });

    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
    console.log('🔐 자체 서명 인증서 자동 생성 완료 (certs/)');

    return { key: pems.private, cert: pems.cert };
  } catch (err) {
    console.log('⚠️ 인증서 생성/로드 실패:', err.message);
    return null;
  }
}

async function start() {
  await ensureDataFile();

  // HTTP 서버 (기존 — localhost 용)
  server.listen(PORT, () => {
    console.log(`🎮 EngStudy HTTP  → http://localhost:${PORT}`);
  });

  // HTTPS 서버 (아이패드 등 외부 기기 접속용)
  try {
    const certs = await ensureCerts();
    if (certs) {
      httpsServer = https.createServer(certs, requestListener);
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🔒 EngStudy HTTPS → https://localhost:${HTTPS_PORT}`);
        const ips = getLocalIPs();
        ips.forEach((ip) => {
          console.log(`📱 아이패드 접속 → https://${ip}:${HTTPS_PORT}`);
        });
      });
    }
  } catch (err) {
    console.log('⚠️ HTTPS 서버 시작 실패 (HTTP만 사용):', err.message);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    if (httpsServer) {
      httpsServer.close(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

// Export for testing
const _exports = { server, start, readData, writeData, ensureDataFile, DEFAULT_DATA };
Object.defineProperty(_exports, 'httpsServer', {
  get() { return httpsServer; },
  enumerable: true,
});
module.exports = _exports;

// Start server if run directly
if (require.main === module) {
  start();
}
