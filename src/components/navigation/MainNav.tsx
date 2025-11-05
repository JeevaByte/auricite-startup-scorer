
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Brain, BookOpen, Heart, Crown, Target, HelpCircle, Building2, TrendingUp, BarChart2, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MainNav: React.FC = () => {
  const location = useLocation();
  const { userRole, user } = useAuth();
  const isInvestor = userRole === 'investor';
  
  // Investor Navigation
  const investorNavigation = [
    { 
      name: 'Deal Flow', 
      href: '/investor/deal-flow',
      icon: Target,
      description: 'Browse investment opportunities',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Saved', 
      href: '/investor/saved',
      icon: Building2,
      description: 'Bookmarked startups',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Matches', 
      href: '/investor/matches',
      icon: Brain,
      description: 'Recommended startups',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Portfolio', 
      href: '/investor/portfolio',
      icon: TrendingUp,
      description: 'Track your investments',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Analytics', 
      href: '/investor/analytics',
      icon: BarChart3,
      description: 'Market insights',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Activity & Reports', 
      href: '/investor/activity',
      icon: ClipboardList,
      description: 'Track activity and export data',
      badge: undefined,
      isPremium: false
    }
  ];

  // Fund Seeker Navigation  
  const fundSeekerNavigation = [
    { 
      name: 'Assessment', 
      href: '/unified-assessment',
      icon: BarChart3,
      description: 'Investment readiness score',
      badge: undefined,
      isPremium: false
    },
    ...(!user ? [{ 
      name: 'How It Works', 
      href: '/how-it-works',
      icon: HelpCircle,
      description: 'Scorecard methodology',
      badge: undefined,
      isPremium: false
    }] : []),
    { 
      name: 'Analysis', 
      href: '/ai-feedback',
      icon: Brain,
      description: 'Content analysis & feedback',
      badge: undefined,
      isPremium: false
    },
    { 
      name: 'Pricing', 
      href: '/pricing',
      icon: Crown,
      description: 'Plans & features',
      badge: undefined,
      isPremium: false
    }
  ];

  const navigation = isInvestor ? investorNavigation : fundSeekerNavigation;

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {navigation.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'relative group px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted/50',
              isActive && 'bg-primary/10 text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <IconComponent className={cn(
                'h-4 w-4 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              )} />
              <span className={cn(
                'text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {item.name}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                  {item.badge}
                </Badge>
              )}
              {item.isPremium && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 border-yellow-300 text-yellow-700">
                  Pro
                </Badge>
              )}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.description}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-l border-t rotate-45"></div>
            </div>
          </Link>
        );
      })}
      
      {/* Donate button with neutral styling */}
      <Link
        to="/donate"
        className={cn(
          'ml-2 px-3 py-2 rounded-lg transition-all duration-200 bg-muted hover:bg-muted/80',
          location.pathname === '/donate' && 'bg-muted/80'
        )}
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Support</span>
        </div>
      </Link>
    </nav>
  );
};
