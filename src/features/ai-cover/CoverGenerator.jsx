import { useState } from 'react';
import { generateCoverImage } from '../../services/coverApi';
import { saveCover } from '../../services/bookApi';
import { buildCoverPrompt } from '../../utils/prompt';
import './CoverGenerator.css';

export default function CoverGenerator({ book, onSaved }) {
  const [preview, setPreview] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleGenerate = async () => {
    if (!book || generating || saving) return;
    try {
      setGenerating(true); setError(''); setPreview('');
      const image = await generateCoverImage({ prompt: buildCoverPrompt(book), quality: 'low' });
      setPreview(image);
    } catch (err) { setError(err.message || '표지 생성에 실패했습니다.'); }
    finally { setGenerating(false); }
  };
  const handleSave = async () => {
    if (!preview || saving) return;
    try {
      setSaving(true); setError('');
      const updatedBook = await saveCover(book.id, preview);
      onSaved?.(updatedBook);
    } catch (err) { setError(err.message || '표지 저장에 실패했습니다.'); }
    finally { setSaving(false); }
  };
  if (!book) return <p className="notice notice--warning">도서 정보가 없습니다.</p>;
  return (
    <section className="cover-generator">
      <header><h3>{book.title}</h3><p className="muted">저자: {book.author}</p></header>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      <div className="cover-generator__preview" aria-live="polite">
        {generating ? (
          <div className="loading"><span className="spinner" aria-hidden="true" /><p>AI가 표지를 생성하고 있습니다...</p></div>
        ) : preview ? (
          <img src={preview} alt={`${book.title} AI 표지 미리보기`} className="cover-generator__image" />
        ) : (
          <p className="muted">AI 표지를 생성해 보세요.</p>
        )}
      </div>
      <div className="cover-generator__actions">
        <button type="button" className="btn btn--secondary" onClick={handleGenerate} disabled={generating || saving}>{preview ? '다시 생성' : 'AI 표지 생성'}</button>
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!preview || generating || saving}>{saving ? '저장 중...' : '이 표지로 저장'}</button>
      </div>
    </section>
  );
}
