export const LIMITS = { title: 50, author: 20, content: 2000 };
const LABELS = { title: '제목', author: '저자', content: '내용' };

// 반환: { title?, author?, content? } — 빈 객체면 통과
export function validateBook(values) {
  const errors = {};
  for (const key of Object.keys(LIMITS)) {
    const v = (values[key] ?? '').trim();
    if (!v) errors[key] = `${LABELS[key]}을(를) 입력하세요`;
    else if (v.length > LIMITS[key]) errors[key] = `${LABELS[key]}은(는) ${LIMITS[key]}자 이하로 입력하세요`;
  }
  return errors;
}
