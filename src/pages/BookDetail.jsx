
import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
} from '@mui/material';

import { getBook, deleteBook } from '../services/bookApi';
import { formatDate } from '../utils/date';
import BookCover from '../components/BookCover';
import Modal from '../components/Modal';
import CoverGenerator from '../features/ai-cover/CoverGenerator';

import './BookDetail.css';

export default function BookDetail() {
  // URL의 도서 ID
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 도서 정보
  const [book, setBook] = useState(null);

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // AI 표지 생성 모달 표시 여부
  const isCoverOpen =
    searchParams.get('generateCover') === '1';

  // 1. GET - 도서 상세 조회
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

  // 2. DELETE - 도서 삭제
  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      '정말 이 도서를 삭제하시겠습니까?'
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setDeleteError('');

      // JSON Server에 DELETE 요청
      await deleteBook(id);

      // 삭제 성공 시 도서 목록으로 이동
      navigate('/books', { replace: true });
    } catch (err) {
      setDeleteError(
        err.message || '도서 삭제에 실패했습니다.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // 3. AI 표지 생성 모달 열기
  const handleOpenCover = () => {
    setSearchParams({ generateCover: '1' });
  };

  // 4. AI 표지 생성 모달 닫기
  const handleCloseCover = () => {
    setSearchParams({}, { replace: true });
  };

  // 5. AI 표지 저장 후 상세 정보 갱신
  const handleCoverSaved = (updatedBook) => {
    setBook(updatedBook);
    handleCloseCover();
  };

  // 로딩 화면
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 상세 조회 실패
  if (error || !book) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          {error || '도서 정보를 찾을 수 없습니다.'}
        </Alert>

        <Button
          component={Link}
          to="/books"
          sx={{ mt: 2 }}
        >
          도서 목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box className="book-detail" sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* 상단 제목 및 목록 이동 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          도서 상세 정보
        </Typography>

        <Button component={Link} to="/books" variant="outlined">
          목록으로
        </Button>
      </Box>

      {/* 도서 상세 카드 */}
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
          }}
        >
          {/* 도서 표지 */}
          <Box sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}>
            <BookCover
              src={book.coverImageUrl}
              title={book.title}
              size="lg"
            />
          </Box>

          {/* 도서 정보 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {book.title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              저자: {book.author}
            </Typography>

            <Typography variant="body2" sx={{ mt: 2 }}>
              등록일: {formatDate(book.createdAt)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              수정일: {formatDate(book.updatedAt)}
            </Typography>

            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
              도서 내용
            </Typography>

            <Typography
              sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                lineHeight: 1.8,
              }}
            >
              {book.content}
            </Typography>
          </Box>
        </Box>

        {/* 삭제 오류 */}
        {deleteError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {deleteError}
          </Alert>
        )}

        {/* 하단 기능 버튼 */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 1.5,
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            component={Link}
            to={`/books/${id}/edit`}
            disabled={deleting}
          >
            수정
          </Button>

          <Button
            variant="contained"
            onClick={handleOpenCover}
            disabled={deleting}
          >
            AI 표지 생성
          </Button>

          <Button
            color="error"
            variant="outlined"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Box>
      </Card>

      {/* AI 표지 생성 모달 */}
      <Modal
        open={isCoverOpen}
        title="AI 표지 생성"
        onClose={handleCloseCover}
      >
        <CoverGenerator
          book={book}
          onSaved={handleCoverSaved}
        />
      </Modal>
    </Box>
  );
}
