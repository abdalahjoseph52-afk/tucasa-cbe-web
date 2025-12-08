import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations'; // IMPORT KAMUSI MPYA

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Angalia kama lugha imehifadhiwa, kama hamna tumia 'sw' (Kiswahili)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('tucasa-lang') || 'sw';
  });

  useEffect(() => {
    localStorage.setItem('tucasa-lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'sw' : 'en'));
  };

  // Kazi ya kutafsiri (t('footer.title'))
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);