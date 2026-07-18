import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { gramPrice, goldRatio, silverRatio } from '../lib/supabase';
import { currencyName } from '../lib/currencies';
import GuestSignupBar from './GuestSignupBar';

const GOLD_KARATS = [24, 22, 21, 18, 14, 10, 9];
const SILVER_PURITIES = [999, 925, 800, 750];

// شاشة أسعار الضيف — تطابق تصميم فلاتر بالضبط: تبويب ذهب/فضة، بطاقة الأونصة
// العالمية، ثم جدول عمودي يعرض سعر الجرام لكل عيار/نقاوة دفعة وحدة.
// لا تُستخدم أبداً لمن سجّل دخول — واجهته الحالية (المفضلة/الأخبار/إلخ) لا تُمس.
export default function GuestHome() {
  const { t, lang } = useLang();
  const { marketData, status, lastUpdated } = useMarket();
  const { baseCurrency } = useCurrency();
  const [metal, setMetal] = useState('gold');
  const [, forceTick] = useState(0);

  // عدّاد "آخر تحديث" الحي (ثواني منذ آخر جلب ناجح)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedSec = lastUpdated ? Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000)) : null;
  const elapsedLabel = elapsedSec == null ? '—'
    : `${String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:${String(elapsedSec % 60).padStart(2, '0')}`;

  const isGold = metal === 'gold';
  const metalUsd = isGold ? marketData?.goldUsd : marketData?.silverUsd;
  const rate = marketData?.rates?.[baseCurrency];
  const ounceInCurrency = metalUsd && rate ? metalUsd * rate : null;

  const rows = isGold
    ? GOLD_KARATS.map((k) => ({ key: k, label: `${t('karat')} ${k}`, price: gramPrice(marketData, metalUsd, goldRatio(k), baseCurrency) }))
    : SILVER_PURITIES.map((p) => ({ key: p, label: `${p}`, price: gramPrice(marketData, metalUsd, silverRatio(p), baseCurrency) }));

  function fmt(v) {
    if (v == null) return '—';
    return v.toLocaleString(undefined, { maximumFractionDigits: v >= 100 ? 0 : 2 });
  }

  return (
    <div className="view-inner guest-home">

      <h2 className="guest-home-title">{t('prices_word')} · {currencyName(baseCurrency, lang)}</h2>

      <div className="guest-metal-tabs">
        <button className={!isGold ? 'active' : ''} onClick={() => setMetal('silver')}>🥈 {t('metal_silver')}</button>
        <button className={isGold ? 'active' : ''} onClick={() => setMetal('gold')}>🥇 {t('metal_gold')}</button>
      </div>

      <div className="tool-status guest-status-row">
        <span><span className={`dot-live${status === 'live' ? ' on' : ''}`} /> {status === 'live' ? t('status_live') : t('status_loading')}</span>
        <span>{t('last_update')}: {elapsedLabel} ↻</span>
      </div>

      <div className={`guest-ounce-card ${isGold ? 'gc-gold' : 'gc-silver'}`}>
        <p className="guest-ounce-label">{isGold ? t('global_gold_ounce') : t('global_silver_ounce')}</p>
        <p className="guest-ounce-price">${fmt(metalUsd)}</p>
        <p className="guest-ounce-price-sub">
          {baseCurrency === 'USD' ? `$${fmt(metalUsd)}` : `${fmt(ounceInCurrency)} ${baseCurrency}`}
        </p>
      </div>

      <div className="guest-table-header">
        <span>{t('gram_price')}</span>
        <span>{isGold ? t('karat_word') : t('purity_word')}</span>
      </div>

      <div className="guest-table">
        {rows.map((r) => (
          <div className="guest-table-row" key={r.key}>
            <div className="guest-row-price">
              <span className="guest-row-price-num">{fmt(r.price)}</span>
              <span className="guest-row-price-cur">{baseCurrency}</span>
            </div>
            <div className="guest-row-karat">
              <span>{r.label}</span>
              <span className="guest-row-badge">{r.key}</span>
            </div>
          </div>
        ))}
      </div>

      <GuestSignupBar />
    </div>
  );
}
