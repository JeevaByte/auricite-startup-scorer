
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DataPrivacySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadData = async () => {
    if (!user) return;

    setIsDownloading(true);
    try {
      // Fetch all user data
      const [assessmentHistory, drafts, feedback] = await Promise.all([
        supabase.from('assessment_history').select('*').eq('user_id', user.id),
        supabase.from('assessment_drafts').select('*').eq('user_id', user.id),
        supabase.from('user_feedback').select('*').eq('user_id', user.id)
      ]);

      const userData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        assessment_history: assessmentHistory.data || [],
        drafts: drafts.data || [],
        feedback: feedback.data || [],
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Downloaded',
        description: 'Your data has been successfully downloaded.',
      });
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Data & Privacy</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Your Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Download a complete copy of your data including assessments, drafts, and feedback.
            </p>
            <Button 
              onClick={handleDownloadData}
              disabled={isDownloading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Preparing Download...' : 'Download My Data'}</span>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Data Usage</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Assessment data is used to provide personalized recommendations</p>
              <p>• Anonymous analytics help us improve the platform</p>
              <p>• Your data is encrypted and stored securely</p>
              <p>• We never share personal data with third parties</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your data is retained until you request deletion. You can delete your account and all associated data at any time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
