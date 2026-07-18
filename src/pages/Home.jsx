import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useData } from '../contexts/DataContext';
import { gramPrice, currencyList, yemenGramPrice, goldRatio, silverRatio } from '../lib/supabase';
import PriceCard from '../components/PriceCard';
import CurrencySelect from '../components/CurrencySelect';
import YemenPriceBox from '../components/YemenPriceBox';
import ManualPriceButton from '../components/ManualPriceButton';
import NewsPanel from '../components/NewsPanel';

export default function Home() {
  const { t } = useLang();
  const { marketData, status } = useMarket();
  const { baseCurrency } = useCurrency();
  const { pairs } = useData();
  const navigate = useNavigate();

  const currencies = marketData ? currencyList(marketData.rates) : [baseCurrency];

  // كل بطاقة (ذهب/فضة) لها عيار/نقاوة وعملة مستقلة تماماً
  const [goldKarat, setGoldKarat] = useState(21);
  const [goldCurrency, setGoldCurrency] = useState(baseCurrency);
  const [silverPurity, setSilverPurity] = useState(999);
  const [silverCurrency, setSilverCurrency] = useState(baseCurrency);
  const [yemenCity, setYemenCity] = useState('sanaa'); // لبطاقة الذهب لو اليمن مختارة

  // مزامنة تلقائية: تغيير العملة من الشريط العلوي أو الإعدادات
  // يصير هو الافتراضي بالصناديق هنا (مو تغيير محلي داخل صفحة ثانية)
  useEffect(() => {
    setGoldCurrency(baseCurrency);
    setSilverCurrency(baseCurrency);
  }, [baseCurrency]);

  // التبويبات: المزيد | الأخبار | الأونصة | المفضلة
  const [activeTab, setActiveTab] = useState('fav');

  // سعر يدوي — مدخلان مستقلان تماماً (ذهب وفضة)، كل واحد يعمل لحاله
  const [manualGoldOn, setManualGoldOn] = useState(false);
  const [manualGoldValue, setManualGoldValue] = useState('');
  const [manualSilverOn, setManualSilverOn] = useState(false);
  const [manualSilverValue, setManualSilverValue] = useState('');
  const [manualRateOn, setManualRateOn] = useState(false);
  const [manualRateValue, setManualRateValue] = useState('');

  function effectiveRate(currency) {
    if (manualRateOn) return parseFloat(manualRateValue) || null;
    return marketData?.rates?.[currency] ?? null;
  }
  function effectiveMetalUsd(isGold) {
    if (isGold && manualGoldOn) return parseFloat(manualGoldValue) || null;
    if (!isGold && manualSilverOn) return parseFloat(manualSilverValue) || null;
    return isGold ? marketData?.goldUsd : marketData?.silverUsd;
  }

  const goldIsYemen = goldCurrency === 'YER';
  const silverIsYemen = silverCurrency === 'YER';

  const goldPrice = useMemo(() => {
    if (goldIsYemen) return null;
    const usd = effectiveMetalUsd(true);
    const rate = effectiveRate(goldCurrency);
    if (!usd || !rate || !marketData) return null;
    return (usd / 31.1034) * (goldKarat / 24) * rate;
  }, [marketData, goldKarat, goldCurrency, manualGoldOn, manualGoldValue, manualRateOn, manualRateValue]); // eslint-disable-line

  const silverPrice = useMemo(() => {
    if (silverIsYemen) return null;
    const usd = effectiveMetalUsd(false);
    const rate = effectiveRate(silverCurrency);
    if (!usd || !rate || !marketData) return null;
    return (usd / 31.1034) * (silverPurity / 1000) * rate;
  }, [marketData, silverPurity, silverCurrency, manualSilverOn, manualSilverValue, manualRateOn, manualRateValue]); // eslint-disable-line

  const statusText = status === 'live' ? t('status_live') : status === 'error' ? t('status_error') : t('status_loading');

  return (
    <div className="view-inner">
      <div className="tool-status">
        <span className={`dot-live${status === 'live' ? ' on' : ''}`} />
        <span>{statusText}</span>
      </div>

      {/* تبويب صنعاء/عدن مشترك — يظهر فقط لو أي بطاقة اختارت اليمن،
          ويطبَّق على الذهب والفضة معاً (مو الذهب بس) */}
      {(goldIsYemen || silverIsYemen) && (
        <div className="yemen-city-tabs yemen-city-tabs-shared">
          <button className={yemenCity === 'sanaa' ? 'active' : ''} onClick={() => setYemenCity('sanaa')}>{t('yemen_sanaa')}</button>
          <button className={yemenCity === 'aden' ? 'active' : ''} onClick={() => setYemenCity('aden')}>{t('yemen_aden')}</button>
        </div>
      )}

      <div className="price-cards">
        {silverIsYemen ? (
          <div className="price-card pc-silver">
            <div className="pc-top"><span>●</span></div>
            <div className="pc-price">
              {(() => {
                const p = yemenGramPrice(marketData, marketData?.silverUsd, silverPurity / 1000, yemenCity);
                return p ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
              })()}
            </div>
            <div className="pc-unit">{t('per_gram')} · YER</div>
            <div className="pc-pills">
              <CurrencySelect value={silverCurrency} onChange={setSilverCurrency} currencies={currencies} compact />
              <select className="karat-pill" value={silverPurity} onChange={(e) => setSilverPurity(parseInt(e.target.value, 10))}>
                <option value={999}>999</option><option value={925}>925</option>
                <option value={800}>800</option><option value={750}>750</option>
              </select>
            </div>
          </div>
        ) : (
          <PriceCard
            isGold={false}
            price={silverPrice}
            currency={silverCurrency}
            onCurrencyChange={setSilverCurrency}
            currencies={currencies}
            karat={silverPurity}
            onKaratChange={setSilverPurity}
            unitLabel={`${t('per_gram')} · ${silverCurrency}`}
          />
        )}

        {goldIsYemen ? (
          <div className="price-card pc-gold">
            <div className="pc-top"><span>★</span></div>
            <div className="pc-price">
              {(() => {
                const p = yemenGramPrice(marketData, marketData?.goldUsd, goldKarat / 24, yemenCity);
                return p ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
              })()}
            </div>
            <div className="pc-unit">{t('per_gram')} · YER</div>
            <div className="pc-pills">
              <CurrencySelect value={goldCurrency} onChange={setGoldCurrency} currencies={currencies} compact />
              <select className="karat-pill" value={goldKarat} onChange={(e) => setGoldKarat(parseInt(e.target.value, 10))}>
                <option value={24}>24</option><option value={22}>22</option>
                <option value={21}>21</option><option value={18}>18</option>
              </select>
            </div>
          </div>
        ) : (
          <PriceCard
            isGold
            price={goldPrice}
            currency={goldCurrency}
            onCurrencyChange={setGoldCurrency}
            currencies={currencies}
            karat={goldKarat}
            onKaratChange={setGoldKarat}
            unitLabel={`${t('per_gram')} · ${goldCurrency}`}
          />
        )}
      </div>

      {/* شريط التبويبات — نفس تبويبات الشاشة الرئيسية بالتطبيق */}
      <div className="home-tabs">
        <button className={activeTab === 'fav' ? 'home-tab active' : 'home-tab'} onClick={() => setActiveTab('fav')}>{t('hometab_fav')}</button>
        <button className={activeTab === 'ounce' ? 'home-tab active' : 'home-tab'} onClick={() => setActiveTab('ounce')}>{t('hometab_ounce')}</button>
        <button className={activeTab === 'news' ? 'home-tab active' : 'home-tab'} onClick={() => setActiveTab('news')}>{t('hometab_news')}</button>
        <button className={activeTab === 'more' ? 'home-tab active' : 'home-tab'} onClick={() => setActiveTab('more')}>{t('hometab_more')}</button>
      </div>

      <div className="home-tab-content">
        {activeTab === 'more' && (
          <div className="home-grid">
            {[
              { key: 'feat_exchange_short', descKey: 'feat_exchange_desc_short', icon: '⇄', cls: 'gc-blue', to: '/exchange' },
              { key: 'feat_alerts_short', descKey: 'feat_alerts_desc_short', icon: '🔔', cls: 'gc-orange', to: '/alerts' },
              { key: 'gram_worldwide_short', descKey: 'gram_worldwide_desc', icon: '⇆', cls: 'gc-purple', to: '/converter' },
              { key: 'masareef_title', descKey: 'masareef_desc', icon: '💱', cls: 'gc-blue', to: '/masareef' },
              { key: 'feat_savings_short', descKey: 'feat_savings_desc_short', icon: '▣', cls: 'gc-green', to: '/calculator?tab=savings' },
            ].map((g) => (
              <button key={g.key} className={`grid-card ${g.cls}`} onClick={() => navigate(g.to)}>
                <div className="gc-icon">{g.icon}</div>
                <h3>{t(g.key)}</h3>
                <p>{t(g.descKey)}</p>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <NewsPanel />
        )}

        {activeTab === 'ounce' && (
          <div className="ounce-list">
            <div className="ounce-row">
              <span className="ounce-badge">★</span>
              <span className="ounce-label">XAU {t('metal_gold')}</span>
              <span className="ounce-val">{marketData?.goldUsd ? `${marketData.goldUsd.toLocaleString(undefined,{maximumFractionDigits:2})} $` : '—'}</span>
            </div>
            <div className="ounce-row">
              <span className="ounce-badge">●</span>
              <span className="ounce-label">XAG {t('metal_silver')}</span>
              <span className="ounce-val">{marketData?.silverUsd ? `${marketData.silverUsd.toLocaleString(undefined,{maximumFractionDigits:2})} $` : '—'}</span>
            </div>
          </div>
        )}

        {activeTab === 'fav' && (
          <div className="pairs-list">
            {pairs.filter((p) => p.isFavorite).slice(0, 5).map((p) => {
              const isYP = p.currency === 'YER' && p.metal === 'gold';
              const isGoldPair = p.metal === 'gold';
              const price = !isYP && marketData ? gramPrice(marketData, isGoldPair ? marketData.goldUsd : marketData.silverUsd, isGoldPair ? goldRatio(p.karat) : silverRatio(p.karat), p.currency) : null;
              return (
                <div className="pair-row" key={p.id}>
                  <div className="pair-info">
                    {isYP ? <YemenPriceBox marketData={marketData} metalUsd={marketData?.goldUsd} ratio={p.karat / 24} compact /> : <div className="pair-price">{price ? price.toFixed(2) : '—'} <span style={{ fontSize: 12 }}>{p.currency}</span></div>}
                    <div className="pair-label">{t(p.metal === 'gold' ? 'metal_gold' : 'metal_silver')}{p.metal === 'gold' ? ` · ${p.karat}` : ''}</div>
                  </div>
                  <span className="pair-tag">{p.metal === 'gold' ? p.karat : '999'}</span>
                </div>
              );
            })}
            {pairs.filter((p) => p.isFavorite).length === 0 && <p className="empty-hint">{t('pairs_empty')}</p>}
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/pairs')}>{t('nav_pairs')} ›</button>
          </div>
        )}
      </div>

      {/* سعر يدوي — أيقونة لكل معدن + سعر الصرف، مستقلة تماماً */}
      <div className="manual-three-col">
        <ManualPriceButton
          label={t('manual_gold_col')}
          applied={manualGoldOn}
          value={manualGoldValue}
          placeholder="4111"
          onSave={(v) => { setManualGoldValue(v); setManualGoldOn(true); }}
          onClear={() => { setManualGoldOn(false); setManualGoldValue(''); }}
        />
        <ManualPriceButton
          label={t('manual_silver_col')}
          applied={manualSilverOn}
          value={manualSilverValue}
          placeholder="58"
          onSave={(v) => { setManualSilverValue(v); setManualSilverOn(true); }}
          onClear={() => { setManualSilverOn(false); setManualSilverValue(''); }}
        />
        <ManualPriceButton
          label={t('manual_rate_col')}
          applied={manualRateOn}
          value={manualRateValue}
          placeholder="3.75"
          onSave={(v) => { setManualRateValue(v); setManualRateOn(true); }}
          onClear={() => { setManualRateOn(false); setManualRateValue(''); }}
        />
      </div>

      {/* إعلان ثابت بأسفل الشاشة (مكانه محجوز — إعلان تجريبي حالياً) */}
      <div className="ad-banner-fixed">إعلان تجريبي</div>
    </div>
  );
}
