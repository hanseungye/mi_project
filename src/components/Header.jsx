import { Link, NavLink } from 'react-router';
import { SquareMenu, Plus } from 'lucide-react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      {/* 로고 */}
      <Link to="/books" className="header__logo">
        BOOKSPACE
      </Link>

      {/* 네비게이션 */}
      <nav className="header__nav" aria-label="주요 메뉴">

        {/* 내 서재 */}
        <NavLink
          to="/books"
          end
          className="header__link"
        >
          <SquareMenu size={18} />
          <span>내 서재</span>
        </NavLink>

        {/* 도서 등록 */}
        <NavLink
          to="/books/new"
          className="btn btn--primary"
        >
          <Plus size={18} />
          <span>도서 등록</span>
        </NavLink>

      </nav>
    </header>
  );
}