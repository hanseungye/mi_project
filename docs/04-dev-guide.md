# 04. 개발 가이드 (초안)

> **이 문서의 목적**: 5명이 페이지를 나눠 **동시에** 개발하고, 합쳤을 때 **한 번에** 동작하게 만드는 약속.
> 페이지 담당자는 **자기 페이지 파일만** 만들고, 여기 정의된 함수·컴포넌트·경로만 사용한다.
>
> 관련 문서: [01 기능명세](./01-feature-spec.md) · [02 시나리오](./02-scenarios.md) · [03 API](./03-api.md)

---

## 0. 확정할 결정 (사전 회의, 10분)

이 문서는 아래 **기본값**으로 작성되어 있다. 바꾸면 해당 절만 고치면 된다.

| # | 항목 | 기본값 | 바꾸면 고칠 곳 |
|---|---|---|---|
| D1 | json-server 버전 | **0.17.4** 고정 | 3절 |
| D2 | 입력 길이 제한 | 제목 50 / 저자 20 / 내용 2000 | 7-5 `validate.js` |
| D3 | 프롬프트에 쓰는 내용 길이 | 앞 500자 | 9절 |
| D4 | 목록 정렬 | 최신 등록순 (서버 정렬) | 6-2 `getBooks` |
| D5 | 표지 저장 시 updatedAt 갱신 | 갱신함 | 6-2 `updateBook` |
| D6 | 표지 미리보기·재생성 | **05 페이지에서 구현** (별도 페이지라 자연스러움) | 8-5 |
| D7 | 라우팅 | **React Router** | 5절 (부록 A 참고) |
| D8 | CSS 방식 | 일반 CSS + 공통 변수 | 10절 |
| D9 | 홈 화면 | **없음** — `/`는 목록으로 이동 | 5절 |

---

## 1. 담당 & 작업 순서

| 담당 | 페이지 | 사전 작업 | 주 사용 API |
|---|---|---|---|
| **A** | 04 도서수정 | **① 프로젝트 뼈대** (2절 구조, 3절 실행, 5절 App.jsx, 6절 api) | getBook, updateBook |
| **B** | 03 도서상세 | **② 공통 컴포넌트** (7절 전부, 10절 CSS) | getBook, deleteBook |
| **C** | 02 도서등록 | `BookForm` 소유 (7-4) | createBook |
| **D** | 01 도서목록 | `BookCard` | getBooks |
| **E** | 05 AI표지생성 | `api/openai.js`, `utils/prompt.js` | getBook, saveCover, generateCoverImage |

### 순서
```
[사전 회의 10분] 0절 결정
      │
[A] 뼈대 + api ──push──┐        [B] 공통 컴포넌트 ──push──┐
      │                │              │                   │
      └──── 둘 다 main에 머지되면 ────┴───────────────────┘
                              │
          C·D·E (+A·B) 각자 브랜치에서 페이지 구현
                              │
          C의 BookForm이 머지되면 → A가 수정 페이지에 사용
```

> **기다리지 않는 법**: A·B가 끝나기 전에도 C·D·E는 **자기 페이지의 마크업·CSS부터** 시작할 수 있다.
> api 함수는 6절의 시그니처대로 호출하는 코드를 먼저 써 두면 된다.

---

## 2. 폴더 구조 & 파일 규칙

```
my-app/
├── .env                      # VITE_API_BASE=http://localhost:3000
├── .env.example              # 위와 동일 (커밋용)
├── .gitignore                # node_modules, dist
├── db.json
├── index.html
├── package.json
├── vite.config.js
├── docs/                     # 01~04 문서
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx               # 라우팅만 (A)
    ├── api/                  # 서버 통신은 여기만 (R1)
    │   ├── client.js         # (A)
    │   ├── books.js          # (A)
    │   └── openai.js         # (E)
    ├── pages/                # 페이지 1개 = 파일 1개
    │   ├── BookListPage.jsx      + BookListPage.css      (D)
    │   ├── BookCreatePage.jsx    + BookCreatePage.css    (C)
    │   ├── BookDetailPage.jsx    + BookDetailPage.css    (B)
    │   ├── BookEditPage.jsx      + BookEditPage.css      (A)
    │   └── CoverGeneratePage.jsx + CoverGeneratePage.css (E)
    ├── components/
    │   ├── Header.jsx        + Header.css        (B)
    │   ├── BookCover.jsx     + BookCover.css     (B)
    │   ├── StatusMessage.jsx + StatusMessage.css (B)
    │   ├── BookForm.jsx      + BookForm.css      (C)
    │   └── BookCard.jsx      + BookCard.css      (D)
    ├── utils/
    │   ├── date.js           # (B)
    │   ├── validate.js       # (C)
    │   └── prompt.js         # (E)
    └── styles/
        ├── variables.css     # 색·간격 변수 (B)
        └── global.css        # body, 버튼 기본 (B)
```

| 규칙 | 예 |
|---|---|
| 화면(JSX)을 return하면 `.jsx`, 아니면 `.js` | `BookCard.jsx`, `books.js` |
| 컴포넌트·페이지 파일명은 PascalCase, 나머지는 camelCase | `BookForm.jsx`, `validate.js` |
| 컴포넌트마다 같은 이름의 CSS 파일 하나 | `BookCard.jsx` ↔ `BookCard.css` |
| 컴포넌트는 `export default`, 유틸·api는 named export | `export default function BookCard()` / `export function getBooks()` |
| **남의 파일은 수정하지 않는다** — 필요하면 담당자에게 요청 | |

---

## 3. 실행 방법

```bash
# 최초 1회
npm install
npm install react-router          # D7 = Router일 때 (A가 설치 후 커밋)

# 터미널 1 — json-server (버전 고정!)
npx json-server@0.17.4 --watch db.json --port 3000

# 터미널 2 — React
npm run dev                        # http://localhost:5173
```

- 확인: `http://localhost:3000/books` 에 예시 도서 3권이 보이면 OK
- `.env`를 바꾸면 **`npm run dev`를 다시 실행**해야 반영된다
- 새 도서를 POST했을 때 `id`가 **숫자(4, 5...)** 로 생기는지 한 번 확인 (문자열이면 버전이 다른 것)

---

## 4. 공통 규칙 (Spring Boot 전환 대비 포함)

| # | 규칙 |
|---|---|
| R1 | **fetch는 `src/api/`에서만.** 페이지·컴포넌트에서 `fetch(` 직접 호출 금지 |
| R2 | Base URL은 `import.meta.env.VITE_API_BASE` (하드코딩 금지) |
| R3 | 데이터는 **각 페이지가 자기 것만 불러온다** (전역 state 없음). 페이지에 들어올 때 `useEffect`로 조회 |
| R4 | createdAt·updatedAt은 **api 함수가 넣는다.** 페이지는 날짜를 신경 쓰지 않음 |
| R5 | api 함수는 실패 시 **`ApiError`를 throw** 한다. 페이지는 `try-catch`로 받아 `StatusMessage`로 표시 |
| R6 | URL의 `id`는 문자열로 들어온다 → 그대로 api 함수에 넘기면 된다 (비교할 때만 `Number(id)`) |
| R7 | API Key는 **state에만** 보관. 코드·localStorage·GitHub 어디에도 저장 금지 |
| R8 | 날짜 표시는 반드시 `formatDate()` 사용 |

---

## 5. 라우팅

### 5-1. 경로 표

| 페이지 | 경로 | 받는 값 | 이동할 수 있는 곳 |
|---|---|---|---|
| (루트) | `/` | - | → `/books` 자동 이동 |
| 01 도서목록 | `/books` | - | 카드 클릭 → `/books/:id` · [새 도서 등록] → `/books/new` |
| 02 도서등록 | `/books/new` | - | 저장 성공 → `/books/:새id` · 취소 → `/books` |
| 03 도서상세 | `/books/:id` | `id` | [수정] → `/books/:id/edit` · [AI 표지 생성] → `/books/:id/cover` · 삭제 성공 → `/books` · [목록] → `/books` |
| 04 도서수정 | `/books/:id/edit` | `id` | 저장 성공·취소 → `/books/:id` |
| 05 AI표지생성 | `/books/:id/cover` | `id` | 저장 성공·취소 → `/books/:id` |
| (없는 경로) | `*` | - | "페이지를 찾을 수 없습니다" + 목록 링크 |

> **등록 후 상세로 보내는 이유**: 다음 행동이 "표지 생성"이므로 시나리오 S-02가 한 단계 짧아진다.

### 5-2. `App.jsx` (A 작성)

```jsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router';
import Header from './components/Header';
import BookListPage from './pages/BookListPage';
import BookCreatePage from './pages/BookCreatePage';
import BookDetailPage from './pages/BookDetailPage';
import BookEditPage from './pages/BookEditPage';
import CoverGeneratePage from './pages/CoverGeneratePage';
import './styles/variables.css';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/new" element={<BookCreatePage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/books/:id/edit" element={<BookEditPage />} />
          <Route path="/books/:id/cover" element={<CoverGeneratePage />} />
          <Route path="*" element={<p>페이지를 찾을 수 없습니다. <Link to="/books">목록으로</Link></p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
```

> 사전 작업 단계에서 A는 페이지 5개를 **빈 컴포넌트**로 만들어 같이 push한다.
> ```jsx
> export default function BookListPage() { return <h1>도서 목록 (D 작업 중)</h1>; }
> ```
> → 각 담당자는 자기 파일의 내용만 바꾸므로 App.jsx 충돌이 없다.

### 5-3. 페이지에서 쓰는 법

```jsx
import { useParams, useNavigate, Link } from 'react-router';

const { id } = useParams();          // '/books/2' → id === '2' (문자열)
const navigate = useNavigate();
navigate(`/books/${id}`);            // 코드로 이동 (저장 성공 후 등)
<Link to="/books/new">새 도서 등록</Link>   // 클릭으로 이동
```

---

## 6. API 함수 계약

### 6-1. `api/client.js` (A)

```js
const API_BASE = import.meta.env.VITE_API_BASE;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;   // 0 = 네트워크 오류, 404, 500 ...
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없습니다. json-server가 실행 중인지 확인하세요.');
  }

  if (!res.ok) {
    const message = res.status === 404 ? '존재하지 않는 도서입니다.' : `요청에 실패했습니다. (${res.status})`;
    throw new ApiError(res.status, message);
  }

  if (method === 'DELETE' || res.status === 204) return null;   // 본문 파싱 안 함
  return res.json();
}
```

### 6-2. `api/books.js` (A)

| 함수 | 인자 | 반환 (Promise) | 실패 |
|---|---|---|---|
| `getBooks()` | - | `Book[]` 최신순 | ApiError |
| `getBook(id)` | id | `Book` | ApiError (404 포함) |
| `createBook(values)` | `{ title, author, content }` | 생성된 `Book` (id 포함) | ApiError |
| `updateBook(id, changes)` | id, 바뀐 필드만 | 수정된 `Book` | ApiError |
| `deleteBook(id)` | id | `null` | ApiError |
| `saveCover(id, dataUrl)` | id, Data URL | 수정된 `Book` | ApiError |

```js
import { request } from './client';

const now = () => new Date().toISOString();

export function getBooks() {
  return request('/books?_sort=createdAt&_order=desc');        // D4
}

export function getBook(id) {
  return request(`/books/${id}`);
}

export function createBook({ title, author, content }) {
  const t = now();
  return request('/books', {
    method: 'POST',
    body: { title, author, content, coverImageUrl: '', createdAt: t, updatedAt: t },
  });
}

export function updateBook(id, changes) {
  return request(`/books/${id}`, {
    method: 'PATCH',
    body: { ...changes, updatedAt: now() },                   // D5, R4
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, { method: 'DELETE' });
}

export function saveCover(id, coverImageUrl) {
  return updateBook(id, { coverImageUrl });
}
```

> **Spring Boot 전환 시**: `.env`의 주소 변경 + 서버가 날짜를 넣으면 `now()` 관련 줄 삭제. 페이지 코드는 그대로.

### 6-3. `api/openai.js` (E)

| 함수 | 인자 | 반환 (Promise) | 실패 |
|---|---|---|---|
| `generateCoverImage({ apiKey, prompt, quality })` | Key, 프롬프트, `'low'｜'medium'｜'high'｜'auto'` | Data URL 문자열 `data:image/png;base64,...` | ApiError (status 401 / 429 / 0 / 기타) |

- 엔드포인트·헤더·body는 03-api.md 3절 그대로 (`model: 'gpt-image-2'`, `n: 1`, `size: '1024x1536'`, `output_format: 'png'`)
- `client.js`의 `request`는 **쓰지 않는다** (Base URL과 헤더가 다름). `ApiError`만 가져다 쓴다
- 응답에 `data[0].b64_json`이 없으면 `throw new ApiError(-1, '이미지 응답 형식이 올바르지 않습니다.')`

```js
import { ApiError } from './client';

const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

export async function generateCoverImage({ apiKey, prompt, quality = 'low' }) {
  // TODO(E): M5 힌트 TODO 1~5 구현
  //  - fetch POST (Authorization: `Bearer ${apiKey}`)
  //  - !res.ok → 401 / 429 / 기타 메시지로 ApiError
  //  - b64_json 추출 → `data:image/png;base64,${b64}` 반환
}
```

---

## 7. 공통 컴포넌트 계약

### 7-1. `Header` (B)
- props: 없음
- 내용: 서비스명(→ `/books`), [도서 목록](→ `/books`), [+ 새 도서 등록](→ `/books/new`)
- 현재 경로에 해당하는 메뉴는 강조 (`NavLink`의 active 사용 가능)

### 7-2. `BookCover` (B)

| prop | 타입 | 설명 |
|---|---|---|
| `src` | string | `coverImageUrl`. `""`이면 플레이스홀더 |
| `title` | string | 플레이스홀더에 표시 + `<img alt>` |
| `size` | `'sm'｜'lg'` | sm = 목록 카드, lg = 상세·표지생성 (기본 `'lg'`) |

```jsx
<BookCover src={book.coverImageUrl} title={book.title} size="sm" />
```
- 비율은 항상 **2:3** (1024×1536과 동일)

### 7-3. `StatusMessage` (B)

| prop | 타입 | 설명 |
|---|---|---|
| `type` | `'loading'｜'error'｜'empty'｜'success'` | 모양·색 결정 |
| `message` | string | 표시할 문구 |
| `action` | ReactNode (선택) | 버튼·링크 (예: [다시 시도], [목록으로]) |

```jsx
if (loading) return <StatusMessage type="loading" message="불러오는 중..." />;
if (error) return <StatusMessage type="error" message={error} action={<Link to="/books">목록으로</Link>} />;
```

### 7-4. `BookForm` (C 소유, A도 사용)

| prop | 타입 | 설명 |
|---|---|---|
| `initialValues` | `{ title, author, content }` | 등록: 빈 문자열 / 수정: 기존 값 (기본 `{ title: '', author: '', content: '' }`) |
| `onSubmit` | `(values) => Promise` | 검사 통과 시 호출. **API 호출은 페이지가** 함 |
| `onCancel` | `() => void` | [취소] 클릭 |
| `submitLabel` | string | `'등록'` / `'저장'` |

- BookForm이 하는 일: 입력 state 관리(spread 불변성), `validateBook()`으로 검사·에러 표시, 글자 수 표시, 제출 중 버튼 비활성화
- BookForm이 **안 하는** 일: fetch, 화면 이동 → 페이지 책임

```jsx
// BookCreatePage.jsx (C)
const navigate = useNavigate();
async function handleSubmit(values) {
  const created = await createBook(values);
  navigate(`/books/${created.id}`);
}
<BookForm onSubmit={handleSubmit} onCancel={() => navigate('/books')} submitLabel="등록" />

// BookEditPage.jsx (A)
async function handleSubmit(values) {
  await updateBook(id, values);
  navigate(`/books/${id}`);
}
<BookForm initialValues={{ title: book.title, author: book.author, content: book.content }}
          onSubmit={handleSubmit} onCancel={() => navigate(`/books/${id}`)} submitLabel="저장" />
```

> `onSubmit`이 throw하면 BookForm은 입력값을 유지한 채 "저장에 실패했습니다"를 표시한다 (시나리오 S-02 2b, S-03 4a).

### 7-5. `utils/validate.js` (C)

```js
export const LIMITS = { title: 50, author: 20, content: 2000 };   // D2
const LABELS = { title: '제목', author: '저자', content: '내용' };

// 반환: { title?: '...', author?: '...', content?: '...' }  — 빈 객체면 통과
export function validateBook(values) {
  const errors = {};
  for (const key of Object.keys(LIMITS)) {
    const v = (values[key] ?? '').trim();
    if (!v) errors[key] = `${LABELS[key]}을(를) 입력하세요`;
    else if (v.length > LIMITS[key]) errors[key] = `${LABELS[key]}은(는) ${LIMITS[key]}자 이하로 입력하세요`;
  }
  return errors;
}
```

### 7-6. `utils/date.js` (B)

```js
// '2026-11-20T09:00:00.000Z' → '2026. 11. 20.'
export function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('ko-KR');
}
```

---

## 8. 페이지별 구현 체크리스트

각 페이지 공통: ① `useEffect`로 조회 ② `loading` / `error` state ③ `StatusMessage`로 상태 표시

### 8-1. 01 도서목록 — D
- [ ] `getBooks()` → `books` state
- [ ] 로딩 / 에러(+다시 시도) / 빈 목록(+등록 링크) 표시
- [ ] `BookCard`: `BookCover size="sm"` + 제목 + 저자 + `formatDate(createdAt)`, 클릭 → `/books/:id`
- [ ] [심화] 검색: `keyword` state + `books.filter(...)` (원본 `books`는 건드리지 않음)
- 시나리오: S-01 (1~5, 2a, 3a), S-05

### 8-2. 02 도서등록 — C
- [ ] `BookForm` + `validate.js` 완성 (**2일차 오전까지 머지** → A가 사용)
- [ ] `createBook(values)` → 성공 시 `/books/:새id`
- [ ] 실패 시 입력값 유지 + 에러 메시지
- 시나리오: S-02 (1~3, 2a, 2b)

### 8-3. 03 도서상세 — B
- [ ] `getBook(id)` → 표지(`BookCover lg`), 제목, 저자, 작성일, 수정일, 본문
- [ ] 404 → "존재하지 않는 도서입니다" + 목록 링크
- [ ] [수정] → `/books/:id/edit`, [AI 표지 생성] → `/books/:id/cover`
- [ ] [삭제] → `window.confirm('정말 삭제하시겠습니까?')` → `deleteBook(id)` → `/books`
- 시나리오: S-01 (6~7, 6a), S-04

### 8-4. 04 도서수정 — A
- [ ] `getBook(id)` → 로딩 끝난 뒤 `BookForm`에 `initialValues` 전달
- [ ] `updateBook(id, values)` → `/books/:id`
- [ ] 작성일은 표시만, 수정 불가
- 시나리오: S-03

> **주의**: `getBook`이 끝나기 전에 `BookForm`을 렌더링하면 빈 값으로 초기화된다. **book을 받은 뒤에만** 렌더링할 것.

### 8-5. 05 AI표지생성 — E
- [ ] `getBook(id)` → 현재 표지 + 제목·저자 표시 (어떤 책인지 확인용)
- [ ] API Key 입력 (`type="password"`, state에만 보관 — R7)
- [ ] 모델·크기 고정 표시, 품질 select, **비용 안내 문구**
- [ ] [생성]: Key 빈 값 차단 → `loading` ON(버튼 비활성화, "생성 중...") → `buildCoverPrompt(book)` → `generateCoverImage()` → `preview` state
- [ ] 미리보기 표시 → [이 표지로 저장] → `saveCover(id, preview)` → `/books/:id` / [다시 생성]
- [ ] 에러: 401 → Key 확인 / 429 → 잠시 후 재시도 / 0 → 네트워크 / -1 → 응답 형식
- [ ] [취소] → `/books/:id` (미리보기는 버려짐)
- 시나리오: S-02 (5~10, 6a~8d), S-06

---

## 9. 프롬프트 템플릿 (E, 초안)

`utils/prompt.js`

```js
const MAX_CONTENT = 500;   // D3

export function buildCoverPrompt({ title, author, content }) {
  const summary = content.length > MAX_CONTENT ? `${content.slice(0, MAX_CONTENT)}...` : content;
  return [
    'Create a vertical book cover illustration.',
    `Book title: "${title}"`,
    `Author: ${author}`,
    `Story / content: ${summary}`,
    'Capture the mood, genre and key imagery of the content.',
    'Leave clean space at the top for the title.',
    'Do not add any text, letters or watermarks to the image.',
  ].join('\n');
}
```

- **텍스트를 넣지 않는 이유**: 이미지 모델의 한글 렌더링 품질은 실제로 확인되지 않았다. 글자가 깨지면 표지가 망가지므로 우선 이미지만 생성하고, 제목은 화면에서 HTML로 표시한다
- 3일차에 2~3개 도서로 테스트한 뒤 문구 조정 (예: 화풍 지정 "watercolor", "minimal" 등)

---

## 10. CSS 규칙

- 방식: 컴포넌트별 일반 CSS 파일 + `styles/variables.css`의 CSS 변수 (D8)
- 클래스명은 **컴포넌트명으로 시작** → 다른 사람 CSS와 충돌 방지
  - `BookCard.css` → `.book-card`, `.book-card__title`
  - `BookListPage.css` → `.book-list-page`, `.book-list-page__grid`
- 색·간격은 **변수만 사용** (페이지 CSS에 hex 직접 쓰지 않기)

`styles/variables.css` (B, 와이어프레임 색 기준)
```css
:root {
  --color-bg: #F5F5F4;
  --color-surface: #FFFFFF;
  --color-border: #D6D3D1;
  --color-text: #262626;
  --color-text-sub: #57534E;
  --color-primary: #1D4ED8;
  --color-primary-hover: #1E3A8A;
  --color-danger: #B91C1C;
  --color-success: #166534;
  --color-placeholder: #E7E5E4;

  --radius: 8px;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  --content-width: 1120px;
  --form-width: 720px;
  --tap-min: 44px;           /* 버튼·입력 최소 높이 */
}
```

`styles/global.css` (B)에 공통 버튼 클래스 제공 → 각 페이지는 가져다 쓰기만
```css
.btn { min-height: var(--tap-min); padding: 0 20px; border-radius: var(--radius); font: inherit; cursor: pointer; }
.btn--primary { background: var(--color-primary); color: #fff; border: 0; }
.btn--secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
.btn--danger { background: var(--color-danger); color: #fff; border: 0; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
```

---

## 11. Git 규칙

| 항목 | 규칙 |
|---|---|
| 기본 브랜치 | `main` — 직접 push 금지 (사전 작업 A의 최초 커밋만 예외) |
| 작업 브랜치 | `feat/<페이지 또는 컴포넌트>` 예: `feat/book-list`, `feat/common-components`, `feat/cover-generate` |
| 커밋 메시지 | `feat: 도서 목록 조회 연동` / `fix:` / `style:` / `docs:` / `refactor:` |
| 머지 | GitHub PR → 1명 이상 확인 후 머지 |
| 작업 시작 전 | `git pull origin main` → 내 브랜치에 반영 |
| 커밋 금지 | `node_modules/`, API Key가 들어간 모든 것 |

---

## 12. 완료 기준 (각자 PR 올리기 전 확인)

- [ ] 내 페이지가 json-server 켜진 상태에서 동작한다
- [ ] json-server를 **끄고** 들어가도 에러 메시지가 보인다 (흰 화면 X)
- [ ] 페이지·컴포넌트 안에 `fetch(`가 없다 (R1)
- [ ] 남의 파일을 수정하지 않았다
- [ ] `console.log`를 지웠다
- [ ] 02-scenarios.md의 내 시나리오를 직접 해봤다

---

## 부록 A. React Router를 쓰지 않을 경우 (D7 변경)

바뀌는 곳은 **App.jsx와 페이지의 "id 받기·이동" 부분**뿐이다. api·컴포넌트·CSS는 그대로.

| Router | state 전환 |
|---|---|
| `useParams()`로 id | props `id`로 받음 |
| `navigate('/books/2')` | props `onNavigate('detail', 2)` 호출 |
| `<Link to=...>` | `<button onClick={() => onNavigate(...)}>` |

```jsx
// App.jsx (state 전환 버전)
const [route, setRoute] = useState({ page: 'list', id: null });
const go = (page, id = null) => setRoute({ page, id });
// {route.page === 'detail' && <BookDetailPage id={route.id} onNavigate={go} />} ...
```
- 잃는 것: 새로고침 시 목록으로 돌아감, 브라우저 뒤로가기 안 됨, 시나리오 S-01 6a(주소 직접 입력) 테스트 불가
