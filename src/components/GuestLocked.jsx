import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

// تظهر بدل أي صفحة مقيّدة (الأزواج، الحاسبة، المحول، مصارف، الصرف،
// التنبيهات، الإعدادات) لو الضيف ضغط عليها من القائمة بدون تسجيل دخول.
export default function GuestLocked({ titleKey }) {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="view-inner">
      {titleKey && <h2>{t(titleKey)}</h2>}
      <div className="guest-locked-card">
        <div className="guest-locked-icon">🔒</div>
        <h3>{t('guest_locked_title')}</h3>
        <p className="empty-hint">{t('guest_locked_desc')}</p>
        <button className="btn btn-gold" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/profile')}>
          {t('topbar_signin_cta')}
        </button>
      </div>
    </div>
  );
}
