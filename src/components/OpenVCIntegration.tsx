import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestorData, openvcInvestors, getInvestorsByStage, getInvestorsBySector } from '@/utils/openvcData';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { ExternalLink, MapPin, DollarSign, Users, Search, Filter, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpenVCIntegrationProps {
  assessmentData: AssessmentData;
  scoreResult: ScoreResult;
}

interface MatchedInvestor extends InvestorData {
  matchScore: number;
}

export const OpenVCIntegration: React.FC<OpenVCIntegrationProps> = ({
  assessmentData,
  scoreResult
}) => {
  const [matchedInvestors, setMatchedInvestors] = useState<MatchedInvestor[]>([]);
  const [allInvestors, setAllInvestors] = useState<InvestorData[]>(openvcInvestors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    generateMatches();
  }, [assessmentData, scoreResult]);

  const generateMatches = () => {
    const fundingStage = assessmentData.fundingStage || 'seed';
    const sector = determineSector();
    const checkSize = determineCheckSize();
    
    // Score-based matching algorithm
    const matches = openvcInvestors
      .map(investor => ({
        ...investor,
        matchScore: calculateMatchScore(investor, fundingStage, sector, checkSize)
      }))
      .filter(investor => investor.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    setMatchedInvestors(matches);
  };

  const determineSector = (): string => {
    // Enhanced sector detection based on assessment data
    const { competitiveAdvantage, ipProtection, marketSize } = assessmentData;
    
    if (ipProtection === 'patentGranted' || competitiveAdvantage === 'patent') {
      return 'Deep Tech';
    }
    
    if (marketSize && ['1b-10b', 'over10b'].includes(marketSize)) {
      if (assessmentData.revenue) return 'FinTech';
      return 'AI/ML';
    }
    
    if (assessmentData.mrr && assessmentData.mrr !== 'none') {
      return 'SaaS';
    }
    
    return 'General Tech';
  };

  const determineCheckSize = (): string => {
    const goal = assessmentData.fundingGoal;
    if (!goal) return '£100K - £500K';
    
    const sizeMapping: Record<string, string> = {
      '50k': '£25K - £100K',
      '100k': '£50K - £250K',
      '500k': '£100K - £500K',
      '1m': '£500K - £1M',
      '5m': '£1M - £5M',
      '10m+': '£5M+'
    };
    
    return sizeMapping[goal] || '£100K - £500K';
  };

  const calculateMatchScore = (
    investor: InvestorData,
    fundingStage: string,
    sector: string,
    checkSize: string
  ): number => {
    let score = 0;
    
    // Stage alignment (40% weight)
    const stageMap: Record<string, string[]> = {
      'preSeed': ['Pre-Seed'],
      'seed': ['Pre-Seed', 'Seed'],
      'seriesA': ['Seed', 'Series A'],
      'seriesB': ['Series A', 'Series B'],
      'seriesC': ['Series B', 'Series C', 'Growth']
    };
    
    const relevantStages = stageMap[fundingStage] || ['Seed'];
    if (investor.stage.some(stage => relevantStages.includes(stage))) {
      score += 0.4;
    }
    
    // Sector alignment (30% weight)
    if (investor.sectors.some(s => 
      s.toLowerCase().includes(sector.toLowerCase()) || 
      sector.toLowerCase().includes(s.toLowerCase())
    )) {
      score += 0.3;
    }
    
    // Investment readiness score consideration (20% weight)
    const readinessMultiplier = Math.min(scoreResult.totalScore / 600, 1);
    score += 0.2 * readinessMultiplier;
    
    // Geographic preference (10% weight)
    if (investor.location.includes('London') || investor.location.includes('UK')) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  };

  const getFilteredInvestors = () => {
    let filtered = allInvestors;
    
    if (searchTerm) {
      filtered = filtered.filter(investor => 
        investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.sectors.some(sector => 
          sector.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (selectedStage !== 'all') {
      filtered = getInvestorsByStage(selectedStage);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(investor => investor.type === selectedType);
    }
    
    return filtered;
  };

  const getMatchBadgeColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getMatchLabel = (score: number): string => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Potential Match';
    return 'Low Match';
  };

  const handleInvestorContact = (investor: InvestorData) => {
    if (investor.website) {
      window.open(investor.website, '_blank');
    }
    
    toast({
      title: "Investor Research",
      description: `Opening ${investor.name}'s profile. Good luck with your outreach!`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            AI-Powered Investor Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{matchedInvestors.length}</div>
              <div className="text-sm text-muted-foreground">Matched Investors</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {matchedInvestors.filter(inv => inv.matchScore >= 0.6).length}
              </div>
              <div className="text-sm text-muted-foreground">High-Quality Matches</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(scoreResult.totalScore / 10)}%
              </div>
              <div className="text-sm text-muted-foreground">Investment Readiness</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Matching Algorithm:</strong> Based on funding stage ({assessmentData.fundingStage}), 
              sector ({determineSector()}), check size ({determineCheckSize()}), and your investment readiness score.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Smart Matches</TabsTrigger>
          <TabsTrigger value="directory">Full Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          {matchedInvestors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your assessment data or explore the full directory.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedInvestors.map((investor) => (
                <Card key={investor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{investor.name}</h3>
                          <Badge className={getMatchBadgeColor(investor.matchScore)}>
                            {getMatchLabel(investor.matchScore)}
                          </Badge>
                          <Badge variant="outline">{investor.type}</Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 text-sm">
                          {investor.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{investor.checkSize}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{investor.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {investor.sectors.slice(0, 3).map(sector => (
                            <Badge key={sector} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                          {investor.sectors.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{investor.sectors.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button 
                          onClick={() => handleInvestorContact(investor)}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Research
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="directory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investors, sectors, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="angel">Angel Investors</SelectItem>
                    <SelectItem value="seed">Seed Funds</SelectItem>
                    <SelectItem value="vc">VC Firms</SelectItem>
                    <SelectItem value="growth">Growth Equity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Directory Listing */}
          <div className="grid gap-4">
            {getFilteredInvestors().map((investor) => (
              <Card key={investor.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{investor.name}</h4>
                        <Badge variant="outline">{investor.type}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {investor.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{investor.checkSize}</span>
                        <span>{investor.location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {investor.sectors.map(sector => (
                          <Badge key={sector} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleInvestorContact(investor)}
                      className="ml-4"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredInvestors().length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};