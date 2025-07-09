
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  section: string;
  status: 'complete' | 'incomplete' | 'missing';
  score: number;
  feedback: string;
}

export const PitchDeckValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const { toast } = useToast();

  const validatePitchDeck = async () => {
    setIsValidating(true);
    
    // Simulate validation process
    setTimeout(() => {
      const mockResults: ValidationResult[] = [
        {
          section: 'Problem Statement',
          status: 'complete',
          score: 90,
          feedback: 'Clear and compelling problem definition with market validation.'
        },
        {
          section: 'Solution',
          status: 'complete',
          score: 85,
          feedback: 'Well-articulated solution, could benefit from more technical details.'
        },
        {
          section: 'Market Size',
          status: 'incomplete',
          score: 65,
          feedback: 'Market size mentioned but lacks specific data and segmentation.'
        },
        {
          section: 'Business Model',
          status: 'complete',
          score: 80,
          feedback: 'Clear revenue streams, consider adding unit economics.'
        },
        {
          section: 'Traction',
          status: 'incomplete',
          score: 60,
          feedback: 'Some traction shown, but needs more specific metrics and growth data.'
        },
        {
          section: 'Team',
          status: 'complete',
          score: 95,
          feedback: 'Strong team with relevant experience and clear role definitions.'
        },
        {
          section: 'Financials',
          status: 'incomplete',
          score: 55,
          feedback: 'Basic projections present, needs more detailed assumptions and scenarios.'
        },
        {
          section: 'Funding Ask',
          status: 'missing',
          score: 30,
          feedback: 'Funding amount mentioned but lacks use of funds breakdown and timeline.'
        }
      ];
      
      setResults(mockResults);
      const avgScore = mockResults.reduce((sum, result) => sum + result.score, 0) / mockResults.length;
      setOverallScore(Math.round(avgScore));
      setIsValidating(false);
      
      toast({
        title: 'Validation Complete',
        description: 'Your pitch deck has been analyzed successfully.',
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Pitch Deck Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-4">
              Upload your pitch deck (PDF, PPT, or PPTX) for comprehensive analysis
            </p>
            <Button variant="outline" className="mb-4">
              Choose File
            </Button>
            <p className="text-xs text-gray-500">
              Or click "Analyze Sample Deck" to see how the validator works
            </p>
          </div>
          
          <Button 
            onClick={validatePitchDeck} 
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? 'Validating...' : 'Analyze Sample Deck'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Progress value={overallScore} className="h-3" />
                </div>
                <div className="text-2xl font-bold">{overallScore}%</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {overallScore >= 80 ? 'Excellent pitch deck! Ready for investors.' :
                 overallScore >= 60 ? 'Good foundation, but needs some improvements.' :
                 'Significant improvements needed before presenting to investors.'}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-medium">{result.section}</h3>
                        <p className="text-sm text-gray-600">{result.feedback}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <span className="text-sm font-medium">{result.score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
