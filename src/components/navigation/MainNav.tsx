
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const MainNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', href: '/', show: true },
    { name: 'Take Assessment', href: '/?assessment=true', show: true },
    { name: 'AI Feedback', href: '/ai-feedback', show: true },
    { name: 'Results', href: '/results', show: !!user },
    { name: 'Investor Dashboard', href: '/investor-dashboard', show: !!user },
    { name: 'Pricing', href: '/pricing', show: true },
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems
        .filter(item => item.show)
        .map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              location.pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        ))}
    </nav>
  );
};
