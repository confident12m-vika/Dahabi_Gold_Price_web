import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';

export default function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const { marketData } = useMarket();
  const { baseCurrency, setBaseCurrency } = useCurrency();
  const { session, syncProfile } = useAuth();
  const { resetLocalData } = useData();

  const currencies = marketData ? currencyList(marketData.rates) : [baseCurrency];

  function handleLang(l) {
    setLang(l);
    if (session) syncProfile(l, baseCurrency);
  }
  function handleCurrency(newCur) {
    setBaseCurrency(newCur);
    if (session) syncProfile(lang, newCur);
  }

  function handleReset() {
    if (session) {
      alert(t('reset_local_only'));
      return;
    }
    if (confirm(t('reset_confirm'))) resetLocalData();
  }

  return (
    <div className="view-inner">
      <h2>{t('nav_settings')}</h2>

      <div className="settings-group">
        <label className="settings-label">{t('settings_lang')}</label>
        <div className="lang-switch lang-switch-lg">
          {['ar', 'en', 'es', 'ru'].map((l) => (
            <button key={l} className={lang === l ? 'active' : ''} onClick={() => handleLang(l)}>
              {{ ar: 'العربية', en: 'English', es: 'Español', ru: 'Русский' }[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings_currency')}</label>
        <CurrencySelect value={baseCurrency} onChange={handleCurrency} currencies={currencies} />
      </div>

      <div className="settings-links">
        <button className="settings-link" onClick={() => navigate('/about')}>
          <span>ℹ</span> <span>{t('nav_about')}</span> <span className="chev">‹</span>
        </button>
        <button className="settings-link" onClick={() => navigate('/premium')}>
          <span>👑</span> <span>{t('nav_premium')}</span> <span className="chev">‹</span>
        </button>
        <button className="settings-link" onClick={() => navigate('/privacy')}>
          <span>🛡</span> <span>{t('footer_privacy')}</span> <span className="chev">‹</span>
        </button>
        <a className="settings-link" href="mailto:dahabiapp@gmail.com">
          <span>✉</span> <span>{t('settings_contact')}</span> <span className="chev">‹</span>
        </a>
      </div>

      <div className="settings-note">{t('settings_local_note')}</div>
      <button className="btn btn-outline" onClick={handleReset}>{t('settings_reset')}</button>
    </div>
  );
}
