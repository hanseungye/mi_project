import './BookEdit.css';
import { useNavigate, useParams } from 'react-router';
import { updateBook } from '../services/bookApi';


// TODO(담당자): 04-dev-guide.md 8절 체크리스트 참고
export default function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    // PATCH /books/:id
    await updateBook(id, values);

    // 수정 완료 후 상세 페이지로 이동
    navigate(`/books/${id}`);
  }  
  return (
    <section className="book-edit">
      <h1>도서 수정</h1>
      <p>작업 중입니다.</p>
    </section>
  );
}
