import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/lib/i18n';

type LanguageContextType = {
  language: string;
  direction: 'ltr' | 'rtl';
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  direction: 'ltr',
  toggleLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    // Try to get saved language or default to English
    return localStorage.getItem('language') || 'en';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      // Set language in i18n
      i18n.changeLanguage(language).catch(err => console.error('Error changing language:', err));
      
      // Save language preference
      localStorage.setItem('language', language);
      
      // Set direction attribute on html element
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', language);
  
      // Load the appropriate font for the language
      if (language === 'ar') {
        // Add Arabic font if not already loaded
        if (!document.getElementById('arabic-font')) {
          const link = document.createElement('link');
          link.id = 'arabic-font';
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
          document.head.appendChild(link);
        }
      } else {
        // Add English font if not already loaded
        if (!document.getElementById('english-font')) {
          const link = document.createElement('link');
          link.id = 'english-font';
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap';
          document.head.appendChild(link);
        }
      }

      console.log(`Language changed to: ${language}, direction: ${direction}`);
    } catch (error) {
      console.error('Error in language effect:', error);
    }
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
