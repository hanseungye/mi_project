
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import { validateBook, LIMITS } from '../utils/validate';
import './BookForm.css';

export default function BookForm({
  initialValues = { title: '', author: '', content: '' },
  onSubmit,
  onCancel,
  submitLabel = '저장',
}) {
  // 입력 데이터 관리
  const [values, setValues] = useState(() => ({
    title: initialValues.title ?? '',
    author: initialValues.author ?? '',
    content: initialValues.content ?? '',
  }));

  // 유효성 검사 오류
  const [errors, setErrors] = useState({});

  // API 요청 상태
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setSubmitError('');
  };

  // 도서 등록 또는 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const validationErrors = validateBook(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      const cleanedValues = {
        title: values.title.trim(),
        author: values.author.trim(),
        content: values.content.trim(),
      };

      await onSubmit(cleanedValues);
    } catch (error) {
      setSubmitError(
        error?.message || '도서 저장에 실패했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 글자 수 안내
  const renderHelper = (field) => (
    <Box
      component="span"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1,
        width: '100%',
      }}
    >
      <Typography
        component="span"
        variant="caption"
        color={errors[field] ? 'error' : 'text.secondary'}
      >
        {errors[field] || ' '}
      </Typography>

      <Typography
        component="span"
        variant="caption"
        color="text.secondary"
      >
        {values[field].length}/{LIMITS[field]}
      </Typography>
    </Box>
  );

  return (
    <Card
      component="form"
      className="book-form"
      onSubmit={handleSubmit}
      noValidate
      variant="outlined"
      sx={{
        width: '100%',
        maxWidth: 760,
        mx: 'auto',
        mt: 3,
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* 폼 제목 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
        >
          도서 정보
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          도서의 기본 정보를 입력해 주세요.
          모든 항목은 필수입니다.
        </Typography>
      </Box>

      {/* 입력 필드 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* 도서 제목 */}
        <TextField
          fullWidth
          required
          id="book-title"
          name="title"
          label="도서 제목"
          placeholder="도서 제목을 입력하세요"
          value={values.title}
          onChange={handleChange}
          disabled={submitting}
          error={Boolean(errors.title)}
          helperText={renderHelper('title')}
          slotProps={{
            htmlInput: { maxLength: LIMITS.title },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* 저자 */}
        <TextField
          fullWidth
          required
          id="book-author"
          name="author"
          label="저자"
          placeholder="저자명을 입력하세요"
          value={values.author}
          onChange={handleChange}
          disabled={submitting}
          error={Boolean(errors.author)}
          helperText={renderHelper('author')}
          slotProps={{
            htmlInput: { maxLength: LIMITS.author },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* 도서 내용 */}
        <TextField
          fullWidth
          required
          multiline
          rows={8}
          id="book-content"
          name="content"
          label="도서 내용"
          placeholder="도서 내용을 입력하세요"
          value={values.content}
          onChange={handleChange}
          disabled={submitting}
          error={Boolean(errors.content)}
          helperText={renderHelper('content')}
          slotProps={{
            htmlInput: { maxLength: LIMITS.content },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              alignItems: 'flex-start',
            },
          }}
        />

        {/* 저장 오류 */}
        {submitError && (
          <Alert severity="error" role="alert">
            {submitError}
          </Alert>
        )}
      </Box>

      {/* 하단 버튼 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 1.5,
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={submitting}
          sx={{
            minWidth: 110,
            minHeight: 44,
            borderRadius: 2,
          }}
        >
          취소
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            minWidth: 130,
            minHeight: 44,
            borderRadius: 2,
            bgcolor: 'var(--color-primary)',
            '&:hover': {
              bgcolor: 'var(--color-primary-hover)',
            },
          }}
        >
          {submitting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={17} color="inherit" />
              저장 중...
            </Box>
          ) : (
            submitLabel
          )}
        </Button>
      </Box>
    </Card>
  );
}
