
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { MainNav } from './navigation/MainNav';
import { MobileNav } from './navigation/MobileNav';

export const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/lovable-uploads/943f5c79-8478-43b5-95c9-18f53c2aed77.png" alt="InvestmentReady" className="h-8 w-8" />
            <span className="font-bold text-xl">InvestmentReady</span>
          </Link>
        </div>
        
        <MainNav />
        <MobileNav />
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
