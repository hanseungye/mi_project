// 도서 CRUD — 서버 통신은 이 파일에서만 (페이지에서 fetch 직접 호출 금지)
// Spring Boot 전환 시: .env 주소 변경 + 서버가 날짜를 넣으면 now() 관련 줄 삭제
const API_BASE = import.meta.env.VITE_API_BASE;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; // 0 = 네트워크 오류, 404, 500 ...
  }
}

async function request(path, { method = 'GET', body } = {}) {
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

  if (method === 'DELETE' || res.status === 204) return null; // 본문 파싱 안 함
  return res.json();
}

const now = () => new Date().toISOString();

export function getBooks() {
  return request('/books?_sort=createdAt&_order=desc');
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
    body: { ...changes, updatedAt: now() },
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, { method: 'DELETE' });
}

export function saveCover(id, coverImageUrl) {
  return updateBook(id, { coverImageUrl });
}
