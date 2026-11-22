
import { useNavigate } from 'react-router';
import BookForm from '../components/BookForm';
import { createBook } from '../services/bookApi';
import './BookCreate.css';

export default function BookCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    // 1. JSON Server에 도서 정보 저장
    const createdBook = await createBook(values);

    // 2. 서버에서 생성한 도서 ID 확인
    if (createdBook?.id == null) {
      throw new Error('도서 ID를 확인할 수 없습니다.');
    }

    // 3. 저장 성공 후 AI 표지 생성 모달을 열도록 이동
    navigate(`/books/${createdBook.id}?generateCover=1`);
  };

  return (
    <section className="book-create">
      <h1>새 도서 등록</h1>
      <p>새로운 도서 정보를 입력해 주세요.</p>

      <BookForm
        initialValues={{
          title: '',
          author: '',
          content: '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/books')}
        submitLabel="등록"
      />
    </section>
  );
}
