
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MainNav } from '@/components/navigation/MainNav';
import { MobileNav } from '@/components/navigation/MobileNav';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { LanguageSelector } from '@/utils/i18n';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { useTranslation } from '@/utils/i18n';
import { LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl">InvestmentReady</div>
          <MainNav />
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ModeToggle />
          
          {user ? (
            <UserMenu />
          ) : (
            <Button onClick={signInWithGoogle} variant="outline" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
          
          <MobileNav />
        </div>
      </div>
      
      <AccessibilityMenu />
    </header>
  );
};
