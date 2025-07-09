
import React from 'react';
import { useTranslation, Language } from '@/utils/i18n';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'fr' as Language, name: 'Français' },
    { code: 'de' as Language, name: 'Deutsch' },
    { code: 'it' as Language, name: 'Italiano' },
    { code: 'pt' as Language, name: 'Português' },
    { code: 'zh' as Language, name: '中文' },
    { code: 'ja' as Language, name: '日本語' }
  ];

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value as Language)}
      className="bg-background border border-border rounded px-2 py-1 text-sm"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};
