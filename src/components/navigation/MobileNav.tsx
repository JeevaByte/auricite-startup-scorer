
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, BarChart3, Users, FileText, Target, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Assessment', href: '/?assessment=true', icon: Target },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
];

const authenticatedNavigation = [
  { name: 'Profile', href: '/profile', icon: Users },
  { name: 'Investor Dashboard', href: '/investor-dashboard', icon: FileText },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const allNavigation = user 
    ? [...navigation, ...authenticatedNavigation]
    : navigation;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          <div className="px-2">
            <h2 className="text-lg font-semibold">InvestReady</h2>
            <p className="text-sm text-muted-foreground">Navigate your startup journey</p>
          </div>
          <nav className="flex flex-col space-y-2">
            {allNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href === '/?assessment=true' && location.search.includes('assessment=true'));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
