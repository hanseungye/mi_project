import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router';
import Header from './components/Header';
import BookList from './pages/BookList';
import BookCreate from './pages/BookCreate';
import BookDetail from './pages/BookDetail';
import BookEdit from './pages/BookEdit';

// 라우팅만 담당. AI 표지 생성은 BookDetail 안에서 모달로 연다.
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookCreate />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<BookEdit />} />
          <Route
            path="*"
            element={<p>페이지를 찾을 수 없습니다. <Link to="/books">목록으로</Link></p>}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
