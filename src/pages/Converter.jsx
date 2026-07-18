import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { gramPrice, currencyList, goldRatio, silverRatio, yemenGramPrice } from '../lib/supabase';

const TOP_CODES = ['SAR', 'USD', 'AED', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'EUR', 'GBP', 'TRY'];

export default function Converter() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const [metal, setMetal] = useState('gold');
  const [karat, setKarat] = useState(21);
  const [purity, setPurity] = useState(999);
  const [weight, setWeight] = useState('');
  const [manualOn, setManualOn] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const isGold = metal === 'gold';
  const ratio = isGold ? goldRatio(karat) : silverRatio(purity);
  const weightNum = parseFloat(weight) || 1; // بدون وزن مُدخل نعرض سعر الجرام الواحد
  const metalUsd = manualOn ? (parseFloat(manualValue) || null) : (isGold ? marketData?.goldUsd : marketData?.silverUsd);

  const currencies = marketData ? currencyList(marketData.rates) : TOP_CODES;
  const rows = currencies
    .filter((c) => c !== 'YER')
    .map((code) => {
      const pg = marketData ? gramPrice(marketData, metalUsd, ratio, code) : null;
      return { code, perGram: pg, total: pg !== null ? pg * weightNum : null };
    })
    .filter((r) => r.perGram !== null);

  // صف اليمن (صنعاء/عدن) — للذهب فقط، مصدر مباشر (يطابق ConverterScreen بفلاتر)
  const yemenSanaa = isGold ? yemenGramPrice(marketData, metalUsd, ratio, 'sanaa') : null;
  const yemenAden = isGold ? yemenGramPrice(marketData, metalUsd, ratio, 'aden') : null;

  return (
    <div className="view-inner">
      <h2>{t('conv_title')}</h2>
      <div className="tool-card">
        <div className="tool-field">
          <label>{t('lbl_metal')}</label>
          <div className="segmented">
            <button className={metal === 'gold' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('gold')}>{t('metal_gold')}</button>
            <button className={metal === 'silver' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('silver')}>{t('metal_silver')}</button>
          </div>
        </div>
        {isGold ? (
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
          <label>{t('lbl_weight')}</label>
          <input type="number" placeholder="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>

        <div className="manual-toggle">
          <label className="switch">
            <input type="checkbox" checked={manualOn} onChange={(e) => setManualOn(e.target.checked)} />
            <span className="slider" />
          </label>
          <span>{t('manual_label')}</span>
        </div>
        {manualOn && (
          <div className="manual-input-wrap">
            <input type="number" placeholder="4111" value={manualValue} onChange={(e) => setManualValue(e.target.value)} />
            <span className="manual-hint">{t('manual_hint')} ({t(isGold ? 'metal_gold' : 'metal_silver')})</span>
          </div>
        )}
      </div>

      <div className="exchange-table" style={{ marginTop: 16 }}>
        {isGold && (yemenSanaa !== null || yemenAden !== null) && (
          <div className="yr-row yr-row-yemen">
            <div className="yr-currency">
              <span className="yr-code" style={{ color: 'var(--green-icon)' }}>YER</span>
              <span className="yr-name">{t('yer_abbr')}</span>
            </div>
            <div className="yr-prices">
              <div><span className="yr-lbl">{t('yemen_sanaa')}</span><b style={{ color: 'var(--green-icon)' }}>{yemenSanaa !== null ? (yemenSanaa * weightNum).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</b></div>
              <div><span className="yr-lbl">{t('yemen_aden')}</span><b style={{ color: 'var(--green-icon)' }}>{yemenAden !== null ? (yemenAden * weightNum).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</b></div>
            </div>
          </div>
        )}
        {rows.map((r) => (
          <div className="ex-row" key={r.code}>
            <span className="ex-code">{r.code}</span>
            <span className="ex-val">
              {r.total !== null ? r.total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
              {weight && <span style={{ fontSize: 11, color: 'var(--text-soft)', marginInlineStart: 6 }}>
                ({r.perGram.toLocaleString(undefined, { maximumFractionDigits: 2 })}/{t('per_gram')})
              </span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
