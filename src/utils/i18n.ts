
import { useState, useEffect, useMemo, useCallback } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Memoized translations object
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
  'nav.feedback': {
    en: 'Feedback',
    es: 'Comentarios',
    fr: 'Commentaires',
    de: 'Feedback',
    it: 'Feedback',
    pt: 'Feedback',
    zh: '反馈',
    ja: 'フィードバック'
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
  'nav.pricing': {
    en: 'Pricing',
    es: 'Precios',
    fr: 'Tarifs',
    de: 'Preise',
    it: 'Prezzi',
    pt: 'Preços',
    zh: '定价',
    ja: '価格'
  },
  'nav.investors': {
    en: 'Investors',
    es: 'Inversores',
    fr: 'Investisseurs',
    de: 'Investoren',
    it: 'Investitori',
    pt: 'Investidores',
    zh: '投资者',
    ja: '投資家'
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
  'button.sign_in': {
    en: 'Sign In',
    es: 'Iniciar Sesión',
    fr: 'Se connecter',
    de: 'Anmelden',
    it: 'Accedi',
    pt: 'Entrar',
    zh: '登录',
    ja: 'サインイン'
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
  },
  'accessibility.menu': {
    en: 'Accessibility Menu',
    es: 'Menú de Accesibilidad',
    fr: 'Menu d\'Accessibilité',
    de: 'Barrierefreiheits-Menü',
    it: 'Menu Accessibilità',
    pt: 'Menu de Acessibilidade',
    zh: '无障碍菜单',
    ja: 'アクセシビリティメニュー'
  },
  'pricing.choose_plan': {
    en: 'Choose Your Plan',
    es: 'Elige tu Plan',
    fr: 'Choisissez votre forfait',
    de: 'Wählen Sie Ihren Plan',
    it: 'Scegli il tuo piano',
    pt: 'Escolha seu plano',
    zh: '选择您的计划',
    ja: 'プランを選択'
  }
};

// Cache for detected browser language
let detectedLanguage: Language | null = null;

// Get browser language only once
const getBrowserLanguage = (): Language => {
  if (detectedLanguage) return detectedLanguage;
  
  const browserLang = navigator.language.split('-')[0] as Language;
  const supportedLanguages = Object.keys(translations['nav.home']) as Language[];
  
  detectedLanguage = supportedLanguages.includes(browserLang) ? browserLang : 'en';
  return detectedLanguage;
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Initialize with saved language or browser language
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || getBrowserLanguage();
  });

  // Memoized translation function
  const t = useCallback((key: string): string => {
    return translations[key]?.[currentLanguage] || key;
  }, [currentLanguage]);

  // Optimized language change function
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  // Memoized return object
  const returnValue = useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t
  }), [currentLanguage, changeLanguage, t]);

  return returnValue;
};
