
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const MobileNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();
  const isInvestor = userRole === 'investor';
  
  const investorNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Deal Flow', href: '/investor/deal-flow' },
    { name: 'Saved Startups', href: '/investor/saved' },
    { name: 'Matches', href: '/investor/matches' },
    { name: 'Portfolio', href: '/investor/portfolio' },
    { name: 'Analytics', href: '/investor/analytics' },
    { name: 'Profile', href: '/investor/profile' },
  ];

  const fundSeekerNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Assessment', href: '/unified-assessment' },
    { name: 'AI Analysis', href: '/ai-feedback' },
    { name: 'Learn', href: '/learn' },
    { name: 'Profile', href: '/profile' },
    { name: 'Donate', href: '/donate' },
  ];

  const navigation = isInvestor ? investorNavigation : fundSeekerNavigation;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold">InvestmentReady</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
