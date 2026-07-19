import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useData } from '../contexts/DataContext';
import { gramPrice, currencyList, yemenGramPrice, goldRatio, silverRatio } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';
import YemenPriceBox from '../components/YemenPriceBox';
import Modal from '../components/Modal';
import SavingsAuth from '../components/SavingsAuth';

export default function Calculator() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'savings' ? 'savings' : 'mahr');

  useEffect(() => {
    if (searchParams.get('note') === 'alerts') alert(t('feat_alerts_desc_short'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="view-inner">
      <h2>{t('nav_calc')}</h2>
      <div className="tabs-strip">
        <button className={tab === 'mahr' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('mahr')}>{t('tab_mahr')}</button>
        <button className={tab === 'savings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('savings')}>{t('tab_savings')}</button>
        <button className={tab === 'zakat' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('zakat')}>{t('tab_zakat')}</button>
      </div>

      {tab === 'mahr' && <MahrPanel />}
      {tab === 'savings' && <SavingsPanel />}
      {tab === 'zakat' && <ZakatPanel />}
    </div>
  );
}

// ═══════════ مساعد: سعر يدوي للمعدن (مشترك) ═══════════
function useManualMetal() {
  const [manual, setManual] = useState(false);
  const [goldPrice, setGoldPrice] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  return { manual, setManual, goldPrice, setGoldPrice, silverPrice, setSilverPrice };
}

function ManualMetalToggle({ m, metal, t }) {
  return (
    <>
      <div className="manual-toggle">
        <label className="switch">
          <input type="checkbox" checked={m.manual} onChange={(e) => m.setManual(e.target.checked)} />
          <span className="slider" />
        </label>
        <span>{t('manual_label')}</span>
      </div>
      {m.manual && (
        <div className="manual-input-wrap">
          <input
            type="number" placeholder="4111"
            value={metal === 'gold' ? m.goldPrice : m.silverPrice}
            onChange={(e) => (metal === 'gold' ? m.setGoldPrice(e.target.value) : m.setSilverPrice(e.target.value))}
          />
          <span className="manual-hint">{t('manual_hint')} ({t(metal === 'gold' ? 'metal_gold' : 'metal_silver')})</span>
        </div>
      )}
    </>
  );
}

// ═══════════ الزكاة — بمنطق النصاب الصحيح ═══════════
function ZakatPanel() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const { baseCurrency } = useCurrency();
  const [metal, setMetal] = useState('gold');
  const [karat, setKarat] = useState(21);
  const [purity, setPurity] = useState(999);
  const [grams, setGrams] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);
  const m = useManualMetal();
  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];
  const isYemen = currency === 'YER';
  const isGold = metal === 'gold';

  useEffect(() => { setCurrency(baseCurrency); }, [baseCurrency]);

  const gramsNum = parseFloat(grams) || 0;
  const metalUsd = m.manual
    ? parseFloat(isGold ? m.goldPrice : m.silverPrice) || 0
    : (marketData ? (isGold ? marketData.goldUsd : marketData.silverUsd) : null);

  const ratio = isGold ? goldRatio(karat) : silverRatio(purity);
  const nisabRatio = isGold ? 1 : 0.999;      // مرجع النصاب: ذهب 24 قيراط، فضة خالصة 999
  const nisabGrams = isGold ? 85 : 595;        // نصاب الذهب 85 جرام، نصاب الفضة 595 جرام

  const pricePerGramUser = metalUsd && marketData ? gramPrice(marketData, metalUsd, ratio, currency) : null;
  const pricePerGramNisabRef = metalUsd && marketData ? gramPrice(marketData, metalUsd, nisabRatio, currency) : null;

  const userValue = pricePerGramUser !== null ? pricePerGramUser * gramsNum : null;
  const nisabValue = pricePerGramNisabRef !== null ? pricePerGramNisabRef * nisabGrams : null;
  const reachesNisab = userValue !== null && nisabValue !== null && userValue >= nisabValue && gramsNum > 0;

  const zakatGrams = reachesNisab ? gramsNum * 0.025 : 0;
  const zakatValue = reachesNisab ? userValue * 0.025 : 0;

  // كم يتبقى (بجرامات نفس عيار/نقاوة المستخدم) للوصول للنصاب
  const nisabGramsInUserPurity = pricePerGramUser ? nisabValue / pricePerGramUser : null;
  const remainingGrams = !reachesNisab && nisabGramsInUserPurity !== null
    ? Math.max(0, nisabGramsInUserPurity - gramsNum)
    : null;

  return (
    <div className="tab-panel active">
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
          <label>{t('zakat_weight_label')}</label>
          <input type="number" placeholder="100" value={grams} onChange={(e) => setGrams(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('lbl_currency')}</label>
          <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
        </div>

        <ManualMetalToggle m={m} metal={metal} t={t} />

        {isYemen && isGold ? (
          <YemenPriceBox marketData={marketData} metalUsd={metalUsd} ratio={ratio} weight={zakatGrams} />
        ) : !reachesNisab ? (
          <div className="result-box" style={{ background: 'linear-gradient(135deg,#B0AA9A,#6B6B6B)' }}>
            <div className="result-label">{t('zakat_below_nisab')}</div>
            {remainingGrams !== null && remainingGrams > 0 && gramsNum > 0 && (
              <div className="result-sub">
                {t('zakat_remaining')}: {remainingGrams.toLocaleString(undefined, { maximumFractionDigits: 2 })} {t('per_gram')}
              </div>
            )}
          </div>
        ) : (
          <div className="result-box result-green">
            <div className="result-label">{t('zakat_due_label')}</div>
            <div className="result-value">{zakatGrams.toLocaleString(undefined, { maximumFractionDigits: 3 })} {t('per_gram')}</div>
            <div className="result-sub">≈ {zakatValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}</div>
          </div>
        )}

        <p className="empty-hint" style={{ fontSize: 12, padding: '14px 4px 0', textAlign: 'start' }}>
          {isGold ? t('zakat_nisab_gold') : t('zakat_nisab_silver')}<br />{t('zakat_nisab_note')}
        </p>
      </div>
    </div>
  );
}

// ═══════════ مدخراتي — محفظة منفصلة لكل عملة (واليمن: صنعاء/عدن) ═══════════
function SavingsPanel() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const { savings, addSaving, removeSaving } = useData();
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [karat, setKarat] = useState(21);
  const [weight, setWeight] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [city, setCity] = useState('sanaa');
  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];

  const wallets = useMemo(() => {
    const w = {};
    savings.forEach((it) => {
      const key = it.currency === 'YER' ? `YER_${it.city || 'sanaa'}` : it.currency;
      (w[key] ||= []).push(it);
    });
    return w;
  }, [savings]);

  const walletKeys = Object.keys(wallets);
  const [activeWallet, setActiveWallet] = useState(null);
  const currentWalletKey = activeWallet && walletKeys.includes(activeWallet) ? activeWallet : walletKeys[0];

  function currentPriceFor(it) {
    if (it.currency === 'YER') {
      return yemenGramPrice(marketData, marketData?.goldUsd, goldRatio(it.karat), it.city || 'sanaa') || 0;
    }
    return marketData ? gramPrice(marketData, marketData.goldUsd, goldRatio(it.karat), it.currency) || 0 : 0;
  }

  async function handleSave() {
    const w = parseFloat(weight) || 0;
    const b = parseFloat(buyPrice) || 0;
    if (w <= 0 || b <= 0) return;
    try {
      await addSaving({ karat, weight: w, buyPrice: b, currency, ...(currency === 'YER' ? { city } : {}) });
      setOpen(false);
      setWeight(''); setBuyPrice('');
    } catch (e) {
      alert(e.message || 'فشل حفظ المدخرة');
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('confirm_delete'))) return;
    try { await removeSaving(id); } catch (e) { alert(e.message || 'فشل الحذف'); }
  }

  function walletLabel(key) {
    if (key.startsWith('YER_')) {
      const c = key.split('_')[1];
      return `${t('wallet_of')} ${t('metal_gold')} · ${t(c === 'sanaa' ? 'yemen_sanaa' : 'yemen_aden')}`;
    }
    return `${t('wallet_of')} ${key}`;
  }

  return (
    <div className="tab-panel active">
      {!unlocked ? (
        <SavingsAuth onUnlock={() => setUnlocked(true)} />
      ) : (
        <>
      <button className="btn btn-gold btn-sm" onClick={() => setOpen(true)}>{t('savings_add')}</button>

      {walletKeys.length > 0 && (
        <div className="tabs-strip" style={{ marginTop: 16, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {walletKeys.map((key) => (
            <button
              key={key}
              className={key === currentWalletKey ? 'tab-btn active' : 'tab-btn'}
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setActiveWallet(key)}
            >
              {walletLabel(key)}
            </button>
          ))}
        </div>
      )}

      {currentWalletKey && (() => {
        const items = wallets[currentWalletKey];
        const cur = items[0].currency;
        let totalBuy = 0, totalNow = 0, grams = 0;
        items.forEach((it) => {
          const now = currentPriceFor(it);
          totalBuy += it.weight * it.buyPrice;
          totalNow += it.weight * now;
          grams += it.weight;
        });
        const pl = totalNow - totalBuy;
        const pct = totalBuy ? (pl / totalBuy) * 100 : 0;

        return (
          <>
            <div className="savings-summary">
              <div className="ss-item"><div className="ss-val">{totalNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><div className="ss-lbl">{cur}</div></div>
              <div className="ss-item"><div className="ss-val">{grams.toFixed(1)}</div><div className="ss-lbl">{t('per_gram')}</div></div>
              <div className="ss-item">
                <div className="ss-val" style={{ color: pl >= 0 ? '#eaffef' : '#ffe0e0' }}>{pl >= 0 ? '+' : ''}{pct.toFixed(1)}%</div>
                <div className="ss-lbl">{pl >= 0 ? '+' : ''}{pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="savings-list">
              {items.map((it) => {
                const now = currentPriceFor(it);
                const totalNowRow = it.weight * now;
                const totalBuyRow = it.weight * it.buyPrice;
                const plRow = totalNowRow - totalBuyRow;
                const pctRow = totalBuyRow ? (plRow / totalBuyRow) * 100 : 0;
                return (
                  <div className="saving-row saving-row-detailed" key={it.id}>
                    <div className="saving-row-top">
                      <div className="saving-meta">{it.weight} {t('per_gram')} · {it.karat} · {it.currency}</div>
                      <button className="pair-delete" onClick={() => handleDelete(it.id)}>✕</button>
                    </div>
                    <div className="saving-row-details">
                      <span>{t('saving_buy_label')}: <b>{totalBuyRow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></span>
                      <span>{t('saving_now_label')}: <b>{totalNowRow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></span>
                      <span className={plRow >= 0 ? 'saving-pl up' : 'saving-pl down'}>
                        {plRow >= 0 ? '+' : ''}{plRow.toLocaleString(undefined, { maximumFractionDigits: 1 })} ({pctRow >= 0 ? '+' : ''}{pctRow.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {walletKeys.length === 0 && <p className="empty-hint">{t('savings_empty')}</p>}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        title={t('savings_add')}
        saveLabel={t('modal_save')}
        cancelLabel={t('modal_cancel')}
      >
        <div className="tool-field">
          <label>{t('lbl_karat')}</label>
          <select value={karat} onChange={(e) => setKarat(parseInt(e.target.value, 10))}>
            <option value={24}>24</option><option value={22}>22</option>
            <option value={21}>21</option><option value={18}>18</option>
          </select>
        </div>
        <div className="tool-field">
          <label>{t('lbl_weight')}</label>
          <input type="number" placeholder="10" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('saving_buy_price')}</label>
          <input type="number" placeholder="400" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('lbl_currency')}</label>
          <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
        </div>
        {currency === 'YER' && (
          <div className="tool-field">
            <label>{t('lbl_city')}</label>
            <div className="segmented">
              <button className={city === 'sanaa' ? 'seg-btn active' : 'seg-btn'} onClick={() => setCity('sanaa')}>{t('yemen_sanaa')}</button>
              <button className={city === 'aden' ? 'seg-btn active' : 'seg-btn'} onClick={() => setCity('aden')}>{t('yemen_aden')}</button>
            </div>
          </div>
        )}
      </Modal>
        </>
      )}
    </div>
  );
}

// ═══════════ المهر ═══════════
function MahrPanel() {
  const { t } = useLang();
  const { marketData } = useMarket();
  const { baseCurrency } = useCurrency();
  const [karat, setKarat] = useState(21);
  const [weight, setWeight] = useState(80);
  const [custom, setCustom] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);
  const m = useManualMetal();
  const currencies = marketData ? currencyList(marketData.rates) : ['SAR'];
  const isYemen = currency === 'YER';
  const chips = [10, 20, 40, 50, 80, 100];

  useEffect(() => { setCurrency(baseCurrency); }, [baseCurrency]);

  const effectiveWeight = custom ? parseFloat(custom) || 0 : weight;
  const goldUsd = m.manual ? (parseFloat(m.goldPrice) || 0) : marketData?.goldUsd;
  const ratio = goldRatio(karat);
  const price = goldUsd && marketData ? gramPrice(marketData, goldUsd, ratio, currency) : null;
  const total = price ? price * effectiveWeight : null;

  return (
    <div className="tab-panel active">
      <div className="tool-card">
        <div className="tool-field">
          <label>{t('lbl_karat')}</label>
          <select value={karat} onChange={(e) => setKarat(parseInt(e.target.value, 10))}>
            <option value={24}>24</option><option value={22}>22</option>
            <option value={21}>21</option><option value={18}>18</option>
          </select>
        </div>
        <div className="tool-field">
          <label>{t('mahr_weight_label')}</label>
          <div className="weight-chips">
            {chips.map((w) => (
              <button key={w} className={!custom && weight === w ? 'active' : ''} onClick={() => { setWeight(w); setCustom(''); }}>{w}</button>
            ))}
          </div>
          <input type="number" placeholder={t('mahr_weight_label')} value={custom} onChange={(e) => setCustom(e.target.value)} style={{ marginTop: 10 }} />
        </div>
        <div className="tool-field">
          <label>{t('lbl_currency')}</label>
          <CurrencySelect value={currency} onChange={setCurrency} currencies={currencies} />
        </div>

        <div className="manual-toggle">
          <label className="switch">
            <input type="checkbox" checked={m.manual} onChange={(e) => m.setManual(e.target.checked)} />
            <span className="slider" />
          </label>
          <span>{t('manual_label')}</span>
        </div>
        {m.manual && (
          <div className="manual-input-wrap">
            <input type="number" placeholder="4111" value={m.goldPrice} onChange={(e) => m.setGoldPrice(e.target.value)} />
            <span className="manual-hint">{t('manual_hint')} ({t('metal_gold')})</span>
          </div>
        )}

        {isYemen ? (
          <YemenPriceBox marketData={marketData} metalUsd={goldUsd} ratio={ratio} weight={effectiveWeight} />
        ) : (
          <div className="result-box">
            <div className="result-label">{t('mahr_result_label')}</div>
            <div className="result-value">{total !== null ? `${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}` : '—'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
