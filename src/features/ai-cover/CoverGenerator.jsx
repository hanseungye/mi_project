
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { generateCoverImage } from '../../services/coverApi';
import { saveCover } from '../../services/bookApi';
import { buildCoverPrompt } from '../../utils/prompt';

import './CoverGenerator.css';

export default function CoverGenerator({ book, onSaved }) {
  const [preview, setPreview] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI 표지 생성
  const handleGenerate = async () => {
    if (!book || generating || saving) return;

    try {
      setGenerating(true);
      setError('');
      setPreview('');

      const prompt = buildCoverPrompt(book);

      const image = await generateCoverImage({
        prompt,
        quality: 'low',
      });

      setPreview(image);
    } catch (err) {
      setError(err.message || '표지 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // 생성한 표지를 db.json에 저장
  const handleSave = async () => {
    if (!preview || saving) return;

    try {
      setSaving(true);
      setError('');

      const updatedBook = await saveCover(book.id, preview);

      onSaved?.(updatedBook);
    } catch (err) {
      setError(err.message || '표지 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!book) {
    return <Alert severity="warning">도서 정보가 없습니다.</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {book.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          저자: {book.author}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      <Box
        sx={{
          minHeight: 280,
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {generating ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              AI가 표지를 생성하고 있습니다...
            </Typography>
          </Box>
        ) : preview ? (
          <Box
            component="img"
            src={preview}
            alt={`${book.title} AI 표지 미리보기`}
            sx={{
              width: '100%',
              maxWidth: 280,
              aspectRatio: '2 / 3',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Typography color="text.secondary">
            AI 표지를 생성해 보세요.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleGenerate}
          disabled={generating || saving}
        >
          {preview ? '다시 생성' : 'AI 표지 생성'}
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={!preview || generating || saving}
        >
          {saving ? '저장 중...' : '이 표지로 저장'}
        </Button>
      </Box>
    </Box>
  );
}
