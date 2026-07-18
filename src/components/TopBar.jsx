import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useAuth } from '../contexts/AuthContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from './CurrencySelect';

export default function TopBar({ baseCurrency, setBaseCurrency, onHamburger }) {
  const { t, lang, setLang } = useLang();
  const { marketData } = useMarket();
  const { session, syncProfile } = useAuth();
  const navigate = useNavigate();

  const currencies = marketData ? currencyList(marketData.rates) : [baseCurrency];

  function handleCurrencyChange(newCur) {
    setBaseCurrency(newCur);
    if (session) syncProfile(lang, newCur);
  }

  function handleLangChange(newLang) {
    setLang(newLang);
    if (session) syncProfile(newLang, baseCurrency);
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="hamburger" onClick={onHamburger} aria-label="menu">☰</button>
        <div className="brand" onClick={() => navigate('/')}>
          <span className="brand-icon">◈</span>
          <span className="brand-name">{t('brand')}</span>
        </div>
        <div className="topbar-actions">
          <CurrencySelect value={baseCurrency} onChange={handleCurrencyChange} currencies={currencies} compact />
          <div className="lang-switch">
            {['ar', 'en', 'es', 'ru'].map((l) => (
              <button key={l} className={lang === l ? 'active' : ''} onClick={() => handleLangChange(l)}>
                {l === 'ar' ? 'ع' : l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
