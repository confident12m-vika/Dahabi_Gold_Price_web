import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useData } from '../contexts/DataContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';
import Modal from '../components/Modal';
import NewsPanel from '../components/NewsPanel';

// التنبيهات بتطبيق فلاتر للذهب فقط (مافيه فضة) — بنفس الترتيب:
// تبويب التنبيهات أولاً، ثم تبويب الأخبار.
export default function Alerts() {
  const { t } = useLang();
  const { alerts } = useData();
  const [tab, setTab] = useState('alerts');

  return (
    <div className="view-inner">
      <h2>{t('nav_alerts')}</h2>
      <div className="tabs-strip">
        <button className={tab === 'alerts' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('alerts')}>
          {t('price_alerts_tab')}{alerts.length > 0 ? ` (${alerts.length})` : ''}
        </button>
        <button className={tab === 'news' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('news')}>{t('gold_news_tab')}</button>
      </div>

      {tab === 'alerts' && <PriceAlertsPanel />}
      {tab === 'news' && <NewsPanel />}
    </div>
  );
}

function PriceAlertsPanel() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const { alerts, addAlert, removeAlert } = useData();

  const [open, setOpen] = useState(false);
  const [karat, setKarat] = useState(21);
  const [currency, setCurrency] = useState('SAR');
  const [city, setCity] = useState('sanaa');
  const [targetPrice, setTargetPrice] = useState('');
  const [above, setAbove] = useState(true); // above=true → 'above', false → 'below'

  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];

  async function handleSave() {
    const price = parseFloat(targetPrice) || 0;
    if (price <= 0) return;
    try {
      await addAlert({
        metal: 'gold', karat, currency, targetPrice: price,
        direction: above ? 'above' : 'below', // القيم الصحيحة بقاعدة البيانات
        ...(currency === 'YER' ? { city } : {}),
      });
      setOpen(false);
      setTargetPrice('');
    } catch (e) {
      alert(e.message || 'فشل حفظ التنبيه');
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('confirm_delete'))) return;
    try { await removeAlert(id); } catch (e) { alert(e.message || 'فشل الحذف'); }
  }

  return (
    <div>
      <button className="btn btn-gold btn-sm" onClick={() => setOpen(true)}>{t('add_alert')}</button>

      <div className="alerts-list" style={{ marginTop: 16 }}>
        {alerts.map((a) => (
          <div className="alert-row" key={a.id}>
            <div className="alert-info">
              <div className="alert-meta">
                {t('metal_gold')} · {a.karat}
                {a.city ? ` · ${t(a.city === 'sanaa' ? 'yemen_sanaa' : 'yemen_aden')}` : ''}
              </div>
              <div className="alert-target">
                <span className={a.direction === 'above' ? 'alert-dir up' : 'alert-dir down'}>
                  {a.direction === 'above' ? '▲' : '▼'}
                </span>
                {a.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} {a.currency}
              </div>
            </div>
            <button className="pair-delete" onClick={() => handleDelete(a.id)}>✕</button>
          </div>
        ))}
        {alerts.length === 0 && <p className="empty-hint">{t('alerts_empty')}</p>}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        title={t('add_alert')}
        saveLabel={t('modal_save')}
        cancelLabel={t('modal_cancel')}
      >
        <div className="tool-field">
          <label>{t('lbl_karat')}</label>
          <select value={karat} onChange={(e) => setKarat(parseInt(e.target.value, 10))}>
            <option value={18}>18</option><option value={21}>21</option>
            <option value={22}>22</option><option value={24}>24</option>
          </select>
        </div>
        <div className="tool-field">
          <label>{t('lbl_currency')}</label>
          <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
        </div>
        {currency === 'YER' && (
          <div className="tool-field">
            <label>{t('yemen_city_label')}</label>
            <div className="segmented">
              <button className={city === 'sanaa' ? 'seg-btn active' : 'seg-btn'} onClick={() => setCity('sanaa')}>{t('yemen_sanaa')}</button>
              <button className={city === 'aden' ? 'seg-btn active' : 'seg-btn'} onClick={() => setCity('aden')}>{t('yemen_aden')}</button>
            </div>
          </div>
        )}
        <div className="tool-field">
          <label>{t('alerts_target_price')}</label>
          <input type="number" placeholder="4111" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('alerts_direction')}</label>
          <div className="segmented">
            <button className={above ? 'seg-btn active' : 'seg-btn'} onClick={() => setAbove(true)}>▲ {t('above_word')}</button>
            <button className={!above ? 'seg-btn active' : 'seg-btn'} onClick={() => setAbove(false)}>▼ {t('below_word')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
