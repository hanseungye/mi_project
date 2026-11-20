# 03. 데이터 구조 & API 엔드포인트 (초안)

> 함수 단위 계약(api/books.js 등)은 [04-dev-guide.md](./04-dev-guide.md) 6절.
> 기준: json-server **0.17.4** (`npx json-server@0.17.4 --watch db.json --port 3000`)
> 팀 전원 버전 통일 필수. 1.x는 id가 문자열로 생성되는 등 동작이 다를 수 있음.

---

## 1. 데이터 모델 — `books`

| 필드 | 타입 | 필수 | 생성 주체 | 설명 / 규칙 |
|---|---|---|---|---|
| `id` | number | O | json-server | POST 시 **보내지 않음** → 서버가 자동 부여 |
| `title` | string | O | 사용자 | 공백 금지, 최대 50자 (안) |
| `author` | string | O | 사용자 | 공백 금지, 최대 20자 (안). 프롬프트 템플릿에 사용 |
| `content` | string | O | 사용자 | 공백 금지, 최대 2000자 (안). 프롬프트에는 앞 500자만 사용 (안) |
| `coverImageUrl` | string | O | 앱 (OpenAI 결과) | 초기값 `""`. 표지 생성 후 Data URL 저장 |
| `createdAt` | string (ISO 8601) | O | 앱 | 등록 시 `new Date().toISOString()` |
| `updatedAt` | string (ISO 8601) | O | 앱 | 등록 시 createdAt과 동일, **모든 PATCH 시 갱신** |

### 설계 결정 메모
- **json-server는 날짜를 자동으로 넣지 않는다** → createdAt / updatedAt은 프론트가 직접 넣는다.
- **`coverImageUrl`은 `null`이 아니라 `""`로 초기화** → 렌더링 시 `book.coverImageUrl ? <img/> : <Placeholder/>` 한 가지 조건으로 처리 가능.
- **표지 저장도 "수정"으로 본다** → 표지 PATCH에도 updatedAt 포함. (규칙을 "모든 PATCH에 updatedAt"으로 단순화)
- 강의 모델의 `likes`는 요구사항에 없으므로 제외.

### 예시 데이터 구성 의도 (`db.json`)
| id | 의도 |
|---|---|
| 1 | 일반적인 길이의 내용 |
| 2 | createdAt ≠ updatedAt → 상세의 "수정일" 표시 확인용 |
| 3 | 아주 짧은 내용 → 짧은 프롬프트로도 표지가 나오는지 확인용 |

전부 `coverImageUrl: ""` → 표지 없음 플레이스홀더 UI 확인용.

---

## 2. json-server 엔드포인트

Base URL: `http://localhost:3000` (코드에서는 상수로 관리 → `API_BASE`)

| # | 기능 | Method | URL | Request Body | 성공 응답 | 사용 화면 | 미션 |
|---|---|---|---|---|---|---|---|
| A1 | 도서 목록 조회 | GET | `/books` | - | 200, `Book[]` | 목록 | M3 |
| A2 | 도서 상세 조회 | GET | `/books/:id` | - | 200, `Book` (없으면 404) | 상세, 수정, AI표지생성 | M3 |
| A3 | 도서 등록 | POST | `/books` | id 제외 **전체 필드** | 201, `Book` (id 포함) | 등록 | M4 |
| A4 | 도서 수정 | PATCH | `/books/:id` | `title`, `author`, `content`, `updatedAt` 중 변경분 | 200, 수정된 `Book` | 수정 | M4 |
| A5 | 도서 삭제 | DELETE | `/books/:id` | - (headers·body 없음) | 200, 본문 사용 안 함 | 상세 | M4 |
| A6 | 표지 저장 | PATCH | `/books/:id` | `coverImageUrl`, `updatedAt` | 200, 수정된 `Book` | AI표지생성 | M6 |

### Request / Response 예시

**A3. 등록**
```http
POST /books
Content-Type: application/json

{
  "title": "새 책",
  "author": "홍길동",
  "content": "내용...",
  "coverImageUrl": "",
  "createdAt": "2026-11-20T10:00:00.000Z",
  "updatedAt": "2026-11-20T10:00:00.000Z"
}
```
→ `201 Created` + `{ "id": 4, ...위 필드 }` → 목록 state에 추가

**A4. 수정**
```http
PATCH /books/2
Content-Type: application/json

{ "title": "상록수 (개정판)", "updatedAt": "2026-11-20T11:00:00.000Z" }
```
→ `200 OK` + 수정된 전체 객체 → **응답 객체로** 목록 state의 해당 항목 교체 (`map`)

**A6. 표지 저장**
```http
PATCH /books/2
Content-Type: application/json

{ "coverImageUrl": "data:image/png;base64,iVBOR...", "updatedAt": "2026-11-20T11:05:00.000Z" }
```

**A5. 삭제**
```http
DELETE /books/2
```
→ `res.ok`만 확인하고 `res.json()`은 호출하지 않음 → 목록 state에서 `filter`로 제거

### 공통 규칙
- POST / PATCH는 `headers: { 'Content-Type': 'application/json' }` + `JSON.stringify(body)`
- 모든 요청은 `res.ok` 확인 → 실패 시 `throw` → 호출부 `try-catch`에서 에러 UI 표시
- 404 (`/books/:id`에 없는 id) → 상세 화면에서 "존재하지 않는 도서" 안내

### 검색 (M3 심화)
- **클라이언트 필터 방식 채택 (안)**: A1로 받은 목록에 `Array.filter` (힌트와 동일)
- 참고: json-server 0.17은 `GET /books?q=키워드` 전체 텍스트 검색도 지원하지만, 학습 목표(Array.filter)에 맞춰 사용하지 않음
- 정렬: 최신순은 `GET /books?_sort=createdAt&_order=desc` 또는 클라이언트 `sort` — 팀 결정 필요

---

## 3. 외부 API — OpenAI 이미지 생성

| # | 기능 | Method | URL |
|---|---|---|---|
| B1 | 표지 이미지 생성 (사용 화면: AI표지생성) | POST | `https://api.openai.com/v1/images/generations` |

**Headers**
```
Content-Type: application/json
Authorization: Bearer ${userApiKey}     ← 'Bearer' 뒤 띄어쓰기
```

**Body**
| 필드 | 값 | 비고 |
|---|---|---|
| `model` | `"gpt-image-2"` | UI 고정 |
| `prompt` | 제목·저자·내용 조합 | 템플릿은 별도 결정 |
| `n` | `1` | 고정 |
| `size` | `"1024x1536"` | 세로형 표지 비율 |
| `quality` | `"low"` / `"medium"` / `"high"` / `"auto"` | UI 선택 |
| `output_format` | `"png"` | **고정 권장** — Data URL 접두어(`data:image/png;base64,`)와 일치시키기 위함 |

**Response 처리**
```
data.data?.[0]?.b64_json  →  `data:image/png;base64,${b64Json}`  →  A6로 저장
```

**에러 처리**
| 상황 | 처리 |
|---|---|
| API Key 빈 값 | 요청 전 차단 + 안내 |
| 401 | "API Key를 확인하세요" |
| 429 | "잠시 후 다시 시도하세요" |
| 네트워크 오류 | catch에서 알림 |
| b64_json 없음 | "응답 형식 오류" 처리 |

---

## 4. 팀 결정 필요 항목

| # | 항목 | 제안 | 결정 |
|---|---|---|---|
| D1 | json-server 버전 | 0.17.4로 통일 | |
| D2 | 필드 길이 제한 | title 50 / author 20 / content 2000 | |
| D3 | 프롬프트에 쓰는 content 길이 | 앞 500자 | |
| D4 | 목록 정렬 | 최신 등록순 | |
| D5 | 표지 저장 시 updatedAt 갱신 | 갱신함 | |
| D6 | 표지 미리보기·재생성 (저장 전 확인) | 05 AI표지생성 페이지에서 구현 (별도 페이지라 흐름이 자연스러움) | |

---

## 5. 알려진 제약
- `coverImageUrl`에 Data URL(base64)을 저장하면 한 장당 수백 KB~수 MB → **A1(목록 조회) 응답이 표지 수에 비례해 커짐**. json-server 0.17은 필드 선택 조회를 지원하지 않으므로 실습 범위에서는 감수. (Spring Boot 전환 시 목록 API에서 썸네일/URL만 내려주는 방식으로 개선 가능)

---

## 6. Spring Boot 전환 대비 (다음 주 Backend 미니프로젝트)

> 목표: **json-server → Spring Boot 교체 시 프론트 수정은 `src/api/` 폴더 + 환경변수만.**
> 컴포넌트는 손대지 않는다.

### 6-1. 지금 프론트에서 지킬 규칙

| # | 규칙 | 이유 (교체 시 무엇이 바뀌나) |
|---|---|---|
| R1 | 모든 fetch는 `src/api/books.js`, `src/api/openai.js`에만 둔다. 컴포넌트에서 fetch 직접 호출 금지 | 서버가 바뀌어도 이 파일만 수정 |
| R2 | Base URL은 `import.meta.env.VITE_API_BASE` 로 관리 (`.env`: `VITE_API_BASE=http://localhost:3000`) | 교체 시 `.env` 한 줄만 변경 |
| R3 | 화면 state는 **서버 응답 객체**로 갱신 (POST/PATCH 응답 사용) | Spring에서 서버가 날짜·id를 채워도 화면이 그대로 맞음 |
| R4 | createdAt/updatedAt 세팅은 api 모듈 안에서만 | Spring은 서버가 자동 생성(@CreatedDate 등) → api 모듈에서 해당 줄만 삭제 |
| R5 | DELETE 응답은 `res.ok`만 확인, 본문 파싱 안 함 | Spring은 보통 `204 No Content` (본문 없음) |
| R6 | 에러는 api 모듈에서 `status` 기준으로 Error를 만들어 던짐 | Spring 기본 에러 JSON 형식이 json-server와 다름 |
| R7 | id는 number로 취급 (json-server 0.17 고정) | JPA `Long` + auto increment와 타입 일치 |
| R8 | 날짜는 표시 전에 `new Date(str)`로 파싱하는 공용 포맷 함수 사용 | Java `LocalDateTime`은 `Z` 없이 직렬화될 수 있어 형식이 달라질 수 있음 |

### 6-2. 교체 시점에 백엔드에서 맞춰야 할 것 (메모)

| 항목 | 내용 |
|---|---|
| 엔드포인트 | 위 A1~A6와 Method·URL·Body 구조 동일하게 구현 (`/api/books` 접두어를 쓰면 `VITE_API_BASE`에 포함) |
| CORS | React(5173) ↔ Spring(8080) 포트가 달라 CORS 설정 필요. json-server는 기본 허용이라 지금은 안 보이는 문제. **대안: Vite `server.proxy`로 `/api` → 8080 프록시** |
| 응답 상태 | POST `201` + 생성 객체 반환, PATCH `200` + 수정 객체 반환, 없는 id `404` |
| PATCH 부분 수정 | body에 온 필드만 반영하도록 구현 필요 (null 필드로 덮어쓰지 않기) |
| `coverImageUrl` 컬럼 | **기본 VARCHAR(255)로는 Data URL 저장 불가** → `@Lob` / `LONGTEXT` 필요. 근본 개선은 이미지 파일 저장 후 URL만 DB에 저장 |
| OpenAI API Key | 지금은 브라우저에서 직접 호출(학습용). 백엔드 생기면 **서버가 OpenAI를 대신 호출**하는 구조로 옮기면 Key가 브라우저에 노출되지 않음 (선택) |

### 6-3. 폴더 구조 (안)
```
src/
├── api/
│   ├── client.js     # API_BASE, 공통 request(), 에러 변환
│   ├── books.js      # getBooks, getBook, createBook, updateBook, deleteBook, saveCover
│   └── openai.js     # generateCoverImage
├── pages/            # List, Detail, Create, Edit
├── components/       # Header, BookCard, BookForm, CoverGenerator ...
└── utils/
    └── date.js       # formatDate
```
