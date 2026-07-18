import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLang } from './LangContext';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [baseCurrency, setBaseCurrency] = useState('SAR');
  const { session, loadRemoteProfile } = useAuth();
  const { setLang } = useLang();

  // عند تسجيل الدخول: نجيب اللغة والعملة المحفوظة بحساب المستخدم ونطبّقهما
  useEffect(() => {
    if (!session) return;
    (async () => {
      const profile = await loadRemoteProfile();
      if (profile?.currency) setBaseCurrency(profile.currency);
      if (profile?.language) setLang(profile.language);
    })();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CurrencyContext.Provider value={{ baseCurrency, setBaseCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
