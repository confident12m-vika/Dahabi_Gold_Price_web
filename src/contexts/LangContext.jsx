import { createContext, useContext, useState, useEffect } from 'react';
import { I18N } from '../i18n/translations';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('ar');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = I18N[lang].dir;
  }, [lang]);

  const t = (key) => I18N[lang][key] ?? key;

  const setLang = (newLang) => {
    if (I18N[newLang]) setLangState(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir: I18N[lang].dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
