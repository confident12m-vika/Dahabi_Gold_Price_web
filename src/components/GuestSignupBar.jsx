import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

// الشريط السفلي الثابت — يظهر فوق BottomNav مباشرة للضيوف فقط،
// يطابق شريط "سجّل حساباً مجاناً" الموجود بتطبيق فلاتر بالضبط.
export default function GuestSignupBar() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="guest-signup-bar">
      <button className="guest-signup-btn" onClick={() => navigate('/profile')}>
        {t('signup_short')}
      </button>
      <div className="guest-signup-text">
        <strong>{t('signup_free_title')} ✨</strong>
        <span>{t('signup_free_desc')}</span>
      </div>
    </div>
  );
}
