import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getBook, updateBook } from '../services/bookApi';
import BookForm from '../components/BookForm';
import './BookEdit.css';

export default function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function fetchBook() {
      try {
        setLoading(true); setError(''); setBook(null);
        const data = await getBook(id);
        if (active) setBook(data);
      } catch (err) {
        if (active) setError(err.status === 404 ? '존재하지 않는 도서입니다.' : err.message || '도서 조회에 실패했습니다.');
      } finally { if (active) setLoading(false); }
    }
    fetchBook();
    return () => { active = false; };
  }, [id]);
  const handleSubmit = async (values) => {
    const updatedBook = await updateBook(id, values);
    navigate(`/books/${updatedBook.id}`, { replace: true });
  };
  if (loading) return <div className="loading" role="status"><span className="spinner" aria-hidden="true" />도서 정보를 불러오는 중입니다.</div>;
  if (error || !book) return (
    <section className="book-edit">
      <p className="notice notice--error" role="alert">{error || '도서 정보가 없습니다.'}</p>
      <Link className="btn btn--secondary" to="/books">목록으로 돌아가기</Link>
    </section>
  );
  return (
    <section className="book-edit">
      <h1>도서 정보 수정</h1>
      <p className="muted">수정할 내용을 입력한 후 저장 버튼을 눌러주세요.</p>
      <BookForm key={id} initialValues={{ title: book.title, author: book.author, content: book.content }}
        onSubmit={handleSubmit} onCancel={() => navigate(`/books/${id}`)} submitLabel="수정 완료" />
    </section>
  );
}
