import { useLang } from '../contexts/LangContext';
import AuthForm from '../components/AuthForm';

// أول شاشة يشوفها أي زائر جديد ما عنده حساب أو جلسة محفوظة —
// تسجيل دخول / حساب جديد، أو تخطي كضيف لمشاهدة الأسعار مباشرة.
export default function Onboarding({ onSkip }) {
  const { t } = useLang();

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div style={{ textAlign: 'center' }}>
          <div className="onboarding-logo">◍</div>
          <h1 className="onboarding-title">ذهبي</h1>
          <p className="empty-hint">{t('track_gold_silver_tagline')}</p>
        </div>

        <AuthForm />

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

        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={onSkip}>
          {t('continue_no_account')}
        </button>
      </div>
    </div>
  );
}
