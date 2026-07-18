import { useLang } from '../contexts/LangContext';
import { yemenGramPrice } from '../lib/supabase';

// يحسب سعر الذهب/الفضة بالريال اليمني لصنعاء وعدن — بضرب السعر
// العالمي بالدولار × سعر الصرف المحلي لكل مدينة (نفس معادلة أي
// عملة بالضبط، بس سعر الصرف من مصدر اليمن المباشر).
export default function YemenPriceBox({ marketData, metalUsd, ratio, weight = 1, compact = false }) {
  const { t } = useLang();
  const sanaa = yemenGramPrice(marketData, metalUsd, ratio, 'sanaa');
  const aden = yemenGramPrice(marketData, metalUsd, ratio, 'aden');

  if (!sanaa && !aden) return <span>—</span>;

  if (compact) {
    return (
      <span className="yemen-inline">
        {sanaa ? <span>{t('yemen_sanaa')}: {(sanaa * weight).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> : null}
        {' · '}
        {aden ? <span>{t('yemen_aden')}: {(aden * weight).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> : null}
      </span>
    );
  }

  return (
    <div className="yemen-box">
      <div className="yemen-city">
        <div className="yemen-city-name">{t('yemen_sanaa')}</div>
        <div className="yemen-city-price">{sanaa ? (sanaa * weight).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</div>
      </div>
      <div className="yemen-city">
        <div className="yemen-city-name">{t('yemen_aden')}</div>
        <div className="yemen-city-price">{aden ? (aden * weight).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</div>
      </div>
    </div>
  );
}
