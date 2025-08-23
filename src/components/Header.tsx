
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        {/* Logo Section */}
        <div className="mr-6 flex">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/943f5c79-8478-43b5-95c9-18f53c2aed77.png" 
                alt="InvestmentReady" 
                className="h-10 w-10 transition-transform group-hover:scale-105" 
              />
              <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                InvestmentReady
              </span>
              <div className="text-xs text-muted-foreground -mt-1">
                AI-Powered Platform
              </div>
            </div>
          </Link>
        </div>
        
        <MainNav />
        <MobileNav />
        
        {/* User Actions */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          {!loading && (
            user ? (
              <div className="flex items-center space-x-2">
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};
