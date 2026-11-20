import './BookForm.css';

// TODO(등록 담당): 04-dev-guide.md 7-4 계약대로 구현
// props: initialValues, onSubmit(values) => Promise, onCancel, submitLabel
export default function BookForm({ submitLabel = '저장' }) {
  return (
    <form className="book-form">
      <p>BookForm 작업 중 ({submitLabel})</p>
    </form>
  );
}
