
import { Link } from 'react-router';
import { Button } from '@mui/material';

import BookCover from './BookCover';
import { formatDate } from '../utils/date';

import './BookCard.css';

export default function BookCard({
  book,
  onDelete,
  deleting = false,
}) {
  return (
    <div className="book-card">

      {/* 도서 상세 페이지 이동 */}
      <Link
        to={`/books/${book.id}`}
        className="book-card__detail"
      >
        <BookCover
          src={book.coverImageUrl}
          title={book.title}
          size="sm"
        />

        <strong className="book-card__title">
          {book.title}
        </strong>

        <span className="book-card__meta">
          {book.author} · {formatDate(book.createdAt)}
        </span>
      </Link>

      {/* 수정 및 삭제 버튼 */}
      <div className="book-card__actions">

        {/* 수정 버튼 */}
        <Button
          component={Link}
          to={`/books/${book.id}/edit`}
          variant="outlined"
          size="small"
          disabled={deleting}
        >
          수정
        </Button>

        {/* 삭제 버튼 */}
        <Button
          type="button"
          color="error"
          variant="outlined"
          size="small"
          onClick={() => onDelete(book)}
          disabled={deleting}
        >
          {deleting ? '삭제 중...' : '삭제'}
        </Button>

      </div>
    </div>
  );
}
