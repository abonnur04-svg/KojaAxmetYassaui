import { createContext, useContext, useState, useCallback } from 'react';

const LangContext = createContext({ lang: 'kk', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('app_lang') || 'kk'; } catch { return 'kk'; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('app_lang', l); } catch {}
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
