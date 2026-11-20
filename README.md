# 도서관리 시스템 (Frontend)

AI 표지 생성을 지원하는 도서관리 시스템 — React 19 · Vite · json-server · OpenAI GPT Image

## 시작하기

```bash
git clone <저장소 주소>
cd book-management-frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

터미널 2개가 필요합니다.

```bash
npm run server   # 터미널 1 — json-server  → http://localhost:3000/books
npm run dev      # 터미널 2 — React        → http://localhost:5173
```

## 작업 규칙
- 작업 전 `git pull origin main` → `git checkout -b feat/<담당>`
- 서버 통신은 `src/services/`에서만 (페이지에서 `fetch` 직접 호출 금지)
- 남의 파일은 수정하지 않고 담당자에게 요청
- 문서: `docs/` (기능명세 · 시나리오 · API · 개발 가이드)
