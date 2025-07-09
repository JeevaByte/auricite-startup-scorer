
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export const MobileNav: React.FC = () => {
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
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-4">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded-md',
                  location.pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {item.name}
              </Link>
            ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
