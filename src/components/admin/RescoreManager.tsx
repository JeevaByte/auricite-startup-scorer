
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rescoreAssessment, rescoreAllAssessments, RescoreResult } from '@/utils/rescoreService';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export const RescoreManager: React.FC = () => {
  const { toast } = useToast();
  const [rescoreResults, setRescoreResults] = useState<RescoreResult[]>([]);
  const [isRescoring, setIsRescoring] = useState(false);

  const handleRescoreAll = async () => {
    setIsRescoring(true);
    
    try {
      const results = await rescoreAllAssessments();
      setRescoreResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      toast({
        title: 'Rescoring Complete',
        description: `Successfully rescored ${successCount} assessments. ${failureCount} failed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rescore assessments.',
        variant: 'destructive',
      });
    } finally {
      setIsRescoring(false);
    }
  };

  const getScoreChangeIcon = (difference: number) => {
    if (difference > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (difference < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getScoreChangeBadge = (difference: number) => {
    if (difference > 0) return <Badge variant="default" className="bg-green-100 text-green-800">+{difference}</Badge>;
    if (difference < 0) return <Badge variant="destructive">{difference}</Badge>;
    return <Badge variant="secondary">No change</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Dynamic Re-Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Re-score all assessments using the current scoring configuration. 
              This will update all historical scores to reflect current criteria.
            </p>
            <Button 
              onClick={handleRescoreAll} 
              disabled={isRescoring}
              className="flex items-center gap-2"
            >
              {isRescoring && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isRescoring ? 'Rescoring...' : 'Rescore All Assessments'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rescoreResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rescoring Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rescoreResults.map((result) => (
                <div key={result.assessmentId} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{result.assessmentId.slice(0, 8)}...</span>
                    {result.success ? (
                      <Badge variant="default">Success</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  {result.success && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{result.oldScore} → {result.newScore}</span>
                      {getScoreChangeIcon(result.scoreDifference)}
                      {getScoreChangeBadge(result.scoreDifference)}
                    </div>
                  )}
                  {!result.success && result.error && (
                    <span className="text-sm text-red-500">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
