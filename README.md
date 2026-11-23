# 도서관리 시스템 (Frontend)

AI 표지 생성을 지원하는 도서관리 시스템 — React 19 · Vite · json-server · OpenAI GPT Image

## 시작하기

Node.js 22.22.0 이상 권장.

```bash
git clone https://github.com/hanseungye/html-mini-aivle.git
cd html-mini-aivle
npm install
```

### 1. 환경변수 설정

프로젝트 루트의 `.env` 파일에 **자신의 OpenAI API 키**를 입력하세요.

```dotenv
API_KEY=여기에_실제_OpenAI_API_키_입력
VITE_API_BASE=http://localhost:3000
```

- `.env`와 `.env.*`는 `.gitignore`에 의해 Git 추적 대상에서 제외됩니다.
- `.env.example`은 값이 비어 있는 공유용 예시입니다.
- `API_KEY`는 Node.js AI 서버에서만 읽습니다. React 코드에서 `VITE_API_KEY`처럼 노출하지 마세요.
- `.env`를 변경했다면 해당 서버를 재시작하세요.

### 2. 서버 실행 (터미널 3개)

```bash
npm run server   # 터미널 1: 도서 CRUD 서버 http://localhost:3000/books
npm run ai       # 터미널 2: AI 이미지 서버 http://127.0.0.1:3100
npm run dev      # 터미널 3: React http://localhost:5173
```

- `src/services/bookApi.js`는 `VITE_API_BASE`를 통해 포트 3000의 json-server로 통신합니다.
- `src/services/coverApi.js`는 `/api/cover`를 호출하며, Vite 프록시가 포트 3100으로 전달합니다.
- OpenAI API를 호출하려면 **실제 API 키**, API 사용 권한 및 결제 설정이 필요합니다.

## 작업 규칙
- 작업 전 `git pull origin main` → `git checkout -b feat/<담당>`
- 서버 통신은 `src/services/`에서만 (페이지에서 `fetch` 직접 호출 금지)
- 남의 파일은 수정하지 않고 담당자에게 요청
- 문서: `docs/` (기능명세 · 시나리오 · API · 개발 가이드)

## HTML + CSS 전환
- `@mui/material`, `@emotion/react`, `@emotion/styled` 의존성 제거
- 화면: 시맨틱 HTML 요소(`section`, `article`, `form`, `input`, `textarea`, `button`) 및 일반 CSS
- 서비스(`src/services/`)와 라우팅은 기존 방식을 유지합니다.
- 목록 카드 삭제 버튼은 원본에서 핸들러가 연결되지 않아, 기존 `deleteBook()` API로 연결했습니다.
- AI 표지 기능은 별도의 OpenAI 서버 실행과 API 키 설정이 필요합니다. `server/ai-server.mjs`를 확인하세요.

## 실행 환경 참고
- 첨부된 원본 프로젝트의 `react-router@8.5.2`는 Node.js 22.22.0 이상을 요구합니다.
- 이 변환 작업에서는 의존성 잠금 파일을 갱신했지만, 작업 환경의 패키지 설치가 완료되지 않아 `npm run build`와 `npm run lint` 실행 검증은 완료하지 못했습니다.

## 환경변수 파일 Git 보호

- `.gitignore`에 `.env`, `.env.*`가 등록되어 있어 하위 폴더의 환경변수 파일도 새로 추적되지 않습니다.
- `.env.example`은 실제 비밀키를 제외한 예시 파일로만 관리할 수 있습니다.
- 이미 Git에서 추적 중인 `.env`가 있다면 `git rm --cached .env` 후 커밋해야 합니다. 하위 폴더라면 정확한 경로(예: `server/.env`)로 지정하세요.
- `git check-ignore -v .env`로 제외 규칙을 확인할 수 있습니다.
- 과거 커밋에 API 키가 올라갔다면 `.gitignore`만으로 제거되지 않으므로 키를 즉시 폐기·재발급해야 합니다.
