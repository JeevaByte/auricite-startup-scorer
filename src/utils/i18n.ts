
import { useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  'nav.home': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Startseite',
    it: 'Home',
    pt: 'Início',
    zh: '首页',
    ja: 'ホーム'
  },
  'nav.assessment': {
    en: 'Assessment',
    es: 'Evaluación',
    fr: 'Évaluation',
    de: 'Bewertung',
    it: 'Valutazione',
    pt: 'Avaliação',
    zh: '评估',
    ja: '評価'
  },
  'nav.results': {
    en: 'Results',
    es: 'Resultados',
    fr: 'Résultats',
    de: 'Ergebnisse',
    it: 'Risultati',
    pt: 'Resultados',
    zh: '结果',
    ja: '結果'
  },
  'button.start': {
    en: 'Start Assessment',
    es: 'Iniciar Evaluación',
    fr: 'Commencer l\'évaluation',
    de: 'Bewertung starten',
    it: 'Inizia valutazione',
    pt: 'Iniciar Avaliação',
    zh: '开始评估',
    ja: '評価を開始'
  },
  'button.submit': {
    en: 'Submit',
    es: 'Enviar',
    fr: 'Soumettre',
    de: 'Einreichen',
    it: 'Invia',
    pt: 'Enviar',
    zh: '提交',
    ja: '送信'
  },
  'form.prototype': {
    en: 'Do you have a working prototype?',
    es: '¿Tienes un prototipo funcional?',
    fr: 'Avez-vous un prototype fonctionnel?',
    de: 'Haben Sie einen funktionierenden Prototyp?',
    it: 'Hai un prototipo funzionante?',
    pt: 'Você tem um protótipo funcional?',
    zh: '您有工作原型吗？',
    ja: '動作するプロトタイプはありますか？'
  },
  'form.revenue': {
    en: 'Do you have revenue?',
    es: '¿Tienes ingresos?',
    fr: 'Avez-vous des revenus?',
    de: 'Haben Sie Einnahmen?',
    it: 'Hai entrate?',
    pt: 'Você tem receita?',
    zh: '您有收入吗？',
    ja: '収益はありますか？'
  },
  'score.total': {
    en: 'Total Score',
    es: 'Puntuación Total',
    fr: 'Score Total',
    de: 'Gesamtpunktzahl',
    it: 'Punteggio Totale',
    pt: 'Pontuação Total',
    zh: '总分',
    ja: '総スコア'
  }
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations['nav.home']).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (Object.keys(translations['nav.home']).includes(browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[currentLanguage] || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};

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
