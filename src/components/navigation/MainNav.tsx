
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/utils/i18n';

export const MainNav: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link 
        to="/" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t('nav.home')}
      </Link>
      <Link 
        to="/assessment" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Take Assessment
      </Link>
      <Link 
        to="/investors" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Investors
      </Link>
      <Link 
        to="/feedback" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t('nav.feedback')}
      </Link>
      <Link 
        to="/pricing" 
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Pricing
      </Link>
    </nav>
  );
};
