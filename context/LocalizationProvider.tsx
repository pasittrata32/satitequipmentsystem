import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { Language } from '../types.ts';
import { LOCALES } from '../constants.ts';

type LocalizationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof LOCALES.en) => string;
};

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error('useLocalization must be used within a LocalizationProvider');
  return context;
};

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('th');
  
  const t = useCallback((key: keyof typeof LOCALES.en) => {
    return LOCALES[language][key] || LOCALES.en[key];
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};