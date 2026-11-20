import './BookCover.css';

const DEFAULT_COVER = '/default-cover.png';

// size: 'sm'(목록 카드) | 'lg'(상세·모달)
export default function BookCover({ src, title, size = 'lg' }) {
  return (
    <img
      className={`book-cover book-cover--${size}`}
      src={src || DEFAULT_COVER}
      alt={src ? `${title} 표지` : `${title} (표지 없음)`}
    />
  );
}
