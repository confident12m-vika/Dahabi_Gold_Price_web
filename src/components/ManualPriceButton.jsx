import { useState } from 'react';
import { useLang } from '../contexts/LangContext';

// زر سعر يدوي (بدل السويتش القديم): أيقونة، الضغط عليها يفتح حقل
// إدخال + زر "حفظ". بعد الحفظ تتحول الأيقونة للون الأخضر وتُطبَّق القيمة.
export default function ManualPriceButton({ label, applied, value, onSave, onClear, placeholder }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');

  function handleSave() {
    const num = parseFloat(draft);
    if (!num || num <= 0) return;
    onSave(draft);
    setOpen(false);
  }

  function handleIconClick() {
    if (applied) {
      // مطبّق فعلاً — الضغط يعرض خيار التعديل/الإلغاء
      setOpen((o) => !o);
    } else {
      setOpen((o) => !o);
    }
  }

  return (
    <div className="manual-price-btn-wrap">
      <button
        type="button"
        className={`manual-price-icon${applied ? ' applied' : ''}`}
        onClick={handleIconClick}
      >
        <span className="mpi-icon">✎</span>
        <span className="mpi-label">{label}</span>
        {applied && <span className="mpi-check">✓</span>}
      </button>

      {open && (
        <div className="manual-price-panel">
          <input
            type="number"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="manual-price-panel-actions">
            <button className="btn btn-gold btn-sm" onClick={handleSave}>{t('modal_save')}</button>
            {applied && (
              <button className="btn btn-outline btn-sm" onClick={() => { onClear(); setOpen(false); setDraft(''); }}>
                {t('manual_clear')}
              </button>
            )}
          </div>
        </div>
      )}

      {applied && !open && <div className="manual-price-note">{t('manual_applied_note')}</div>}
    </div>
  );
}
