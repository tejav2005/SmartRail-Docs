import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en';
import ml from '../locales/ml';

const LOCALES = { English: en, Malayalam: ml };
const STORAGE_KEY = 'language';

const LanguageContext = createContext({ language: 'English', t: (key) => en[key] ?? key, setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguageName] = useState('English');

  // Load persisted language on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && LOCALES[saved]) setLanguageName(saved);
    });
  }, []);

  const setLanguage = async (lang) => {
    if (!LOCALES[lang]) return;
    setLanguageName(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  /**
   * Translation function.
   * Usage:  t('home')        => 'ഹോം'  (in Malayalam)
   *         t('unreadCount', 3) => '3 വായിക്കാത്തത്'  (for function values)
   */
  const t = (key, ...args) => {
    const locale = LOCALES[language] ?? en;
    const value = locale[key] ?? en[key] ?? key;
    if (typeof value === 'function') return value(...args);
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
