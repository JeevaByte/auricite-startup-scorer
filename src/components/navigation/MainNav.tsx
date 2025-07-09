
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BarChart3, Users, Settings, FileText, Target } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Take Assessment', href: '/?assessment=true', icon: Target },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: Users },
  { name: 'Investor Dashboard', href: '/investor-dashboard', icon: FileText },
];

export const MainNav = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || 
          (item.href === '/?assessment=true' && location.search.includes('assessment=true'));
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
