import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { checkEmailExists } from '../lib/supabase';

// ← ينظّف الإيميل من أي رموز غير مرئية ممكن تنتقل بالغلط عند النسخ —
// موسّعة لتشمل علامات اتجاه النص (RTL/LRM) اللي بعض كيبوردات العربية
// تضيفها تلقائياً، بالإضافة لـZero-Width Space وBOM والمسافات.
function cleanEmail(raw) {
  return raw.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00A0\s]/g, '');
}

// نموذج المصادقة الكامل (دخول/تسجيل/كود تحقق/نسيان كلمة المرور) — مستخدم
// من صفحة "حسابي" (Profile) لكل من الضيف اللي يبي يسجّل والمستخدم الموجود.
export default function AuthForm({ showTitle = true }) {
  const { t } = useLang();
  const {
    signIn, signUp, signInWithGoogle,
    verifySignupCode, sendPasswordReset, verifyRecoveryCode,
  } = useAuth();

  // signin | signup | verify-signup | forgot | verify-recovery
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function resetTransient() { setError(''); setNotice(''); setCode(''); setNewPassword(''); }

  async function handleSubmit() {
    if (mode === 'signin') {
      if (!email || !password) return;
    } else {
      if (!name || !email || !password || !confirmPassword) return;
      if (password !== confirmPassword) {
        setError(t('auth_passwords_mismatch'));
        return;
      }
    }
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name.trim());
      }
    } catch (e) {
      if (e.message === 'CHECK_EMAIL') {
        setMode('verify-signup');
        setNotice(t('auth_code_sent'));
      } else if (mode === 'signin' && /invalid login credentials/i.test(e.message)) {
        setError(t('auth_signin_failed_hint'));
      } else {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifySignup() {
    if (!code) return;
    setError(''); setBusy(true);
    try {
      await verifySignupCode(email, code.trim());
    } catch (e) {
      setError(t('auth_code_invalid'));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendReset() {
    if (!email) return;
    setError(''); setBusy(true);
    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        setError(t('auth_no_account_found'));
        return;
      }
      await sendPasswordReset(email);
      setMode('verify-recovery');
      setNotice(t('auth_code_sent'));
    } catch (e) {
      setError(t('err_generic_network'));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    if (!code || !newPassword) return;
    setError(''); setBusy(true);
    try {
      await verifyRecoveryCode(email, code.trim(), newPassword);
    } catch (e) {
      setError(t('auth_code_invalid'));
    } finally {
      setBusy(false);
    }
  }

  // ── شاشة إدخال كود تأكيد التسجيل ──
  if (mode === 'verify-signup') {
    return (
      <div className="tool-card">
        <p className="empty-hint" style={{ marginTop: 0 }}>{t('auth_enter_code')} {email}</p>
        <button type="button" className="link-btn" style={{ display: 'block', marginBottom: 10 }}
          onClick={() => { setMode('signin'); resetTransient(); }}>
          {t('auth_already_have_account')}
        </button>
        <div className="tool-field">
          <label>{t('auth_code_label')}</label>
          <input type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
            value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        {notice && !error && <div className="empty-hint">{notice}</div>}
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleVerifySignup} disabled={busy}>
          {t('auth_verify_btn')}
        </button>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }}
          onClick={() => { setMode('signin'); resetTransient(); }}>
          {t('auth_back_to_signin')}
        </button>
      </div>
    );
  }

  // ── شاشة نسيت كلمة المرور: إدخال البريد لإرسال الكود ──
  if (mode === 'forgot') {
    return (
      <div className="tool-card">
        <div className="tool-field">
          <label>{t('auth_email')}</label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(cleanEmail(e.target.value))} />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleSendReset} disabled={busy}>
          {t('auth_send_code')}
        </button>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }}
          onClick={() => { setMode('signin'); resetTransient(); }}>
          {t('auth_back_to_signin')}
        </button>
        {error === t('auth_no_account_found') && (
          <button type="button" className="link-btn" style={{ display: 'block', marginTop: 12 }}
            onClick={() => { setMode('signup'); resetTransient(); }}>
            {t('auth_no_account_yet')}
          </button>
        )}
      </div>
    );
  }

  // ── شاشة استرجاع كلمة المرور: إدخال الكود + كلمة مرور جديدة ──
  if (mode === 'verify-recovery') {
    return (
      <div className="tool-card">
        <p className="empty-hint" style={{ marginTop: 0 }}>{t('auth_enter_code')} {email}</p>
        <div className="tool-field">
          <label>{t('auth_code_label')}</label>
          <input type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
            value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('auth_new_password')}</label>
          <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        {notice && !error && <div className="empty-hint">{notice}</div>}
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleResetPassword} disabled={busy}>
          {t('auth_reset_btn')}
        </button>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }}
          onClick={() => { setMode('signin'); resetTransient(); }}>
          {t('auth_back_to_signin')}
        </button>
        <button type="button" className="link-btn" style={{ display: 'block', marginTop: 12 }}
          onClick={() => { setMode('signup'); resetTransient(); }}>
          {t('auth_no_account_yet')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="tabs-strip">
        <button className={mode === 'signin' ? 'tab-btn active' : 'tab-btn'} onClick={() => { setMode('signin'); resetTransient(); }}>{t('auth_signin')}</button>
        <button className={mode === 'signup' ? 'tab-btn active' : 'tab-btn'} onClick={() => { setMode('signup'); resetTransient(); }}>{t('auth_signup')}</button>
      </div>
      <div className="tool-card">
        {mode === 'signup' && (
          <div className="tool-field">
            <label>{t('auth_name')}</label>
            <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="tool-field">
          <label>{t('auth_email')}</label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(cleanEmail(e.target.value))} />
        </div>
        <div className="tool-field">
          <label>{t('auth_password')}</label>
          <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {mode === 'signup' && (
          <div className="tool-field">
            <label>{t('auth_confirm_password')}</label>
            <input type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}
        {mode === 'signin' && (
          <button type="button" className="link-btn" style={{ display: 'block', marginBottom: 8 }}
            onClick={() => { setMode('forgot'); resetTransient(); }}>
            {t('auth_forgot')}
          </button>
        )}
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
    </>
  );
}
