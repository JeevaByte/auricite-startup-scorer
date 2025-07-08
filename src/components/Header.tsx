
import React from 'react';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { ModeToggle } from './ModeToggle';
import { NotificationBell } from './notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">StartupScore</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {user && <NotificationBell />}
            <ModeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};
