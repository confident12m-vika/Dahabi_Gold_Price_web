import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

// بانر ثابت (غير قابل للإغلاق) يظهر أعلى الصفحة الرئيسية للضيوف فقط —
// يحفّز على إنشاء حساب ويذكر أهم مميزاته باختصار.
export default function GuestBanner() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="guest-banner" onClick={() => navigate('/profile')} role="button" tabIndex={0}>
      <div className="guest-banner-text">
        <strong>{t('guest_banner_title')}</strong>
        <span>{t('guest_banner_desc')}</span>
      </div>
      <span className="guest-banner-cta">{t('guest_banner_cta')} ←</span>
    </div>
  );
}
