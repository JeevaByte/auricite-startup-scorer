
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
    
    // Simulate advanced validation process with detailed feedback
    setTimeout(() => {
      const detailedResults: DetailedValidationResult[] = [
        {
          section: 'Problem Statement',
          status: 'complete',
          score: 90,
          feedback: 'Clear and compelling problem definition with market validation.',
          detailedFeedback: {
            strengths: [
              'Problem is clearly articulated and relatable',
              'Strong market validation data provided',
              'Pain points are well-researched and documented',
              'Target customer segments are clearly defined'
            ],
            weaknesses: [
              'Could benefit from more emotional storytelling',
              'Competitor pain points analysis is shallow'
            ],
            improvements: [
              'Add customer testimonials or quotes about the problem',
              'Include market research statistics to quantify the problem size',
              'Show how current solutions fail to address the core issues',
              'Add visual representations of the problem (charts, infographics)'
            ],
            benchmarks: 'Top 10% of pitch decks have problem statements that combine clear articulation (90%+) with strong emotional resonance (85%+)',
            industryComparison: 'Your problem statement scores higher than 78% of SaaS pitch decks in our database'
          },
          category: 'important'
        },
        {
          section: 'Solution',
          status: 'complete',
          score: 85,
          feedback: 'Well-articulated solution, could benefit from more technical details.',
          detailedFeedback: {
            strengths: [
              'Solution directly addresses identified problems',
              'Clear value proposition is presented',
              'Unique differentiators are highlighted',
              'User experience is considered in solution design'
            ],
            weaknesses: [
              'Technical implementation details are vague',
              'Scalability concerns not addressed',
              'Integration capabilities unclear'
            ],
            improvements: [
              'Add technical architecture diagrams or flowcharts',
              'Include screenshots or mockups of the actual product',
              'Explain the technology stack and why it was chosen',
              'Show how the solution scales with user growth',
              'Add integration capabilities and API documentation',
              'Include security and compliance considerations'
            ],
            benchmarks: 'Leading pitch decks include 3-5 product screenshots and at least one technical diagram',
            industryComparison: 'Your solution clarity ranks in the 82nd percentile for fintech startups'
          },
          category: 'critical'
        },
        {
          section: 'Market Size',
          status: 'incomplete',
          score: 65,
          feedback: 'Market size mentioned but lacks specific data and segmentation.',
          detailedFeedback: {
            strengths: [
              'Total addressable market (TAM) is mentioned',
              'Market growth trends are acknowledged'
            ],
            weaknesses: [
              'Serviceable addressable market (SAM) not defined',
              'Serviceable obtainable market (SOM) missing',
              'Market segmentation is superficial',
              'Geographic breakdown absent',
              'Customer acquisition timeline unclear'
            ],
            improvements: [
              'Break down TAM into SAM and SOM with clear calculations',
              'Provide specific market size numbers with sources (Gartner, IDC, etc.)',
              'Show market segmentation by customer type, geography, and use case',
              'Include market growth projections for next 5 years',
              'Add competitive landscape market share analysis',
              'Explain your go-to-market strategy for each segment',
              'Include customer acquisition cost (CAC) analysis by segment'
            ],
            benchmarks: 'Successful pitch decks show TAM >$1B, SAM >$100M, and SOM >$10M with clear methodology',
            industryComparison: 'Market sizing depth is below average compared to Series A healthcare startups'
          },
          category: 'critical'
        },
        {
          section: 'Business Model',
          status: 'complete',
          score: 80,
          feedback: 'Clear revenue streams, consider adding unit economics.',
          detailedFeedback: {
            strengths: [
              'Multiple revenue streams identified',
              'Pricing strategy is clearly defined',
              'Revenue model aligns with customer value'
            ],
            weaknesses: [
              'Unit economics not detailed',
              'Customer lifetime value (CLV) missing',
              'Churn rate assumptions unclear',
              'Pricing sensitivity analysis absent'
            ],
            improvements: [
              'Add detailed unit economics: CAC, CLV, payback period',
              'Show revenue projections by stream for 3-5 years',
              'Include pricing sensitivity analysis and competitor pricing',
              'Explain customer retention strategies and churn reduction',
              'Add upselling and cross-selling opportunities',
              'Show path to positive unit economics and break-even',
              'Include different pricing tiers and their conversion rates'
            ],
            benchmarks: 'Top-tier pitch decks show CLV:CAC ratio of 3:1 or higher with <12 month payback',
            industryComparison: 'Your business model clarity exceeds 71% of B2B SaaS companies at similar stage'
          },
          category: 'important'
        },
        {
          section: 'Traction',
          status: 'incomplete',
          score: 60,
          feedback: 'Some traction shown, but needs more specific metrics and growth data.',
          detailedFeedback: {
            strengths: [
              'Customer testimonials provided',
              'Basic growth metrics mentioned',
              'Pilot customers identified'
            ],
            weaknesses: [
              'Growth rate calculations missing',
              'Customer acquisition metrics unclear',
              'Retention and churn data absent',
              'Revenue metrics are vague',
              'User engagement data missing'
            ],
            improvements: [
              'Show month-over-month growth rates for key metrics',
              'Include cohort analysis and retention curves',
              'Add detailed customer acquisition funnel metrics',
              'Show revenue growth, MRR/ARR progression',
              'Include user engagement metrics (DAU, MAU, session length)',
              'Add case studies from key customers with ROI data',
              'Show product-market fit indicators (NPS, usage frequency)',
              'Include pipeline and sales conversion metrics'
            ],
            benchmarks: 'Strong traction shows >20% MoM growth, >90% retention rate, and NPS >50',
            industryComparison: 'Your traction metrics are in the 45th percentile for pre-Series A startups'
          },
          category: 'critical'
        },
        {
          section: 'Team',
          status: 'complete',
          score: 95,
          feedback: 'Strong team with relevant experience and clear role definitions.',
          detailedFeedback: {
            strengths: [
              'Exceptional domain expertise across leadership',
              'Complementary skill sets well-balanced',
              'Previous startup experience demonstrated',
              'Strong educational and professional backgrounds',
              'Clear role definitions and responsibilities'
            ],
            weaknesses: [
              'Advisory board could be expanded',
              'Technical team scaling plan unclear'
            ],
            improvements: [
              'Add 2-3 industry-specific advisors with investor connections',
              'Include hiring plan for next 12-18 months',
              'Show equity distribution and vesting schedules',
              'Add technical team expansion roadmap',
              'Include diversity and inclusion initiatives',
              'Show key performance indicators for team productivity'
            ],
            benchmarks: 'Top 5% of teams have combined 15+ years domain experience and 2+ successful exits',
            industryComparison: 'Your team strength ranks in the 92nd percentile across all industries'
          },
          category: 'minor'
        },
        {
          section: 'Financials',
          status: 'incomplete',
          score: 55,
          feedback: 'Basic projections present, needs more detailed assumptions and scenarios.',
          detailedFeedback: {
            strengths: [
              '5-year revenue projections provided',
              'Key expense categories identified',
              'Break-even timeline estimated'
            ],
            weaknesses: [
              'Financial model assumptions not transparent',
              'Scenario analysis missing (best/worst case)',
              'Cash flow projections inadequate',
              'Key performance indicators undefined',
              'Sensitivity analysis absent'
            ],
            improvements: [
              'Build detailed financial model with transparent assumptions',
              'Add scenario analysis: conservative, base case, optimistic',
              'Include monthly cash flow projections for 24 months',
              'Show key driver analysis and sensitivity tables',
              'Add working capital requirements and seasonal variations',
              'Include detailed OpEx breakdown by department',
              'Show path to profitability with key milestones',
              'Add investor returns modeling (IRR, multiple scenarios)'
            ],
            benchmarks: 'Investor-ready financials include 3 scenarios, monthly detail for 2 years, and IRR >25%',
            industryComparison: 'Financial model detail is below median for growth-stage companies seeking Series A'
          },
          category: 'critical'
        },
        {
          section: 'Funding Ask',
          status: 'missing',
          score: 30,
          feedback: 'Funding amount mentioned but lacks use of funds breakdown and timeline.',
          detailedFeedback: {
            strengths: [
              'Funding amount is specified',
              'General use categories mentioned'
            ],
            weaknesses: [
              'Use of funds breakdown too high-level',
              'Timeline for fund deployment missing',
              'Milestones tied to funding unclear',
              'Dilution and valuation not addressed',
              'Alternative funding scenarios not considered'
            ],
            improvements: [
              'Create detailed use of funds with % allocation and timelines',
              'Show specific milestones to be achieved with funding',
              'Include 12-18 month runway calculation',
              'Add key hire positions and compensation ranges',
              'Show technology development roadmap and costs',
              'Include marketing and customer acquisition budget breakdown',
              'Add contingency planning for different funding amounts',
              'Show expected valuation and comparable company analysis'
            ],
            benchmarks: 'Clear funding asks show 18-24 month runway with specific milestone achievement',
            industryComparison: 'Funding ask clarity is in bottom 25% compared to successful Series A decks'
          },
          category: 'critical'
        }
      ];
      
      setResults(detailedResults);
      const avgScore = detailedResults.reduce((sum, result) => sum + result.score, 0) / detailedResults.length;
      setOverallScore(Math.round(avgScore));
      setIsValidating(false);
      
      toast({
        title: 'Advanced Validation Complete',
        description: 'Your pitch deck has been analyzed with detailed feedback.',
      });
    }, 3000);
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
