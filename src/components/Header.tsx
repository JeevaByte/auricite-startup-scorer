
import React from 'react';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { ModeToggle } from './ModeToggle';
import { NotificationBell } from './notifications/NotificationBell';
import { MainNav } from './navigation/MainNav';
import { MobileNav } from './navigation/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3 } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileNav />
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              InvestReady
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center">
          <MainNav />
        </div>
        
        <div className="flex items-center space-x-2">
          {user && <NotificationBell />}
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
