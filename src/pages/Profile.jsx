import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';
import AuthForm from '../components/AuthForm';

// منطقة الخطر: طلب حذف الحساب → تحذير → إرسال كود بالبريد → تأكيد الكود → حذف فعلي
function DeleteAccountSection() {
  const { t } = useLang();
  const { requestAccountDeletion, confirmAccountDeletion } = useAuth();
  const [stage, setStage] = useState('idle'); // idle | warn | code
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSendCode() {
    setBusy(true); setError('');
    try {
      await requestAccountDeletion();
      setStage('code');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!otp) return;
    setBusy(true); setError('');
    try {
      await confirmAccountDeletion(otp.trim());
      // بعد النجاح signOut يصير تلقائي من داخل confirmAccountDeletion، والمستخدم يرجع لشاشة الدخول
    } catch (e) {
      setError(t('auth_code_invalid'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="danger-zone">
      {stage === 'idle' && (
        <button className="btn btn-danger-outline" style={{ width: '100%' }} onClick={() => setStage('warn')}>
          {t('delete_account_btn')}
        </button>
      )}

      {stage === 'warn' && (
        <div className="tool-card danger-card">
          <p className="danger-warning-text">⚠️ {t('delete_account_warning')}</p>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleSendCode} disabled={busy}>
            {t('delete_account_confirm_send')}
          </button>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => setStage('idle')}>
            {t('auth_back_to_signin') /* رجوع/إلغاء */}
          </button>
        </div>
      )}

      {stage === 'code' && (
        <div className="tool-card danger-card">
          <p className="empty-hint" style={{ marginTop: 0 }}>{t('delete_account_code_sent')}</p>
          <div className="tool-field">
            <label>{t('auth_code_label')}</label>
            <input type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
              value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleConfirm} disabled={busy}>
            {t('delete_account_final_confirm')}
          </button>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => setStage('idle')}>
            {t('auth_back_to_signin')}
          </button>
        </div>
      )}
    </div>
  );
}

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

        <DeleteAccountSection />
      </div>
    );
  }

  return (
    <div className="view-inner">
      <h2>{t('nav_profile')}</h2>
      <div className="onboarding-benefits">
        <p className="onboarding-benefits-title">{t('why_create_account')}</p>
        <ul>
          <li>⭐ {t('benefit_sync_favorites')}</li>
          <li>🔔 {t('benefit_instant_alerts')}</li>
          <li>🧮 {t('benefit_calculators')}</li>
          <li>💱 {t('benefit_full_converter')}</li>
          <li>☁️ {t('benefit_cloud_save')}</li>
        </ul>
      </div>
      <AuthForm />
    </div>
  );
}
