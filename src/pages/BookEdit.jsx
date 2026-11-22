
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { getBook, updateBook } from '../services/bookApi';
import BookForm from '../components/BookForm';
import './BookEdit.css';

export default function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. 기존 도서 데이터 조회 (GET)
  useEffect(() => {
    let active = true;

    async function fetchBook() {
      try {
        setLoading(true);
        setError('');
        setBook(null);

        const data = await getBook(id);

        if (active) {
          setBook(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.status === 404
              ? '존재하지 않는 도서입니다.'
              : err.message || '도서 조회에 실패했습니다.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchBook();

    return () => {
      active = false;
    };
  }, [id]);

  // 2. 도서 수정 (PATCH)
  const handleSubmit = async (values) => {
    // bookApi.js에서 PATCH 요청 실행
    const updatedBook = await updateBook(id, values);

    // 성공 시 상세 페이지로 이동
    navigate(`/books/${updatedBook.id}`, {
      replace: true,
    });
  };

  // 3. 취소
  const handleCancel = () => {
    navigate(`/books/${id}`);
  };

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          도서 정보를 불러오는 중입니다.
        </Typography>
      </Box>
    );
  }

  // 조회 실패
  if (error || !book) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          {error || '도서 정보가 없습니다.'}
        </Alert>

        <Button
          component={Link}
          to="/books"
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <section className="book-edit">
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700}>
          도서 정보 수정
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          수정할 내용을 입력한 후 저장 버튼을 눌러주세요.
        </Typography>

        {/* 도서 등록과 동일한 BookForm 재사용 */}
        <BookForm
          key={id}
          initialValues={{
            title: book.title,
            author: book.author,
            content: book.content,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="수정 완료"
        />
      </Box>
    </section>
  );
}
