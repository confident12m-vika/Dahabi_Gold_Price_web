import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../contexts/LangContext';
import { currencyName } from '../lib/currencies';

export default function CurrencySelect({ value, onChange, currencies, compact = false }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter((c) => {
      const name = currencyName(c, lang).toLowerCase();
      return c.toLowerCase().includes(q) || name.includes(q);
    });
  }, [currencies, query, lang]);

  function pick(code) {
    onChange(code);
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <button type="button" className={compact ? 'currency-pill' : 'currency-select-btn'} onClick={() => setOpen(true)}>
        <span className="cs-code">{value}</span>
        {!compact && <span className="cs-name">{currencyName(value, lang)}</span>}
        <span className="cs-chev">▾</span>
      </button>

      {open && createPortal(
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal currency-modal">
            <input
              ref={inputRef}
              type="text"
              className="currency-search"
              placeholder={t('search_currency')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="currency-list">
              {filtered.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`currency-item${c === value ? ' active' : ''}`}
                  onClick={() => pick(c)}
                >
                  <span className="cs-code">{c}</span>
                  <span className="cs-name">{currencyName(c, lang)}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="empty-hint">—</p>}
            </div>
          </div>
        </div>,
        document.body
      )}    </>
  );
}
