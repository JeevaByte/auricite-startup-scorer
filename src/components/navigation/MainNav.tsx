
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const MainNav: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Full Assessment', href: '/assessment' },
    { name: 'AI Tools', href: '/ai-feedback' },
    { name: 'Learn', href: '/learn' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            location.pathname === item.href
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};
