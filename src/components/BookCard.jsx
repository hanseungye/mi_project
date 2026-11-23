import { Link } from 'react-router';
import BookCover from './BookCover';
import { formatDate } from '../utils/date';
import './BookCard.css';

export default function BookCard({ book, onDelete, deleting = false }) {
  return (
    <div className="book-card">
      <Link to={`/books/${book.id}`} className="book-card__detail">
        <BookCover src={book.coverImageUrl} title={book.title} size="sm" />
        <strong className="book-card__title">{book.title}</strong>
        <span className="book-card__meta">{book.author} · {formatDate(book.createdAt)}</span>
      </Link>
      <div className="book-card__actions">
        <Link to={`/books/${book.id}/edit`} className={`btn btn--secondary btn--small ${deleting ? 'btn--disabled' : ''}`} aria-disabled={deleting} tabIndex={deleting ? -1 : undefined} onClick={(e) => { if (deleting) e.preventDefault(); }}>
          수정
        </Link>
        <button type="button" className="btn btn--outline-danger btn--small" onClick={() => onDelete(book)} disabled={deleting || !onDelete}>
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
}
