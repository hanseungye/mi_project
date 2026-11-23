import { useState } from 'react';
import { validateBook, LIMITS } from '../utils/validate';
import './BookForm.css';

export default function BookForm({
  initialValues = { title: '', author: '', content: '' },
  onSubmit,
  onCancel,
  submitLabel = '저장',
}) {
  const [values, setValues] = useState(() => ({
    title: initialValues.title ?? '',
    author: initialValues.author ?? '',
    content: initialValues.content ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

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
      await onSubmit({
        title: values.title.trim(),
        author: values.author.trim(),
        content: values.content.trim(),
      });
    } catch (error) {
      setSubmitError(error?.message || '도서 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (name, label, placeholder, multiline = false) => (
    <div className="field" key={name}>
      <label htmlFor={`book-${name}`} className="field__label">{label} <span aria-hidden="true">*</span></label>
      {multiline ? (
        <textarea id={`book-${name}`} className={`field__input ${errors[name] ? 'field__input--error' : ''}`}
          name={name} placeholder={placeholder} value={values[name]} onChange={handleChange}
          disabled={submitting} maxLength={LIMITS[name]} rows={8} required aria-invalid={Boolean(errors[name])}
          aria-describedby={`book-${name}-helper`} />
      ) : (
        <input id={`book-${name}`} className={`field__input ${errors[name] ? 'field__input--error' : ''}`}
          type="text" name={name} placeholder={placeholder} value={values[name]} onChange={handleChange}
          disabled={submitting} maxLength={LIMITS[name]} required aria-invalid={Boolean(errors[name])}
          aria-describedby={`book-${name}-helper`} />
      )}
      <div id={`book-${name}-helper`} className="field__helper">
        <span className="field__error">{errors[name] || ''}</span>
        <span className="field__count">{values[name].length}/{LIMITS[name]}</span>
      </div>
    </div>
  );

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <header className="book-form__heading">
        <h2>도서 정보</h2>
        <p className="muted">도서의 기본 정보를 입력해 주세요. 모든 항목은 필수입니다.</p>
      </header>
      <div className="book-form__fields">
        {renderField('title', '도서 제목', '도서 제목을 입력하세요')}
        {renderField('author', '저자', '저자명을 입력하세요')}
        {renderField('content', '도서 내용', '도서 내용을 입력하세요', true)}
      </div>
      {submitError && <p className="notice notice--error" role="alert">{submitError}</p>}
      <div className="book-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={submitting}>취소</button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? <><span className="spinner spinner--small" aria-hidden="true" />저장 중...</> : submitLabel}
        </button>
      </div>
    </form>
  );
}
