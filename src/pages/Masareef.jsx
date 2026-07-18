import { useState, useMemo } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { currencyList, yemenCurrencyRate } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';

// شاشة "مصارف" — تحويل عملة إلى عملة. لو إحدى العملتين اليمن،
// النتيجة تجي من مصدر اليمن المباشر (سعرين: صنعاء وعدن)، بدل
// السعر العالمي غير الدقيق لليمن.
export default function Masareef() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const [from, setFrom] = useState('SAR');
  const [to, setTo] = useState('USD');
  const [amount, setAmount] = useState('');

  const currencies = marketData ? currencyList(marketData.rates) : ['SAR', 'USD', 'YER'];
  const amountNum = parseFloat(amount) || 0;
  const isYemenPair = from === 'YER' || to === 'YER';

  const normalResult = useMemo(() => {
    if (isYemenPair || !marketData || amountNum <= 0) return null;
    const rateFrom = marketData.rates?.[from];
    const rateTo = marketData.rates?.[to];
    if (!rateFrom || !rateTo) return null;
    return (amountNum / rateFrom) * rateTo;
  }, [marketData, from, to, amountNum, isYemenPair]);

  // نتيجتان (صنعاء وعدن) لو إحدى العملتين اليمن
  const yemenResults = useMemo(() => {
    if (!isYemenPair || !marketData || amountNum <= 0) return null;
    const otherCode = from === 'YER' ? to : from;
    const cities = ['sanaa', 'aden'];
    const out = {};
    for (const city of cities) {
      const rate = yemenCurrencyRate(marketData, city, otherCode); // كم ريال يمني = 1 وحدة من otherCode
      if (!rate) { out[city] = null; continue; }
      out[city] = from === 'YER' ? amountNum / rate : amountNum * rate;
    }
    return out;
  }, [marketData, from, to, amountNum, isYemenPair]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="view-inner">
      <h2>{t('masareef_title')}</h2>
      <div className="tool-card">
        <div className="tool-field">
          <label>{t('conv_from')}</label>
          <div className="conv-row">
            <CurrencySelect value={from} onChange={setFrom} currencies={currencies} />
            <input type="number" placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <button className="conv-swap" onClick={swap}>⇅</button>
        <div className="tool-field">
          <label>{t('conv_to')}</label>
          <div className="conv-row">
            <CurrencySelect value={to} onChange={setTo} currencies={currencies} />
            {!isYemenPair && <div className="conv-result">{normalResult !== null ? normalResult.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</div>}
          </div>
        </div>

        {isYemenPair && (
          <div className="yemen-box" style={{ marginTop: 4 }}>
            <div className="yemen-city">
              <div className="yemen-city-name">{t('yemen_sanaa')}</div>
              <div className="yemen-city-price">{yemenResults?.sanaa != null ? yemenResults.sanaa.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</div>
            </div>
            <div className="yemen-city">
              <div className="yemen-city-name">{t('yemen_aden')}</div>
              <div className="yemen-city-price">{yemenResults?.aden != null ? yemenResults.aden.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
