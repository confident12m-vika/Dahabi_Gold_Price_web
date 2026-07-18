import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, onSave, saveLabel, cancelLabel }) {
  if (!open) return null;
  return createPortal(
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>{cancelLabel}</button>
          <button className="btn btn-gold" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
