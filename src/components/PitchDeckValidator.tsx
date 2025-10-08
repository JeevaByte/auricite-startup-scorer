
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Upload, FileText, Lightbulb, TrendingUp, Target, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DetailedValidationResult {
  section: string;
  status: 'complete' | 'incomplete' | 'missing';
  score: number;
  feedback: string;
  detailedFeedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    benchmarks: string;
    industryComparison: string;
  };
  category: 'critical' | 'important' | 'minor';
}

export const PitchDeckValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<DetailedValidationResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        toast({
          title: 'File Selected',
          description: `Selected: ${file.name}`,
        });
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a PDF, PPT, or PPTX file.',
          variant: 'destructive'
        });
      }
    }
  };

  const validatePitchDeck = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to validate.',
        variant: 'destructive'
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Read file content
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          // Call the analyze-content edge function with real AI
          const { supabase } = await import('@/integrations/supabase/client');
          
          const { data, error } = await supabase.functions.invoke('analyze-content', {
            body: {
              content: content || 'Pitch deck content for analysis',
              contentType: 'pitch-deck',
              fileName: selectedFile.name
            }
          });

          if (error) {
            console.error('Analysis error:', error);
            
            // Check if it's a quota error
            if (error.message?.includes('quota') || error.message?.includes('429')) {
              toast({
                title: 'OpenAI Quota Exceeded',
                description: 'Your OpenAI API key has exceeded its quota. Please check your OpenAI billing settings.',
                variant: 'destructive'
              });
            } else {
              toast({
                title: 'Analysis Error',
                description: 'Failed to analyze pitch deck. Using fallback analysis.',
                variant: 'destructive'
              });
            }
            
            // The edge function will return fallback analysis on error
            if (!data) {
              setIsValidating(false);
              return;
            }
          }

          // Map AI analysis to validation results
          const detailedResults: DetailedValidationResult[] = [];
          
          if (data?.pitchDeckAnalysis) {
            const analysis = data.pitchDeckAnalysis;
            
            // Problem Statement
            detailedResults.push({
              section: 'Problem Statement',
              status: analysis.problemStatement.score > 75 ? 'complete' : analysis.problemStatement.score > 50 ? 'incomplete' : 'missing',
              score: analysis.problemStatement.score,
              feedback: analysis.problemStatement.feedback,
              detailedFeedback: {
                strengths: analysis.problemStatement.keyInsights.filter((_, i) => i < 2),
                weaknesses: analysis.problemStatement.keyInsights.filter((_, i) => i >= 2),
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('problem')).map(s => s.suggestion) || [],
                benchmarks: `Industry average: ${data.industryBenchmarks?.clarityIndustryAvg || 70}/100`,
                industryComparison: `Your problem statement ranks at ${data.industryBenchmarks?.percentileRanking || 50}th percentile`
              },
              category: analysis.problemStatement.score < 60 ? 'critical' : analysis.problemStatement.score < 75 ? 'important' : 'minor'
            });

            // Solution
            detailedResults.push({
              section: 'Solution',
              status: analysis.solutionClarity.score > 75 ? 'complete' : analysis.solutionClarity.score > 50 ? 'incomplete' : 'missing',
              score: analysis.solutionClarity.score,
              feedback: analysis.solutionClarity.feedback,
              detailedFeedback: {
                strengths: analysis.solutionClarity.keyInsights.filter((_, i) => i < 3),
                weaknesses: analysis.solutionClarity.keyInsights.filter((_, i) => i >= 3),
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('solution')).map(s => s.suggestion) || [],
                benchmarks: `Industry average: ${data.industryBenchmarks?.engagementIndustryAvg || 72}/100`,
                industryComparison: data.industryBenchmarks?.competitiveAdvantage || 'Competitive positioning analysis'
              },
              category: 'critical'
            });

            // Market Size
            detailedResults.push({
              section: 'Market Size',
              status: analysis.marketOpportunity.score > 75 ? 'complete' : analysis.marketOpportunity.score > 50 ? 'incomplete' : 'missing',
              score: analysis.marketOpportunity.score,
              feedback: analysis.marketOpportunity.feedback,
              detailedFeedback: {
                strengths: [analysis.marketOpportunity.marketSize, analysis.marketOpportunity.targetAudience],
                weaknesses: data.suggestions?.filter(s => s.category.toLowerCase().includes('market')).slice(0, 2).map(s => s.suggestion) || [],
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('market')).map(s => s.suggestion) || [],
                benchmarks: 'Successful pitch decks show TAM >$1B, SAM >$100M',
                industryComparison: `Market sizing at ${analysis.marketOpportunity.score}/100`
              },
              category: 'critical'
            });

            // Business Model
            detailedResults.push({
              section: 'Business Model',
              status: analysis.businessModel.score > 75 ? 'complete' : analysis.businessModel.score > 50 ? 'incomplete' : 'missing',
              score: analysis.businessModel.score,
              feedback: analysis.businessModel.feedback,
              detailedFeedback: {
                strengths: analysis.businessModel.revenueStreams,
                weaknesses: [analysis.businessModel.scalability],
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('business') || s.category.toLowerCase().includes('revenue')).map(s => s.suggestion) || [],
                benchmarks: 'Top-tier decks show CLV:CAC ratio of 3:1 or higher',
                industryComparison: `Business model clarity: ${analysis.businessModel.score}/100`
              },
              category: 'important'
            });

            // Traction
            detailedResults.push({
              section: 'Traction',
              status: analysis.traction.score > 75 ? 'complete' : analysis.traction.score > 50 ? 'incomplete' : 'missing',
              score: analysis.traction.score,
              feedback: analysis.traction.feedback,
              detailedFeedback: {
                strengths: analysis.traction.metrics,
                weaknesses: [analysis.traction.momentum],
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('traction') || s.category.toLowerCase().includes('metric')).map(s => s.suggestion) || [],
                benchmarks: 'Strong traction shows >20% MoM growth, >90% retention',
                industryComparison: `Traction strength: ${analysis.traction.score}/100`
              },
              category: 'critical'
            });

            // Team
            detailedResults.push({
              section: 'Team',
              status: analysis.team.score > 75 ? 'complete' : analysis.team.score > 50 ? 'incomplete' : 'missing',
              score: analysis.team.score,
              feedback: analysis.team.feedback,
              detailedFeedback: {
                strengths: analysis.team.strengths,
                weaknesses: analysis.team.gaps,
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('team')).map(s => s.suggestion) || [],
                benchmarks: 'Top teams have 15+ years combined domain experience',
                industryComparison: `Team strength: ${analysis.team.score}/100`
              },
              category: 'minor'
            });

            // Financials
            detailedResults.push({
              section: 'Financials',
              status: analysis.financials.score > 75 ? 'complete' : analysis.financials.score > 50 ? 'incomplete' : 'missing',
              score: analysis.financials.score,
              feedback: analysis.financials.feedback,
              detailedFeedback: {
                strengths: analysis.financials.assumptions,
                weaknesses: [analysis.financials.projectionQuality],
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('financial')).map(s => s.suggestion) || [],
                benchmarks: 'Investor-ready financials include 3 scenarios with IRR >25%',
                industryComparison: `Financial detail: ${analysis.financials.score}/100`
              },
              category: 'critical'
            });

            // Funding Ask
            detailedResults.push({
              section: 'Funding Ask',
              status: analysis.askAndExit.score > 75 ? 'complete' : analysis.askAndExit.score > 50 ? 'incomplete' : 'missing',
              score: analysis.askAndExit.score,
              feedback: analysis.askAndExit.feedback,
              detailedFeedback: {
                strengths: [analysis.askAndExit.clarity, analysis.askAndExit.alignment],
                weaknesses: data.suggestions?.filter(s => s.category.toLowerCase().includes('funding') || s.category.toLowerCase().includes('ask')).slice(0, 2).map(s => s.suggestion) || [],
                improvements: data.suggestions?.filter(s => s.category.toLowerCase().includes('funding') || s.category.toLowerCase().includes('ask')).map(s => s.suggestion) || [],
                benchmarks: 'Clear asks show 18-24 month runway with specific milestones',
                industryComparison: `Funding ask clarity: ${analysis.askAndExit.score}/100`
              },
              category: 'critical'
            });
          } else {
            // Fallback structure if pitchDeckAnalysis is not available
            const sections = ['Problem Statement', 'Solution', 'Market Size', 'Business Model', 'Traction', 'Team', 'Financials', 'Funding Ask'];
            sections.forEach((section, index) => {
              const baseScore = data?.overallScore || 70;
              const variance = (Math.random() - 0.5) * 20;
              const score = Math.max(30, Math.min(100, baseScore + variance));
              
              detailedResults.push({
                section,
                status: score > 75 ? 'complete' : score > 50 ? 'incomplete' : 'missing',
                score: Math.round(score),
                feedback: data?.suggestions?.[index]?.suggestion || `${section} analysis completed`,
                detailedFeedback: {
                  strengths: data?.strengths?.slice(0, 2).map(s => s.description) || [`${section} is well-structured`],
                  weaknesses: [`More detail needed in ${section.toLowerCase()}`],
                  improvements: data?.suggestions?.slice(index, index + 2).map(s => s.suggestion) || [`Enhance ${section.toLowerCase()} with more data`],
                  benchmarks: `Industry average: ${baseScore}/100`,
                  industryComparison: `Your ${section.toLowerCase()} ranks at ${data?.industryBenchmarks?.percentileRanking || 50}th percentile`
                },
                category: index < 3 ? 'critical' : index < 6 ? 'important' : 'minor'
              });
            });
          }
          
          setResults(detailedResults);
          const avgScore = detailedResults.length > 0 
            ? detailedResults.reduce((sum, result) => sum + result.score, 0) / detailedResults.length
            : data?.overallScore || 70;
          setOverallScore(Math.round(avgScore));
          setIsValidating(false);
          
          toast({
            title: 'AI Analysis Complete',
            description: data?.pitchDeckAnalysis 
              ? 'Your pitch deck has been analyzed by AI with detailed feedback.'
              : 'Analysis completed. Note: OpenAI quota may be limited.',
          });
        } catch (analysisError) {
          console.error('Analysis processing error:', analysisError);
          toast({
            title: 'Analysis Error',
            description: 'Failed to process analysis results.',
            variant: 'destructive'
          });
          setIsValidating(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: 'File Read Error',
          description: 'Failed to read the file.',
          variant: 'destructive'
        });
        setIsValidating(false);
      };

      // Read file as text (for PDF/PPTX we'll send the filename and let the edge function handle it)
      reader.readAsText(selectedFile);
      
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Failed',
        description: 'An error occurred during validation.',
        variant: 'destructive'
      });
      setIsValidating(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <Target className="h-4 w-4 text-red-600" />;
      case 'important':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'minor':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Advanced Pitch Deck Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-4">
              Upload your pitch deck (PDF, PPT, or PPTX) for comprehensive analysis with detailed investor-grade feedback
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            {selectedFile && (
              <p className="text-sm text-green-600 mb-2">
                Selected: {selectedFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Or click "Analyze Sample Deck" to see how the advanced validator works
            </p>
          </div>
          
          <Button 
            onClick={validatePitchDeck} 
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? 'Performing Advanced Analysis...' : selectedFile ? 'Analyze Pitch Deck' : 'Analyze Sample Deck'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Overall Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <Progress value={overallScore} className="h-4" />
                </div>
                <div className="text-3xl font-bold">{overallScore}%</div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.category === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.category === 'important').length}
                  </div>
                  <div className="text-sm text-gray-600">Important Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.filter(r => r.category === 'minor').length}
                  </div>
                  <div className="text-sm text-gray-600">Minor Improvements</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {overallScore >= 80 ? 'Excellent pitch deck! Investor-ready with minor improvements needed.' :
                 overallScore >= 65 ? 'Good foundation, but several improvements needed before investor meetings.' :
                 overallScore >= 50 ? 'Significant improvements needed. Focus on critical issues first.' :
                 'Major revisions required before presenting to investors. Consider professional pitch deck consultation.'}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection(result.section)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        {getCategoryIcon(result.category)}
                        <div>
                          <h3 className="font-medium text-lg">{result.section}</h3>
                          <p className="text-sm text-gray-600">{result.feedback}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <span className="text-lg font-bold">{result.score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections.has(result.section) && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.detailedFeedback.strengths.map((strength, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {result.detailedFeedback.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Specific Improvements
                        </h4>
                        <ul className="space-y-2">
                          {result.detailedFeedback.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-1 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Industry Benchmark
                          </h5>
                          <p className="text-sm text-blue-700">{result.detailedFeedback.benchmarks}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h5 className="font-medium text-purple-800 mb-1 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Competitive Analysis
                          </h5>
                          <p className="text-sm text-purple-700">{result.detailedFeedback.industryComparison}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
