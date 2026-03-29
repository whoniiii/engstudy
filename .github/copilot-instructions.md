# 🎮 EngStudy — 초등 1학년 영어 단어 게임

## 📌 프로젝트 개요
- **이름**: EngStudy (영어 단어 듣기 게임)
- **대상**: 초등학교 1학년 (만 6~7세)
- **핵심 컨셉**: 영어 단어 발음을 듣고 → 정답을 맞추는 **게임형 학습**
- **기술 스택**: Node.js (순수 http 모듈), Vanilla JS/CSS 인라인 HTML SPA
- **⚠️ React/TypeScript 사용 안 함** — 순수 JavaScript, 단일 HTML 파일
- **포트**: 3000
- **발음**: Web Speech API (`SpeechSynthesis`) — 별도 오디오 파일 불필요
- **데이터 저장**: `data/words.json` (서버 파일 기반, DB 없음)

---

## 🎯 핵심 기능

### 1. 🎤 듣고 따라하기 게임 (아이용 메인 화면) — ⭐ 핵심 기능
- **게임 흐름**: 듣기 → 반드시 따라 말하기 → 발음 평가 → 점수
- 단어 카드가 나타남 (이모지 + 한글 뜻 표시, 영어 스펠링은 숨김)
- 🔊 버튼 → `SpeechSynthesis`로 영어 발음 재생 (자동 재생도 가능)
- 🎤 버튼 → `SpeechRecognition`으로 아이 음성 녹음
- **발음 평가**: 인식된 텍스트와 목표 단어 비교 + confidence 점수 활용
  - ⭐⭐⭐ (완벽!) : 정확히 일치 + 높은 confidence
  - ⭐⭐ (잘했어!) : 부분 일치 또는 중간 confidence
  - ⭐ (다시 해볼까?) : 불일치 또는 낮은 confidence
- 아이가 따라 말하지 않으면 다음으로 넘어갈 수 없음 (반드시 시도해야 함)
- **연속 ⭐⭐⭐ 스트릭**: 3연속 → 🔥, 5연속 → 👑 왕관 효과
- 한 라운드 = 10문제, 라운드 끝나면 결과 화면 (총 별 개수, 칭찬 메시지)
- **기술**: Web Speech API — `SpeechSynthesis` (발음) + `SpeechRecognition` (음성인식)

### 2. 📚 단어장 보기 (아이용)
- 학습할 단어 목록을 카드 형태로 보기
- 각 카드: 이모지 + 영어 단어 + 한글 뜻 + 🔊 발음 듣기 + 🎤 따라하기
- 카드를 터치하면 플립 애니메이션으로 뒤집기

### 3. 🛠️ 어드민 페이지 (부모용)
- **비밀번호 잠금**: 간단한 PIN 입력으로 접근 (아이가 실수로 들어가지 않도록)
- **단어 추가**: 영어 단어 + 한글 뜻 + 이모지(선택) + 카테고리
- **단어 수정/삭제**: 기존 단어 관리
- **카테고리 관리**: 동물, 과일, 색깔, 숫자, 신체, 음식 등
- **학습 통계**: 아이의 정답률, 자주 틀리는 단어 표시
- **기본 단어셋 제공**: 첫 실행 시 기본 50개 단어 자동 로드

---

## 🎨 UI/UX 디자인 원칙

### 아이 친화적 디자인
- **큰 글씨** (최소 24px, 게임 요소는 32px+)
- **큰 버튼** (최소 80px 높이, 터치 영역 충분)
- **둥근 모서리** (border-radius: 20px+)
- **밝고 따뜻한 색상** (파스텔톤 배경, 비비드 포인트)
- **풍부한 이모지** 활용 (텍스트 최소화, 시각적 힌트 최대화)
- **애니메이션**: 바운스, 흔들기, 반짝임, 폭죽 등 CSS 애니메이션
- **배경**: 구름, 무지개, 별 등 아기자기한 배경 요소
- **캐릭터**: 귀여운 이모지 캐릭터가 격려 메시지 전달

### 색상 팔레트
```
--bg-primary: #FFF8E7 (따뜻한 크림색)
--bg-card: #FFFFFF
--accent-1: #FF6B6B (코랄 레드)
--accent-2: #4ECDC4 (민트)
--accent-3: #FFE66D (노란색)
--accent-4: #95E1D3 (연두)
--accent-5: #F38181 (분홍)
--text-primary: #2D3436
--text-secondary: #636E72
--correct: #00B894 (초록)
--wrong: #FF7675 (연분홍 — 빨강 아님, 부드럽게)
--star: #FDCB6E (금별)
```

### 게임 사운드 (Web Audio API)
- 정답: 짧은 성공음 (띵동!)
- 오답: 부드러운 알림음 (뿅)
- 라운드 완료: 축하 팡파레
- 버튼 클릭: 가벼운 팝 효과

---

## 📁 프로젝트 구조
```
engstudy/
├── .github/
│   └── copilot-instructions.md  ← 이 파일 (프로젝트 가이드)
├── public/                      ← 정적 파일 (프론트엔드)
│   ├── index.html               ← 게임 메인 SPA (CSS+JS 인라인)
│   └── admin.html               ← 어드민 페이지 (부모용)
├── src/
│   └── server.js                ← Node.js HTTP 서버
├── data/
│   └── words.json               ← 단어 데이터 (서버 자동 생성)
├── __tests__/
│   └── server.test.js           ← Vitest 테스트
├── package.json
├── vitest.config.js
└── .gitignore
```

---

## 🔌 API 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/words` | 전체 단어 목록 (카테고리 필터 지원: `?category=animals`) |
| GET | `/api/words/:id` | 단어 상세 |
| POST | `/api/words` | 단어 추가 (어드민) |
| PUT | `/api/words/:id` | 단어 수정 (어드민) |
| DELETE | `/api/words/:id` | 단어 삭제 (어드민) |
| GET | `/api/categories` | 카테고리 목록 |
| GET | `/api/quiz` | 퀴즈 문제 생성 (랜덤 4지선다, `?count=10&category=animals`) |
| POST | `/api/stats` | 학습 결과 저장 (정답/오답 기록) |
| GET | `/api/stats` | 학습 통계 조회 |
| POST | `/api/admin/verify` | 어드민 PIN 검증 |

---

## 📦 데이터 구조

### words.json
```json
{
  "words": [
    {
      "id": "w001",
      "english": "apple",
      "korean": "사과",
      "emoji": "🍎",
      "category": "fruits",
      "createdAt": "2026-03-29T00:00:00Z"
    }
  ],
  "categories": [
    { "id": "animals", "name": "동물", "emoji": "🐾" },
    { "id": "fruits", "name": "과일", "emoji": "🍎" },
    { "id": "colors", "name": "색깔", "emoji": "🎨" },
    { "id": "numbers", "name": "숫자", "emoji": "🔢" },
    { "id": "body", "name": "신체", "emoji": "🦶" },
    { "id": "food", "name": "음식", "emoji": "🍔" }
  ],
  "stats": {
    "totalGames": 0,
    "totalCorrect": 0,
    "totalWrong": 0,
    "wordStats": {}
  },
  "settings": {
    "adminPin": "1234"
  }
}
```

---

## 🎮 게임 흐름

```
[시작 화면] 🏠
  ├── "🎮 게임 시작!" → 카테고리 선택 → 듣고 따라하기 (10문제)
  │                                         ├── 📖 단어 카드 (이모지+한글뜻)
  │                                         ├── 🔊 발음 듣기 (SpeechSynthesis)
  │                                         ├── 🎤 따라 말하기 (SpeechRecognition)
  │                                         ├── ⭐ 발음 평가 → 별 1~3개
  │                                         ├── (⭐⭐⭐ 아닐 경우 재시도 가능)
  │                                         └── 10문제 완료 → 결과 화면 🏆
  ├── "📚 단어장" → 카드 뷰 (발음 듣기 + 따라하기)
  └── "⚙️ 설정" → PIN 입력 → 어드민 페이지
                              ├── 단어 추가/수정/삭제
                              ├── 카테고리 관리
                              └── 학습 통계 확인
```

---

## 🛠️ 구현 순서 (TODO)

### Phase 1: 기반 구축
1. **project-setup**: 프로젝트 초기화 (package.json, .gitignore, 폴더 구조)
2. **server-basic**: Node.js HTTP 서버 기본 골격 (정적 파일 서빙)
3. **data-layer**: words.json 데이터 로드/저장 + 기본 단어셋 50개

### Phase 2: API 개발
4. **api-words-crud**: 단어 CRUD API (GET/POST/PUT/DELETE)
5. **api-quiz**: 퀴즈 문제 생성 API (랜덤 4지선다)
6. **api-stats**: 학습 통계 API (결과 저장/조회)
7. **api-admin**: 어드민 PIN 검증 API

### Phase 3: 게임 UI (아이용)
8. **ui-home**: 시작 화면 (큰 버튼 3개, 귀여운 배경)
9. **ui-quiz**: 듣기 퀴즈 게임 화면 (발음 + 4지선다 + 애니메이션)
10. **ui-result**: 라운드 결과 화면 (별, 칭찬 메시지)
11. **ui-wordbook**: 단어장 카드 뷰 (플립 애니메이션)
12. **ui-sounds**: 게임 사운드 효과 (Web Audio API)

### Phase 4: 어드민 UI (부모용)
13. **admin-auth**: PIN 잠금 화면
14. **admin-words**: 단어 추가/수정/삭제 폼
15. **admin-stats**: 학습 통계 대시보드

### Phase 5: 테스트 & 마무리
16. **tests**: Vitest 테스트 작성
17. **default-words**: 기본 단어 50개 데이터 완성
18. **polish**: UI 다듬기, 반응형, 접근성

---

## 🚨 개발 규칙

### Git 작업 제한
- Git 관련 작업은 반드시 인간의 명시적 허락을 받은 후에만 수행
- `git status`, `git diff`, `git log` 등 조회는 허락 없이 가능

### 코드 컨벤션
- **순수 JavaScript** (TypeScript 아님)
- 프론트엔드: `public/index.html`에 CSS+JS 인라인 (단일 파일 SPA)
- 백엔드: `src/server.js` — Node.js 순수 http 모듈 (Express 아님)
- 어드민: `public/admin.html` — 별도 SPA

### 에이전트 역할
| 에이전트 | 역할 | 담당 파일 |
|----------|------|-----------|
| pm | 🧠 프로젝트 매니저 | copilot-instructions.md, README.md |
| ui-developer | 🎨 프론트엔드 | `public/*.html` |
| backend-developer | 🦾 백엔드 | `src/server.js` |
| designer | 🎨 SVG 디자이너 | `public/*.html` (SVG 일러스트) |
| tester | 🔬 테스트 | `__tests__/*.test.js` |

### 언어
- 고객이 한국어로 말하면 → 한국어로 응답
- UI 텍스트: 한국어 (아이가 한국 초등학생)
- 학습 대상: 영어 단어 (발음은 영어, 뜻은 한국어)