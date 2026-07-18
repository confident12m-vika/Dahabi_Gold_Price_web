import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencyList } from '../lib/supabase';
import { currencyName } from '../lib/currencies';
import CurrencySelect from '../components/CurrencySelect';

// (القائمة الثابتة القديمة لم تعد مطلوبة — أصبحنا نعرض كل العملات ديناميكياً)

export default function Exchange() {
  const { t, lang } = useLang();
  const { marketData } = useMarket();
  const { baseCurrency } = useCurrency();
  const [base, setBase] = useState(baseCurrency);
  const [box1, setBox1] = useState('USD');
  const [box2, setBox2] = useState('EUR');
  const [yemenCity, setYemenCity] = useState('sanaa');

  useEffect(() => { setBase(baseCurrency); }, [baseCurrency]);

  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];
  const isYemen = base === 'YER';

  const rateBase = marketData?.rates?.[base];
  function rateOf(code) {
    if (!rateBase || !marketData?.rates?.[code]) return null;
    return marketData.rates[code] / rateBase;
  }
  const rows = rateBase
    ? currencies.filter((c) => c !== base && c !== 'YER' && marketData.rates[c]).map((code) => ({ code, value: rateOf(code) }))
    : [];

  const yemenTable = marketData?.yemenRates?.[yemenCity] ?? null;
  function fmtYer(v) {
    return v !== undefined && v !== null
      ? v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';
  }

  // سعر أي عملة مقابل الريال اليمني: مباشر لو مدعومة من مصدر اليمن،
  // وإلا نحسبها بالقسمة على الدولار (نفس منطق yemenRowValue، لكن بيع/شراء معاً)
  function yemenFullRate(city, code) {
    const table = marketData?.yemenRates?.[city];
    if (!table) return null;
    if (table[code]) return table[code]; // مدعومة مباشرة {buy, sell}
    const usdEntry = table.USD;
    const usdToCode = marketData?.rates?.[code];
    if (!usdEntry || !usdToCode) return null;
    return { buy: usdEntry.buy / usdToCode, sell: usdEntry.sell / usdToCode };
  }
  const yemenSanaaForBase = !isYemen ? yemenFullRate('sanaa', base)?.buy ?? null : null;
  const yemenAdenForBase = !isYemen ? yemenFullRate('aden', base)?.buy ?? null : null;

  return (
    <div className="view-inner">
      <div className="view-header">
        <h2>🇾🇪 {t('nav_exchange')}</h2>
        <CurrencySelect value={base} onChange={setBase} currencies={currencies} />
      </div>

      {isYemen ? (
        <>
          {/* زرّا صنعاء/عدن — نفس تصميم التطبيق */}
          <div className="home-tabs" style={{ padding: '0 0 14px' }}>
            <button className={yemenCity === 'sanaa' ? 'home-tab active' : 'home-tab'} onClick={() => setYemenCity('sanaa')}>{t('yemen_sanaa')}</button>
            <button className={yemenCity === 'aden' ? 'home-tab active' : 'home-tab'} onClick={() => setYemenCity('aden')}>{t('yemen_aden')}</button>
          </div>

          {/* الصندوقان الكبيران: USD وSAR */}
          <div className="fav-boxes" style={{ marginBottom: 14 }}>
            {['USD', 'SAR'].map((code) => (
              <div className="yemen-big-box" key={code}>
                <div className="ybb-code">{code}</div>
                <div className="ybb-name">{currencyName(code, lang)}</div>
                {yemenTable?.[code] ? (
                  <>
                    <div className="ybb-line"><span className="ybb-buy">{t('yr_buy')}:</span> <b>{fmtYer(yemenTable[code].buy)}</b></div>
                    <div className="ybb-line"><span className="ybb-sell">{t('yr_sell')}:</span> <b>{fmtYer(yemenTable[code].sell)}</b></div>
                    <div className="ybb-yer">{t('yer_abbr')}</div>
                  </>
                ) : (
                  <div className="ybb-line">—</div>
                )}
              </div>
            ))}
          </div>

          {/* القائمة الكاملة — الـ22 المدعومة مباشرة من مصدر اليمن، والباقي
              (كل عملات UniRate الثانية) محسوبة بالقسمة على الدولار */}
          <div className="yemen-rates-table">
            {currencies.filter((c) => c !== 'YER').map((code) => {
              const d = yemenFullRate(yemenCity, code);
              const isDirect = !!yemenTable?.[code];
              return (
                <div className="yr-row" key={code}>
                  <div className="yr-currency">
                    <span className="yr-code">{code}{!isDirect && d && <span className="yr-approx">≈</span>}</span>
                    <span className="yr-name">{currencyName(code, lang)}</span>
                  </div>
                  <div className="yr-prices">
                    <div><span className="yr-lbl">{t('yr_buy')}</span><b className="yr-buy">{fmtYer(d?.buy)}</b></div>
                    <div><span className="yr-lbl">{t('yr_sell')}</span><b className="yr-sell">{fmtYer(d?.sell)}</b></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="empty-hint" style={{ fontSize: 11.5, textAlign: 'start' }}>{t('yemen_approx_note')}</p>
        </>
      ) : (
        <>
          <div className="fav-boxes">
            <div className="fav-box">
              <CurrencySelect value={box1} onChange={setBox1} currencies={currencies} />
              <div className="fav-box-value">{rateOf(box1) !== null ? rateOf(box1).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</div>
            </div>
            <div className="fav-box">
              <CurrencySelect value={box2} onChange={setBox2} currencies={currencies} />
              <div className="fav-box-value">{rateOf(box2) !== null ? rateOf(box2).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</div>
            </div>
          </div>

          <div className="exchange-table">
            {rows.map((r) => (
              <div className="ex-row" key={r.code}>
                <span className="ex-code">{r.code}</span>
                <span className="ex-val">{r.value !== null ? r.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</span>
              </div>
            ))}
            {(yemenSanaaForBase !== null || yemenAdenForBase !== null) && (
              <div className="ex-row yr-row-yemen">
                <span className="ex-code" style={{ color: 'var(--green-icon)' }}>YER</span>
                <span className="ex-val" style={{ fontSize: 12.5 }}>
                  {t('yemen_sanaa')}: <b style={{ color: 'var(--green-icon)' }}>{yemenSanaaForBase !== null ? yemenSanaaForBase.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</b>
                  {' · '}
                  {t('yemen_aden')}: <b style={{ color: 'var(--green-icon)' }}>{yemenAdenForBase !== null ? yemenAdenForBase.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}</b>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
