const http = require('node:http');
const { server, writeData, ensureDataFile, DEFAULT_DATA } = require('../src/server');

// ─── Helpers ────────────────────────────────────────────────────
let BASE_URL;

/** Deep-clone DEFAULT_DATA so mutations never leak between tests */
function freshData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

/** HTTP request helper using node:http (no external deps) */
function request(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body !== null) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Lifecycle ──────────────────────────────────────────────────
beforeAll(async () => {
  await ensureDataFile();
  await writeData(freshData());

  // Port 0 → OS assigns a free port (no collisions)
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  // Reset to pristine DEFAULT_DATA before every test
  await writeData(freshData());
});

// ═══════════════════════════════════════════════════════════════
// 1. GET /api/words
// ═══════════════════════════════════════════════════════════════
describe('GET /api/words', () => {
  it('should return all 50 words', async () => {
    const res = await request('GET', '/api/words');

    expect(res.status).toBe(200);
    expect(res.body.words).toHaveLength(50);

    // Verify word structure
    const first = res.body.words[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('english');
    expect(first).toHaveProperty('korean');
    expect(first).toHaveProperty('emoji');
    expect(first).toHaveProperty('category');
  });

  it('should filter by category (animals = 10)', async () => {
    const res = await request('GET', '/api/words?category=animals');

    expect(res.status).toBe(200);
    expect(res.body.words).toHaveLength(10);
    expect(res.body.words.every((w) => w.category === 'animals')).toBe(true);
  });

  it('should always return the full categories array alongside words', async () => {
    const res = await request('GET', '/api/words?category=fruits');

    expect(res.status).toBe(200);
    expect(res.body.words).toHaveLength(8);
    // categories are unfiltered — always the full set
    expect(res.body.categories).toHaveLength(6);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. GET /api/words/:id
// ═══════════════════════════════════════════════════════════════
describe('GET /api/words/:id', () => {
  it('should return a single word by id', async () => {
    const res = await request('GET', '/api/words/w001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'w001',
      english: 'cat',
      korean: '고양이',
      emoji: '🐱',
      category: 'animals',
    });
  });

  it('should return 404 for a non-existent id', async () => {
    const res = await request('GET', '/api/words/w999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Word not found' });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. POST /api/words
// ═══════════════════════════════════════════════════════════════
describe('POST /api/words', () => {
  it('should add a new word and return 201', async () => {
    const newWord = {
      english: 'tiger',
      korean: '호랑이',
      emoji: '🐯',
      category: 'animals',
    };
    const res = await request('POST', '/api/words', newWord);

    expect(res.status).toBe(201);
    expect(res.body.english).toBe('tiger');
    expect(res.body.korean).toBe('호랑이');
    expect(res.body.emoji).toBe('🐯');
    expect(res.body.category).toBe('animals');
    expect(res.body.id).toBeDefined();
    expect(res.body.id).toMatch(/^w\d+$/);

    // Verify persistence
    const listRes = await request('GET', '/api/words');
    expect(listRes.body.words).toHaveLength(51);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request('POST', '/api/words', { english: 'tiger' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'english, korean, emoji, and category are required',
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. PUT /api/words/:id
// ═══════════════════════════════════════════════════════════════
describe('PUT /api/words/:id', () => {
  it('should update an existing word (partial update)', async () => {
    const res = await request('PUT', '/api/words/w001', {
      english: 'kitty',
      korean: '야옹이',
    });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('w001');
    expect(res.body.english).toBe('kitty');
    expect(res.body.korean).toBe('야옹이');
    // Unchanged fields must be preserved
    expect(res.body.emoji).toBe('🐱');
    expect(res.body.category).toBe('animals');
  });

  it('should return 404 for a non-existent id', async () => {
    const res = await request('PUT', '/api/words/w999', { english: 'ghost' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Word not found' });
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. DELETE /api/words/:id
// ═══════════════════════════════════════════════════════════════
describe('DELETE /api/words/:id', () => {
  it('should delete an existing word', async () => {
    const res = await request('DELETE', '/api/words/w001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    // Verify it's gone
    const verify = await request('GET', '/api/words/w001');
    expect(verify.status).toBe(404);
  });

  it('should return 404 for a non-existent id', async () => {
    const res = await request('DELETE', '/api/words/w999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Word not found' });
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. GET /api/categories
// ═══════════════════════════════════════════════════════════════
describe('GET /api/categories', () => {
  it('should return 6 categories with correct structure', async () => {
    const res = await request('GET', '/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(6);

    const ids = res.body.categories.map((c) => c.id).sort();
    expect(ids).toEqual(['animals', 'body', 'colors', 'food', 'fruits', 'numbers']);

    // Spot-check one category object
    const animals = res.body.categories.find((c) => c.id === 'animals');
    expect(animals).toEqual({ id: 'animals', name: '동물', emoji: '🐾' });
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. GET /api/quiz
// ═══════════════════════════════════════════════════════════════
describe('GET /api/quiz', () => {
  it('should return 10 questions by default', async () => {
    const res = await request('GET', '/api/quiz');

    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(10);

    // Each question must be a valid word object
    const q = res.body.questions[0];
    expect(q).toHaveProperty('id');
    expect(q).toHaveProperty('english');
    expect(q).toHaveProperty('korean');
    expect(q).toHaveProperty('emoji');
    expect(q).toHaveProperty('category');
  });

  it('should respect the count parameter', async () => {
    const res = await request('GET', '/api/quiz?count=5');

    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(5);
  });

  it('should filter by category', async () => {
    // colors has 8 words → request 20 → capped at 8
    const res = await request('GET', '/api/quiz?category=colors&count=20');

    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeLessThanOrEqual(8);
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(res.body.questions.every((q) => q.category === 'colors')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. POST /api/stats
// ═══════════════════════════════════════════════════════════════
describe('POST /api/stats', () => {
  it('should save study result and update stats', async () => {
    const res = await request('POST', '/api/stats', {
      wordId: 'w001',
      stars: 3,
      attempts: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    // Verify the stats were persisted
    const stats = await request('GET', '/api/stats');
    expect(stats.body.totalGames).toBe(1);
    expect(stats.body.totalStars).toBe(3);
    expect(stats.body.totalCorrect).toBe(1);
    expect(stats.body.wordStats.w001).toEqual({
      attempts: 1,
      totalStars: 3,
      bestStars: 3,
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request('POST', '/api/stats', { wordId: 'w001' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'wordId, stars, and attempts are required',
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. GET /api/stats
// ═══════════════════════════════════════════════════════════════
describe('GET /api/stats', () => {
  it('should return initial empty stats', async () => {
    const res = await request('GET', '/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.totalGames).toBe(0);
    expect(res.body.totalCorrect).toBe(0);
    expect(res.body.totalStars).toBe(0);
    expect(res.body.wordStats).toEqual({});
  });

  it('should accumulate stats across multiple submissions', async () => {
    await request('POST', '/api/stats', { wordId: 'w001', stars: 2, attempts: 1 });
    await request('POST', '/api/stats', { wordId: 'w002', stars: 3, attempts: 2 });

    const res = await request('GET', '/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.totalGames).toBe(2);
    expect(res.body.totalStars).toBe(5);
    expect(res.body.totalCorrect).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. POST /api/admin/verify
// ═══════════════════════════════════════════════════════════════
describe('POST /api/admin/verify', () => {
  it('should succeed with the correct PIN (1234)', async () => {
    const res = await request('POST', '/api/admin/verify', { pin: '1234' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('should fail with an incorrect PIN', async () => {
    const res = await request('POST', '/api/admin/verify', { pin: '0000' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: false });
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. Category CRUD
// ═══════════════════════════════════════════════════════════════
describe('Category CRUD', () => {
  // ── POST /api/categories ────────────────────────────────────
  it('POST /api/categories — should add a new category (201)', async () => {
    const newCat = { id: 'vehicles', name: '탈것', emoji: '🚗' };
    const res = await request('POST', '/api/categories', newCat);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'vehicles', name: '탈것', emoji: '🚗' });

    // Verify persistence
    const listRes = await request('GET', '/api/categories');
    expect(listRes.body.categories).toHaveLength(7);
    const added = listRes.body.categories.find((c) => c.id === 'vehicles');
    expect(added).toEqual({ id: 'vehicles', name: '탈것', emoji: '🚗' });
  });

  it('POST /api/categories — should return 400 when id or name is missing', async () => {
    const noName = await request('POST', '/api/categories', { id: 'test' });
    expect(noName.status).toBe(400);
    expect(noName.body).toEqual({ error: 'id and name are required' });

    const noId = await request('POST', '/api/categories', { name: '테스트' });
    expect(noId.status).toBe(400);
    expect(noId.body).toEqual({ error: 'id and name are required' });
  });

  it('POST /api/categories — should return 409 for duplicate id', async () => {
    const res = await request('POST', '/api/categories', {
      id: 'animals',
      name: '동물 중복',
      emoji: '🐾',
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Category already exists' });
  });

  it('POST /api/categories — should default emoji to 📁 when omitted', async () => {
    const res = await request('POST', '/api/categories', {
      id: 'misc',
      name: '기타',
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'misc', name: '기타', emoji: '📁' });
  });

  // ── PUT /api/categories/:id ─────────────────────────────────
  it('PUT /api/categories/:id — should update category (200)', async () => {
    const res = await request('PUT', '/api/categories/animals', {
      name: '동물원',
      emoji: '🦁',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'animals', name: '동물원', emoji: '🦁' });

    // Verify persistence
    const listRes = await request('GET', '/api/categories');
    const updated = listRes.body.categories.find((c) => c.id === 'animals');
    expect(updated).toEqual({ id: 'animals', name: '동물원', emoji: '🦁' });
  });

  it('PUT /api/categories/:id — should return 404 for non-existent id', async () => {
    const res = await request('PUT', '/api/categories/nonexistent', {
      name: '없는거',
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Category not found' });
  });

  // ── DELETE /api/categories/:id ──────────────────────────────
  it('DELETE /api/categories/:id — should delete empty category (200)', async () => {
    // First, add a category with no words
    await request('POST', '/api/categories', { id: 'empty-cat', name: '빈 카테고리' });

    const res = await request('DELETE', '/api/categories/empty-cat');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    // Verify it's gone
    const listRes = await request('GET', '/api/categories');
    const deleted = listRes.body.categories.find((c) => c.id === 'empty-cat');
    expect(deleted).toBeUndefined();
  });

  it('DELETE /api/categories/:id — should refuse to delete category with words (400)', async () => {
    // 'animals' has words in DEFAULT_DATA
    const res = await request('DELETE', '/api/categories/animals');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: '이 카테고리에 단어가 있어서 삭제할 수 없습니다',
    });
  });

  it('DELETE /api/categories/:id — should return 404 for non-existent id', async () => {
    const res = await request('DELETE', '/api/categories/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Category not found' });
  });
});
