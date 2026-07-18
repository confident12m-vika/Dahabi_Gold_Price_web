import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';
import AuthForm from '../components/AuthForm';

export default function Profile() {
  const { t, lang, setLang } = useLang();
  const { session, signOut, syncProfile } = useAuth();
  const { marketData } = useMarket();
  const { baseCurrency, setBaseCurrency } = useCurrency();

  const currencies = marketData ? currencyList(marketData.rates) : [baseCurrency];

  function handleLang(l) {
    setLang(l);
    syncProfile(l, baseCurrency);
  }
  function handleCurrency(c) {
    setBaseCurrency(c);
    syncProfile(lang, c);
  }

  if (session) {
    const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
    return (
      <div className="view-inner">
        <h2>{t('nav_profile')}</h2>
        <div className="tool-card" style={{ textAlign: 'center' }}>
          {session.user.user_metadata?.avatar_url ? (
            <img src={session.user.user_metadata.avatar_url} alt="" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">◍</div>
          )}
          {name && <div className="profile-name">{name}</div>}
          <div className="profile-email">{session.user.email}</div>
          <div className="profile-sync-note">{t('profile_sync_note')}</div>
        </div>

        <div className="settings-group" style={{ marginTop: 18 }}>
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

        <button className="btn btn-outline" style={{ marginTop: 8, width: '100%' }} onClick={signOut}>
          {t('profile_logout')}
        </button>
      </div>
    );
  }

  return (
    <div className="view-inner">
      <h2>{t('nav_profile')}</h2>
      <AuthForm />
    </div>
  );
}
