import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { getPinHash, setPinHash, sha256Hex, authVerifyOtp, authRecover } from '../lib/supabase';

// بوابة قفل المدخرات — نفس منطق فلاتر بالضبط (رمز PIN مشفّر SHA-256 مخزّن
// بعمود pin_hash بجدول profiles، متزامن مع الحساب). أضفنا استرجاع بالبريد
// (غير موجود بفلاتر حالياً) بدل إعادة التعيين المباشرة، لأمان أعلى بالويب.
// stage: loading | createFirst | createConfirm | enterExisting | forgotSent | forgotVerify
export default function SavingsAuth({ onUnlock }) {
  const { t } = useLang();
  const { session } = useAuth();
  const [stage, setStage] = useState('loading');
  const [storedHash, setStoredHash] = useState(null);
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const hash = await getPinHash(session);
        setStoredHash(hash);
        setStage(hash ? 'enterExisting' : 'createFirst');
      } catch (_) {
        setStage('createFirst');
      }
    })();
  }, [session]);

  function resetTransient() { setError(''); setNotice(''); setCode(''); setNewPin(''); setNewPin2(''); }

  // ── إنشاء أول رمز ──
  function submitFirstPin() {
    if (pin.length < 4) { setError(t('pin_min')); return; }
    setFirstPin(pin); setPin(''); setError(''); setStage('createConfirm');
  }
  async function submitConfirmPin() {
    if (pin !== firstPin) { setError(t('new_pins_not_matching')); setPin(''); return; }
    setBusy(true); setError('');
    try {
      const hash = await sha256Hex(pin);
      await setPinHash(session, hash);
      onUnlock();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // ── إدخال الرمز الموجود ──
  async function submitExistingPin() {
    setBusy(true); setError('');
    try {
      const hash = await sha256Hex(pin);
      if (hash === storedHash) onUnlock();
      else { setError(t('pin_wrong')); setPin(''); }
    } finally {
      setBusy(false);
    }
  }

  // ── نسيت الرمز: كود بالبريد ──
  async function handleForgot() {
    setBusy(true); setError('');
    try {
      await authRecover(session.user.email);
      setStage('forgotVerify');
      setNotice(t('auth_code_sent'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function handleForgotConfirm() {
    if (!code || newPin.length < 4) return;
    if (newPin !== newPin2) { setError(t('new_pins_not_matching')); return; }
    setBusy(true); setError('');
    try {
      await authVerifyOtp(session.user.email, code.trim(), 'recovery'); // إثبات ملكية الحساب
      const hash = await sha256Hex(newPin);
      await setPinHash(session, hash);
      onUnlock();
    } catch (e) {
      setError(t('auth_code_invalid'));
    } finally {
      setBusy(false);
    }
  }

  if (stage === 'loading') return <div className="tool-card">{t('status_loading')}</div>;

  if (stage === 'createFirst' || stage === 'createConfirm') {
    const isConfirm = stage === 'createConfirm';
    return (
      <div className="tool-card savings-auth-card">
        <div className="savings-auth-icon">🔒</div>
        <h3>{isConfirm ? t('confirm_new_pin_label') : t('savings_create_pin_title')}</h3>
        <p className="empty-hint">{t('savings_create_pin_desc')}</p>
        <input type="password" inputMode="numeric" maxLength={8} className="pin-input"
          value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus />
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} disabled={busy}
          onClick={isConfirm ? submitConfirmPin : submitFirstPin}>
          {isConfirm ? t('savings_confirm_btn') : t('continue_btn')}
        </button>
      </div>
    );
  }

  if (stage === 'enterExisting') {
    return (
      <div className="tool-card savings-auth-card">
        <div className="savings-auth-icon">🔒</div>
        <h3>{t('savings_enter_pin_title')}</h3>
        <input type="password" inputMode="numeric" maxLength={8} className="pin-input"
          value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus />
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={submitExistingPin} disabled={busy}>
          {t('auth_verify_btn')}
        </button>
        <button type="button" className="link-btn" style={{ display: 'block', marginTop: 12 }}
          onClick={() => { setStage('forgotSent'); resetTransient(); }}>
          {t('forgot_pin')}
        </button>
      </div>
    );
  }

  if (stage === 'forgotSent') {
    return (
      <div className="tool-card savings-auth-card">
        <h3>{t('forgot_pin_title')}</h3>
        <p className="empty-hint">{t('forgot_pin_desc')}</p>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleForgot} disabled={busy}>
          {t('auth_send_code')}
        </button>
        <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }}
          onClick={() => { setStage('enterExisting'); resetTransient(); }}>
          {t('auth_back_to_signin')}
        </button>
      </div>
    );
  }

  if (stage === 'forgotVerify') {
    return (
      <div className="tool-card savings-auth-card">
        <p className="empty-hint" style={{ marginTop: 0 }}>{t('auth_enter_code')} {session.user.email}</p>
        <div className="tool-field">
          <label>{t('auth_code_label')}</label>
          <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="tool-field">
          <label>{t('new_pin_label')}</label>
          <input type="password" inputMode="numeric" maxLength={8} value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="tool-field">
          <label>{t('confirm_new_pin_label')}</label>
          <input type="password" inputMode="numeric" maxLength={8} value={newPin2}
            onChange={(e) => setNewPin2(e.target.value.replace(/\D/g, ''))} />
        </div>
        {notice && !error && <div className="empty-hint">{notice}</div>}
        {error && <div className="auth-error">{error}</div>}
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleForgotConfirm} disabled={busy}>
          {t('savings_confirm_btn')}
        </button>
      </div>
    );
  }

  return null;
}
