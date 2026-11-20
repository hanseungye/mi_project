import './CoverGenerator.css';

// TODO(AI 담당): API Key 입력 → 생성 → 미리보기 → [이 표지로 저장]
// props(안): book, onSaved(updatedBook)
// 사용 예 (BookDetail 안):
//   <Modal open={isOpen} title="AI 표지 생성" onClose={close}>
//     <CoverGenerator book={book} onSaved={(b) => { setBook(b); close(); }} />
//   </Modal>
export default function CoverGenerator() {
  return <div className="cover-generator">AI 표지 생성 작업 중</div>;
}
