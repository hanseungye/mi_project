import { Link } from 'react-router';
import BookCover from './BookCover';
import { formatDate } from '../utils/date';
import './BookCard.css';

// TODO(목록 담당): 디자인에 맞게 수정
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <BookCover src={book.coverImageUrl} title={book.title} size="sm" />
      <strong className="book-card__title">{book.title}</strong>
      <span className="book-card__meta">{book.author} · {formatDate(book.createdAt)}</span>
    </Link>
  );
}
