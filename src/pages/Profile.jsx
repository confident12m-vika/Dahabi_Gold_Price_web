import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';

export default function Profile() {
  const { t, lang, setLang } = useLang();
  const { session, signIn, signUp, signOut, signInWithGoogle, syncProfile } = useAuth();
  const { marketData } = useMarket();
  const { baseCurrency, setBaseCurrency } = useCurrency();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const currencies = marketData ? currencyList(marketData.rates) : [baseCurrency];

  async function handleSubmit() {
    if (!email || !password) return;
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
    } catch (e) {
      setError(e.message === 'CHECK_EMAIL' ? t('auth_check_email') : e.message);
    } finally {
      setBusy(false);
    }
  }

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
      <div className="tabs-strip">
        <button className={mode === 'signin' ? 'tab-btn active' : 'tab-btn'} onClick={() => { setMode('signin'); setError(''); }}>{t('auth_signin')}</button>
        <button className={mode === 'signup' ? 'tab-btn active' : 'tab-btn'} onClick={() => { setMode('signup'); setError(''); }}>{t('auth_signup')}</button>
      </div>
      <div className="tool-card">
        <div className="tool-field">
          <label>{t('auth_email')}</label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('auth_password')}</label>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleSubmit} disabled={busy}>
          {t(mode === 'signin' ? 'auth_signin_btn' : 'auth_signup_btn')}
        </button>
        <div className="auth-divider"><span>{t('auth_or')}</span></div>
        <button className="btn btn-google" style={{ width: '100%' }} onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginInlineEnd: 8 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
          </svg>
          {t('auth_google')}
        </button>
      </div>
      <p className="empty-hint">{t('auth_same_account')}</p>
    </div>
  );
}
