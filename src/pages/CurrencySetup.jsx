import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useMarket } from '../contexts/MarketContext';
import { currencyList } from '../lib/supabase';
import CurrencySelect from '../components/CurrencySelect';

// تظهر مرة واحدة فقط بعد أول تسجيل (بريد أو جوجل) — تحفظ العملة
// بحساب المستخدم وتزامن كل شي بها من هذي اللحظة.
export default function CurrencySetup() {
  const { t, lang } = useLang();
  const { completeCurrencySetup } = useAuth();
  const { setBaseCurrency } = useCurrency();
  const { marketData } = useMarket();
  const [picked, setPicked] = useState('SAR');
  const [busy, setBusy] = useState(false);

  const currencies = marketData ? currencyList(marketData.rates) : ['SAR', 'USD', 'AED', 'EGP'];

  async function handleContinue() {
    setBusy(true);
    try {
      await completeCurrencySetup(lang, picked);
      setBaseCurrency(picked);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card" style={{ textAlign: 'center' }}>
        <div className="onboarding-logo">✨</div>
        <h2>{t('choose_currency_title')}</h2>
        <p className="empty-hint">{t('choose_currency_desc')}</p>
        <div style={{ margin: '24px 0' }}>
          <CurrencySelect value={picked} onChange={setPicked} currencies={currencies} />
        </div>
        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleContinue} disabled={busy}>
          {t('continue_btn')}
        </button>
      </div>
    </div>
  );
}
