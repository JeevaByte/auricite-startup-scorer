
import React, { memo } from 'react';
import { useTranslation, Language } from '@/utils/i18n';

const languages = [
  { code: 'en' as Language, name: 'English', flag: 'EN' },
  { code: 'es' as Language, name: 'Español', flag: 'ES' },
  { code: 'fr' as Language, name: 'Français', flag: 'FR' },
  { code: 'de' as Language, name: 'Deutsch', flag: 'DE' },
  { code: 'it' as Language, name: 'Italiano', flag: 'IT' },
  { code: 'pt' as Language, name: 'Português', flag: 'PT' },
  { code: 'zh' as Language, name: '中文', flag: 'ZH' },
  { code: 'ja' as Language, name: '日本語', flag: 'JA' }
];

export const LanguageSelector: React.FC = memo(() => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as Language);
  };

  return (
    <select
      value={currentLanguage}
      onChange={handleLanguageChange}
      className="bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
});
