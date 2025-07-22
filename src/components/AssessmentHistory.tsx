
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserAssessments, getUserAssessmentHistory, DatabaseAssessment, DatabaseScore } from '@/utils/database';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, TrendingUp, Brain, FileText } from 'lucide-react';

interface AssessmentHistoryProps {
  onBack: () => void;
  onViewScore: (assessment: DatabaseAssessment, score: DatabaseScore) => void;
}

export const AssessmentHistory = ({ onBack, onViewScore }: AssessmentHistoryProps) => {
  const [assessments, setAssessments] = useState<(DatabaseAssessment & { scores: DatabaseScore[] })[]>([]);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assessmentsData, historyData] = await Promise.all([
          getUserAssessments(),
          getUserAssessmentHistory()
        ]);
        setAssessments(assessmentsData);
        setHistoryEntries(historyData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Investment Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Content Analysis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="mt-6">
          {assessments.length === 0 ? (
            <Card className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investment assessments yet</h3>
              <p className="text-gray-600">Take your first investment readiness assessment to see results here.</p>
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
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          {historyEntries.filter(entry => entry.assessment_data?.type === 'ai_content_analysis').length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI content analysis yet</h3>
              <p className="text-gray-600">Analyze your content with AI to see results here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {historyEntries
                .filter(entry => entry.assessment_data?.type === 'ai_content_analysis')
                .map((entry) => (
                  <Card key={entry.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-medium text-gray-900">
                            AI Content Analysis from {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </h3>
                          <Badge variant="outline">
                            {entry.assessment_data?.contentType || 'General'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span>Content: {entry.assessment_data?.content?.substring(0, 100)}...</span>
                        </div>
                        {entry.score_result && (
                          <div className="flex gap-2 text-sm">
                            <Badge variant="secondary">Clarity: {entry.score_result.clarity}%</Badge>
                            <Badge variant="secondary">Engagement: {entry.score_result.engagement}%</Badge>
                            <Badge variant="secondary">Readability: {entry.score_result.readability}%</Badge>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // You can add navigation to view detailed analysis here
                          console.log('View analysis details:', entry);
                        }}
                        className="ml-4"
                      >
                        View Analysis
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
