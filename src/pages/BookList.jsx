
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import { getBooks } from '../services/bookApi';
import BookCard from '../components/BookCard';
import './BookList.css';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
useEffect(() => {
  let active = true;

  async function fetchBooks() {
    try {
      setLoading(true);
      setError('');

      const data = await getBooks();

      // API 응답이 배열인지 검사
      if (!Array.isArray(data)) {
        throw new Error('도서 목록 데이터가 배열이 아닙니다.');
      }

      // 컴포넌트가 활성화된 경우에만 업데이트
      if (active) {
        setBooks(data);
      }
    // 에러가 발생하면
    } catch (error) {
      if (active) {
        setBooks([]);
        setError(error.message || '도서 목록 조회에 실패했습니다.');
      }
    // 에러 화면나면 대체 state
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  // 핵심: 함수를 실제로 호출
  fetchBooks();

  // 컴포넌트 언마운트 시 비활성화
  return () => {
    active = false;
  };
}, []);


  const filteredBooks = books.filter((book) =>
    `${book.title ?? ''} ${book.author ?? ''}`
      .toLowerCase()
      .includes(keyword.trim().toLowerCase())
  );

  return (
    <section className="book-list">
      {/* 상단 제목 및 등록 버튼 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            나만의 작은 서재
          </Typography>
          <Typography variant="body2" color="text.secondary">
            등록된 도서를 확인하고 관리할 수 있습니다.
          </Typography>
        </Box>

        <Button
          variant="contained"
          component={Link}
          to="/books/new"
        >
          + 도서 등록
        </Button>
      </Box>

      {/* 전체 도서 수 및 검색 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography fontWeight={600}>
          전체 도서 ({books.length})
        </Typography>

        <TextField
          size="small"
          placeholder="책 제목 또는 저자 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': '도서 검색' },
          }}
        />
      </Box>

      {/* 도서 목록 */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredBooks.length === 0 ? (
        <Alert severity="info">
          {keyword ? '검색 결과가 없습니다.' : '등록된 도서가 없습니다.'}
        </Alert>
      ) : (
        <div className="book-list__grid">
          {filteredBooks.map((book) => (
            <Card key={book.id} variant="outlined" sx={{ p: 1.5 }}>
              <BookCard book={book} />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
