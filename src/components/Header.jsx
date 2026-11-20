import { Link, NavLink } from 'react-router';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <Link to="/books" className="header__logo">도서관리</Link>
      <nav className="header__nav" aria-label="주요 메뉴">
        <NavLink to="/books" end className="header__link">도서 목록</NavLink>
        <NavLink to="/books/new" className="btn btn--primary">+ 새 도서 등록</NavLink>
      </nav>
    </header>
  );
}
