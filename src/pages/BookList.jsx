import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getBooks, deleteBook } from '../services/bookApi';
import BookCard from '../components/BookCard';
import './BookList.css';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchBooks() {
      try {
        setLoading(true);
        setError('');
        const data = await getBooks();
        if (!Array.isArray(data)) throw new Error('도서 목록 데이터가 배열이 아닙니다.');
        if (active) setBooks(data);
      } catch (err) {
        if (active) { setBooks([]); setError(err.message || '도서 목록 조회에 실패했습니다.'); }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchBooks();
    return () => { active = false; };
  }, []);

  const handleDelete = async (book) => {
    if (deletingId !== null || !window.confirm(`'${book.title}' 도서를 삭제하시겠습니까?`)) return;
    try {
      setDeletingId(book.id);
      setError('');
      await deleteBook(book.id);
      setBooks((prev) => prev.filter((item) => String(item.id) !== String(book.id)));
    } catch (err) {
      setError(err.message || '도서 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books.filter((book) =>
    `${book.title ?? ''} ${book.author ?? ''}`.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  return (
    <section className="book-list">
      <div className="book-list__heading">
        <div><h1>나만의 작은 서재</h1><p className="muted">등록된 도서를 확인하고 관리할 수 있습니다.</p></div>
        <Link className="btn btn--primary" to="/books/new">+ 도서 등록</Link>
      </div>
      <div className="book-list__toolbar">
        <h2>전체 도서 ({books.length})</h2>
        <input type="search" className="field__input book-list__search" placeholder="책 제목 또는 저자 검색"
          aria-label="도서 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading ? (
        <div className="loading" role="status"><span className="spinner" aria-hidden="true" />도서 목록을 불러오는 중입니다.</div>
      ) : filteredBooks.length === 0 ? (
        <p className="notice notice--info">{keyword ? '검색 결과가 없습니다.' : '등록된 도서가 없습니다.'}</p>
      ) : (
        <div className="book-list__grid">
          {filteredBooks.map((book) => (
            <article className="book-list__item" key={book.id}>
              <BookCard book={book} onDelete={handleDelete} deleting={deletingId !== null} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
