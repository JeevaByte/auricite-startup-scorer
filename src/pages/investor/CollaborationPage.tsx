import { CollaborationHub } from '@/components/investor/CollaborationHub';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Users } from 'lucide-react';

const CollaborationPage = () => {
  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Investor Network
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with other investors, join syndicates, and collaborate on deals
          </p>
        </div>

        <CollaborationHub />
        </div>
      </div>
    </AuthGuard>
  );
};

export default CollaborationPage;