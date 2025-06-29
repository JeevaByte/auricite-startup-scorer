
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserAssessments, DatabaseAssessment, DatabaseScore } from '@/utils/database';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, TrendingUp } from 'lucide-react';

interface AssessmentHistoryProps {
  onBack: () => void;
  onViewScore: (assessment: DatabaseAssessment, score: DatabaseScore) => void;
}

export const AssessmentHistory = ({ onBack, onViewScore }: AssessmentHistoryProps) => {
  const [assessments, setAssessments] = useState<(DatabaseAssessment & { scores: DatabaseScore[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const data = await getUserAssessments();
        setAssessments(data);
      } catch (error) {
        console.error('Error loading assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  const getScoreGrade = (score: number) => {
    if (score >= 800) return 'A+';
    if (score >= 700) return 'A';
    if (score >= 600) return 'B+';
    if (score >= 500) return 'B';
    if (score >= 400) return 'C+';
    if (score >= 300) return 'C';
    return 'D';
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'bg-green-100 text-green-800';
    if (score >= 500) return 'bg-yellow-100 text-yellow-800';
    if (score >= 300) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Assessment History</h1>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
          <p className="text-gray-600">Take your first assessment to see your results here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Assessment from {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                    </h3>
                    {assessment.scores.length > 0 && (
                      <Badge className={getScoreColor(assessment.scores[0].total_score)}>
                        {assessment.scores[0].total_score}/999 - Grade {getScoreGrade(assessment.scores[0].total_score)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>Stage: {assessment.milestones}</span>
                    <span>•</span>
                    <span>Team: {assessment.employees}</span>
                    <span>•</span>
                    <span>MRR: {assessment.mrr}</span>
                    {assessment.revenue && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Revenue generating</span>
                      </>
                    )}
                  </div>
                </div>
                {assessment.scores.length > 0 && (
                  <Button 
                    onClick={() => onViewScore(assessment, assessment.scores[0])}
                    className="ml-4"
                  >
                    View Results
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
