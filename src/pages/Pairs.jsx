import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useData } from '../contexts/DataContext';
import { gramPrice, currencyList, goldRatio, silverRatio } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';
import YemenPriceBox from '../components/YemenPriceBox';
import Modal from '../components/Modal';

export default function Pairs() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const { pairs, addPair, removePair, toggleFavorite } = useData();

  const [open, setOpen] = useState(false);
  const [metal, setMetal] = useState('gold');
  const [karat, setKarat] = useState(21);
  const [purity, setPurity] = useState(999);
  const [currency, setCurrency] = useState('YER');

  // تأكيد داخل التطبيق (مو نافذة المتصفح) — لأي إجراء: حذف، إضافة مفضلة، إزالة مفضلة
  const [confirm, setConfirm] = useState(null); // { type: 'delete'|'favOn'|'favOff', pair }

  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];

  async function handleSave() {
    const isGold = metal === 'gold';
    try {
      await addPair({ metal, karat: isGold ? karat : purity, currency, isFavorite: false });
      setOpen(false);
    } catch (e) {
      alert(e.message || 'فشل حفظ الزوج');
    }
  }

  function askDelete(p) { setConfirm({ type: 'delete', pair: p }); }
  function askFavorite(p) { setConfirm({ type: p.isFavorite ? 'favOff' : 'favOn', pair: p }); }

  async function handleConfirm() {
    if (!confirm) return;
    const { type, pair } = confirm;
    try {
      if (type === 'delete') await removePair(pair.id);
      else if (type === 'favOn') await toggleFavorite(pair.id, true);
      else if (type === 'favOff') await toggleFavorite(pair.id, false);
    } catch (e) {
      alert(e.message || 'فشل تنفيذ الإجراء');
    }
    setConfirm(null);
  }

  const confirmText = confirm?.type === 'delete' ? t('confirm_delete')
    : confirm?.type === 'favOn' ? t('confirm_add_fav')
    : confirm?.type === 'favOff' ? t('confirm_remove_fav') : '';

  return (
    <div className="view-inner">
      <div className="view-header">
        <h2>{t('nav_pairs')}</h2>
        <button className="btn btn-gold btn-sm" onClick={() => setOpen(true)}>{t('pairs_add')}</button>
      </div>

      <div className="pairs-list">
        {pairs.map((p) => {
          const isGold = p.metal === 'gold';
          const isYemenPair = p.currency === 'YER' && isGold;
          const ratio = isGold ? goldRatio(p.karat) : silverRatio(p.karat);
          const price = !isYemenPair && marketData
            ? gramPrice(marketData, isGold ? marketData.goldUsd : marketData.silverUsd, ratio, p.currency)
            : null;
          return (
            <div className="pair-row" key={p.id}>
              <button
                className={`pair-star${p.isFavorite ? ' active' : ''}`}
                onClick={() => askFavorite(p)}
                aria-label="favorite"
              >
                {p.isFavorite ? '★' : '☆'}
              </button>
              <div className="pair-info">
                {isYemenPair ? (
                  <YemenPriceBox marketData={marketData} metalUsd={marketData?.goldUsd} ratio={goldRatio(p.karat)} compact />
                ) : (
                  <div className="pair-price">{price ? price.toFixed(2) : '—'} <span style={{ fontSize: 12 }}>{p.currency}</span></div>
                )}
                <div className="pair-label">{t(isGold ? 'metal_gold' : 'metal_silver')} · {p.karat}{isGold ? '' : '\u2030'}</div>
              </div>
              <span className="pair-tag">{p.karat}</span>
              <button className="pair-delete" onClick={() => askDelete(p)}>✕</button>
            </div>
          );
        })}
      </div>
      {pairs.length === 0 && <p className="empty-hint">{t('pairs_empty')}</p>}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        title={t('pairs_add')}
        saveLabel={t('modal_save')}
        cancelLabel={t('modal_cancel')}
      >
        <div className="tool-field">
          <label>{t('lbl_metal')}</label>
          <div className="segmented">
            <button className={metal === 'gold' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('gold')}>{t('metal_gold')}</button>
            <button className={metal === 'silver' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('silver')}>{t('metal_silver')}</button>
          </div>
        </div>
        {metal === 'gold' ? (
          <div className="tool-field">
            <label>{t('lbl_karat')}</label>
            <select value={karat} onChange={(e) => setKarat(parseInt(e.target.value, 10))}>
              <option value={24}>24</option><option value={22}>22</option>
              <option value={21}>21</option><option value={18}>18</option>
            </select>
          </div>
        ) : (
          <div className="tool-field">
            <label>{t('lbl_purity')}</label>
            <select value={purity} onChange={(e) => setPurity(parseInt(e.target.value, 10))}>
              <option value={999}>999</option><option value={925}>925</option>
              <option value={800}>800</option><option value={750}>750</option>
            </select>
          </div>
        )}
        <div className="tool-field">
          <label>{t('lbl_currency')}</label>
          <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
        </div>
      </Modal>

      {/* تأكيد داخل التطبيق (حذف / إضافة أو إزالة مفضلة) */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onSave={handleConfirm}
        title={confirmText}
        saveLabel={t('confirm_yes')}
        cancelLabel={t('confirm_no')}
      >
        <div />
      </Modal>
    </div>
  );
}
