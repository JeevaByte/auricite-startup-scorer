
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/assessment', label: 'Take Assessment' },
  { href: '/ai-feedback', label: 'AI Feedback' },
  { href: '/pricing', label: 'Pricing' },
];

export const MainNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              location.pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
