import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { ModeToggle } from '@/components/ModeToggle';

interface HeaderProps {
  onViewHistory: () => void;
}

export const Header = ({ onViewHistory }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          Investment Readiness
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              {/* Add admin link if user is admin - you can add admin check here */}
              <Button variant="ghost" asChild>
                <Link to="/admin">Admin</Link>
              </Button>
            </>
          )}
          
          <ModeToggle />
          {user ? (
            <UserMenu onViewHistory={onViewHistory} />
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/profile">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
