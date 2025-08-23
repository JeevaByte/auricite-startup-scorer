
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Brain, BookOpen, Heart, Crown, Target } from 'lucide-react';

export const MainNav: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { 
      name: 'Assessment', 
      href: '/unified-assessment',
      icon: BarChart3,
      description: 'Investment readiness score',
      badge: 'Popular'
    },
    { 
      name: 'AI Analysis', 
      href: '/ai-feedback',
      icon: Brain,
      description: 'Content analysis & feedback',
      badge: 'AI Powered'
    },
    { 
      name: 'Investors', 
      href: '/investor-directory',
      icon: Users,
      description: 'Connect with VCs',
      isPremium: true
    },
    { 
      name: 'Learn', 
      href: '/learn',
      icon: BookOpen,
      description: 'Tutorials & guides'
    },
    { 
      name: 'Pricing', 
      href: '/pricing',
      icon: Crown,
      description: 'Plans & features'
    }
  ];

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
      
      {/* Donate button with special styling */}
      <Link
        to="/donate"
        className={cn(
          'ml-2 px-3 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 shadow-sm',
          location.pathname === '/donate' && 'shadow-lg ring-2 ring-pink-200'
        )}
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span className="text-sm font-medium">Support</span>
        </div>
      </Link>
    </nav>
  );
};
