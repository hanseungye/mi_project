import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { getBook, deleteBook } from '../services/bookApi';
import { formatDate } from '../utils/date';
import BookCover from '../components/BookCover';
import Modal from '../components/Modal';
import CoverGenerator from '../features/ai-cover/CoverGenerator';
import './BookDetail.css';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const isCoverOpen = searchParams.get('generateCover') === '1';

  useEffect(() => {
    let active = true;
    async function fetchBook() {
      try {
        setLoading(true); setError(''); setBook(null);
        const data = await getBook(id);
        if (active) setBook(data);
      } catch (err) {
        if (active) setError(err.status === 404 ? '존재하지 않는 도서입니다.' : err.message || '도서 조회에 실패했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchBook();
    return () => { active = false; };
  }, [id]);

  const handleDelete = async () => {
    if (deleting || !window.confirm('정말 이 도서를 삭제하시겠습니까?')) return;
    try {
      setDeleting(true); setDeleteError('');
      await deleteBook(id);
      navigate('/books', { replace: true });
    } catch (err) {
      setDeleteError(err.message || '도서 삭제에 실패했습니다.');
    } finally { setDeleting(false); }
  };
  const handleCloseCover = () => setSearchParams({}, { replace: true });
  const handleCoverSaved = (updatedBook) => { setBook(updatedBook); handleCloseCover(); };

  if (loading) return <div className="loading" role="status"><span className="spinner" aria-hidden="true" />도서 정보를 불러오는 중입니다.</div>;
  if (error || !book) return (
    <section className="book-detail">
      <p className="notice notice--error" role="alert">{error || '도서 정보를 찾을 수 없습니다.'}</p>
      <Link className="btn btn--secondary" to="/books">도서 목록으로</Link>
    </section>
  );

  return (
    <section className="book-detail">
      <div className="book-detail__heading">
        <h1>도서 상세 정보</h1>
        <Link className="btn btn--secondary" to="/books">목록으로</Link>
      </div>
      <article className="book-detail__card">
        <div className="book-detail__body">
          <div className="book-detail__cover"><BookCover src={book.coverImageUrl} title={book.title} size="lg" /></div>
          <div className="book-detail__info">
            <h2>{book.title}</h2>
            <p className="muted">저자: {book.author}</p>
            <p className="book-detail__date">등록일: {formatDate(book.createdAt)}</p>
            <p className="muted">수정일: {formatDate(book.updatedAt)}</p>
            <h3>도서 내용</h3>
            <p className="book-detail__content">{book.content}</p>
          </div>
        </div>
        {deleteError && <p className="notice notice--error" role="alert">{deleteError}</p>}
        <div className="book-detail__actions">
          <Link className={`btn btn--secondary ${deleting ? 'btn--disabled' : ''}`} to={`/books/${id}/edit`}
            aria-disabled={deleting} tabIndex={deleting ? -1 : undefined} onClick={(e) => { if (deleting) e.preventDefault(); }}>수정</Link>
          <button type="button" className="btn btn--primary" onClick={() => setSearchParams({ generateCover: '1' })} disabled={deleting}>AI 표지 생성</button>
          <button type="button" className="btn btn--outline-danger" onClick={handleDelete} disabled={deleting}>{deleting ? '삭제 중...' : '삭제'}</button>
        </div>
      </article>
      <Modal open={isCoverOpen} title="AI 표지 생성" onClose={handleCloseCover}>
        <CoverGenerator book={book} onSaved={handleCoverSaved} />
      </Modal>
    </section>
  );
}
