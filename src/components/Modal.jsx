import './Modal.css';

// open이 true일 때만 표시. 배경 클릭 또는 [닫기]로 onClose 호출
export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="btn btn--secondary" onClick={onClose}>닫기</button>
        </div>
        {children}
      </div>
    </div>
  );
}
