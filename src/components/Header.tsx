
import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from './auth/AuthModal';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onViewHistory?: () => void;
}

export const Header = ({ onViewHistory }: HeaderProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Auricite InvestX</h1>
                <p className="text-sm text-gray-500">Startup Investment Scoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Pre-Seed Assessment Platform
              </div>
              {!loading && (
                user ? (
                  <UserMenu onViewHistory={onViewHistory} />
                ) : (
                  <Button onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
