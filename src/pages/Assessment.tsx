
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentData {
  // Step 1: Business Idea
  prototype: boolean | null;
  businessModel: string;
  targetMarket: string;
  uniqueValueProposition: string;
  competitiveAdvantage: string;
  
  // Step 2: Financial Information
  revenue: boolean | null;
  mrr: string;
  fundingGoal: string;
  burnRate: string;
  runway: string;
  externalCapital: boolean | null;
  
  // Step 3: Team
  fullTimeTeam: boolean | null;
  teamSize: string;
  keyTeamMembers: string;
  advisors: string;
  
  // Step 4: Traction & Market
  customers: string;
  marketSize: string;
  growthRate: string;
  partnerships: string;
  
  // Step 5: Legal & Administrative
  termSheets: boolean | null;
  capTable: boolean | null;
  intellectualProperty: string;
  legalStructure: string;
}

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    // Step 1
    prototype: null,
    businessModel: '',
    targetMarket: '',
    uniqueValueProposition: '',
    competitiveAdvantage: '',
    
    // Step 2
    revenue: null,
    mrr: '',
    fundingGoal: '',
    burnRate: '',
    runway: '',
    externalCapital: null,
    
    // Step 3
    fullTimeTeam: null,
    teamSize: '',
    keyTeamMembers: '',
    advisors: '',
    
    // Step 4
    customers: '',
    marketSize: '',
    growthRate: '',
    partnerships: '',
    
    // Step 5
    termSheets: null,
    capTable: null,
    intellectualProperty: '',
    legalStructure: ''
  });

  const steps = [
    { 
      title: 'Business Idea', 
      fields: ['prototype', 'businessModel', 'targetMarket', 'uniqueValueProposition', 'competitiveAdvantage'] 
    },
    { 
      title: 'Financial Information', 
      fields: ['revenue', 'mrr', 'fundingGoal', 'burnRate', 'runway', 'externalCapital'] 
    },
    { 
      title: 'Team', 
      fields: ['fullTimeTeam', 'teamSize', 'keyTeamMembers', 'advisors'] 
    },
    { 
      title: 'Traction & Market', 
      fields: ['customers', 'marketSize', 'growthRate', 'partnerships'] 
    },
    { 
      title: 'Legal & Administrative', 
      fields: ['termSheets', 'capTable', 'intellectualProperty', 'legalStructure'] 
    }
  ];

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateCurrentStep = () => {
    const currentStepFields = steps[currentStep].fields;
    const stepErrors: string[] = [];

    currentStepFields.forEach(field => {
      const value = assessmentData[field as keyof AssessmentData];
      if (value === null || value === undefined || value === '') {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        stepErrors.push(`${fieldName} is required`);
      }
    });

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const submitAssessment = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit your assessment.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          prototype: assessmentData.prototype,
          revenue: assessmentData.revenue,
          full_time_team: assessmentData.fullTimeTeam,
          external_capital: assessmentData.externalCapital,
          term_sheets: assessmentData.termSheets,
          cap_table: assessmentData.capTable,
          employees: assessmentData.teamSize,
          mrr: assessmentData.mrr,
          funding_goal: assessmentData.fundingGoal,
          investors: '0', // Default value
          milestones: 'in_progress' // Default value
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assessment Submitted Successfully!',
        description: 'Your assessment has been submitted. Redirecting to results...'
      });

      // Redirect to results page after a short delay
      setTimeout(() => {
        navigate('/results');
      }, 2000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit assessment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Business Idea
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Do you have a working prototype? *</Label>
              <RadioGroup
                value={assessmentData.prototype === null ? '' : assessmentData.prototype.toString()}
                onValueChange={(value) => handleInputChange('prototype', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="prototype-yes" />
                  <Label htmlFor="prototype-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="prototype-no" />
                  <Label htmlFor="prototype-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessModel" className="text-base font-medium">Business Model *</Label>
              <Textarea
                id="businessModel"
                value={assessmentData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
                placeholder="Describe your business model and how you generate revenue"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket" className="text-base font-medium">Target Market *</Label>
              <Textarea
                id="targetMarket"
                value={assessmentData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Describe your target market and customer segments"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniqueValueProposition" className="text-base font-medium">Unique Value Proposition *</Label>
              <Textarea
                id="uniqueValueProposition"
                value={assessmentData.uniqueValueProposition}
                onChange={(e) => handleInputChange('uniqueValueProposition', e.target.value)}
                placeholder="What makes your solution unique and valuable?"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage" className="text-base font-medium">Competitive Advantage *</Label>
              <Textarea
                id="competitiveAdvantage"
                value={assessmentData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                placeholder="What gives you an edge over competitors?"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 1: // Financial Information
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Do you have revenue? *</Label>
              <RadioGroup
                value={assessmentData.revenue === null ? '' : assessmentData.revenue.toString()}
                onValueChange={(value) => handleInputChange('revenue', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="revenue-yes" />
                  <Label htmlFor="revenue-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="revenue-no" />
                  <Label htmlFor="revenue-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Monthly Recurring Revenue (MRR) *</Label>
              <RadioGroup
                value={assessmentData.mrr}
                onValueChange={(value) => handleInputChange('mrr', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="mrr1" />
                  <Label htmlFor="mrr1">$0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1k-10k" id="mrr2" />
                  <Label htmlFor="mrr2">$1K - $10K</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10k-100k" id="mrr3" />
                  <Label htmlFor="mrr3">$10K - $100K</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100k+" id="mrr4" />
                  <Label htmlFor="mrr4">$100K+</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fundingGoal" className="text-base font-medium">Funding Goal *</Label>
              <Input
                id="fundingGoal"
                value={assessmentData.fundingGoal}
                onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                placeholder="e.g., $500K, $1M, $5M"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnRate" className="text-base font-medium">Monthly Burn Rate *</Label>
              <Input
                id="burnRate"
                value={assessmentData.burnRate}
                onChange={(e) => handleInputChange('burnRate', e.target.value)}
                placeholder="e.g., $50K/month"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="runway" className="text-base font-medium">Current Runway *</Label>
              <Input
                id="runway"
                value={assessmentData.runway}
                onChange={(e) => handleInputChange('runway', e.target.value)}
                placeholder="e.g., 12 months, 18 months"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Have you raised external capital? *</Label>
              <RadioGroup
                value={assessmentData.externalCapital === null ? '' : assessmentData.externalCapital.toString()}
                onValueChange={(value) => handleInputChange('externalCapital', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="capital-yes" />
                  <Label htmlFor="capital-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="capital-no" />
                  <Label htmlFor="capital-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2: // Team
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Do you have a full-time team? *</Label>
              <RadioGroup
                value={assessmentData.fullTimeTeam === null ? '' : assessmentData.fullTimeTeam.toString()}
                onValueChange={(value) => handleInputChange('fullTimeTeam', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="team-yes" />
                  <Label htmlFor="team-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="team-no" />
                  <Label htmlFor="team-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Team Size *</Label>
              <RadioGroup
                value={assessmentData.teamSize}
                onValueChange={(value) => handleInputChange('teamSize', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-5" id="size1" />
                  <Label htmlFor="size1">1-5 members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6-10" id="size2" />
                  <Label htmlFor="size2">6-10 members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11-50" id="size3" />
                  <Label htmlFor="size3">11-50 members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50+" id="size4" />
                  <Label htmlFor="size4">50+ members</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyTeamMembers" className="text-base font-medium">Key Team Members *</Label>
              <Textarea
                id="keyTeamMembers"
                value={assessmentData.keyTeamMembers}
                onChange={(e) => handleInputChange('keyTeamMembers', e.target.value)}
                placeholder="Describe your key team members, their roles, and backgrounds"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advisors" className="text-base font-medium">Advisors *</Label>
              <Textarea
                id="advisors"
                value={assessmentData.advisors}
                onChange={(e) => handleInputChange('advisors', e.target.value)}
                placeholder="List your advisors and their expertise (or 'None' if no advisors)"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 3: // Traction & Market
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customers" className="text-base font-medium">Customer Base *</Label>
              <Input
                id="customers"
                value={assessmentData.customers}
                onChange={(e) => handleInputChange('customers', e.target.value)}
                placeholder="e.g., 1000 active users, 50 paying customers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketSize" className="text-base font-medium">Market Size *</Label>
              <Input
                id="marketSize"
                value={assessmentData.marketSize}
                onChange={(e) => handleInputChange('marketSize', e.target.value)}
                placeholder="e.g., $500M TAM, $50M SAM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="growthRate" className="text-base font-medium">Growth Rate *</Label>
              <Input
                id="growthRate"
                value={assessmentData.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
                placeholder="e.g., 20% MoM, 300% YoY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerships" className="text-base font-medium">Key Partnerships *</Label>
              <Textarea
                id="partnerships"
                value={assessmentData.partnerships}
                onChange={(e) => handleInputChange('partnerships', e.target.value)}
                placeholder="Describe key partnerships or strategic relationships (or 'None' if no partnerships)"
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 4: // Legal & Administrative
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Do you have term sheets? *</Label>
              <RadioGroup
                value={assessmentData.termSheets === null ? '' : assessmentData.termSheets.toString()}
                onValueChange={(value) => handleInputChange('termSheets', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="terms-yes" />
                  <Label htmlFor="terms-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="terms-no" />
                  <Label htmlFor="terms-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Do you have a cap table? *</Label>
              <RadioGroup
                value={assessmentData.capTable === null ? '' : assessmentData.capTable.toString()}
                onValueChange={(value) => handleInputChange('capTable', value === 'true')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="cap-yes" />
                  <Label htmlFor="cap-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="cap-no" />
                  <Label htmlFor="cap-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intellectualProperty" className="text-base font-medium">Intellectual Property *</Label>
              <Textarea
                id="intellectualProperty"
                value={assessmentData.intellectualProperty}
                onChange={(e) => handleInputChange('intellectualProperty', e.target.value)}
                placeholder="Describe patents, trademarks, copyrights, or trade secrets (or 'None' if no IP)"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalStructure" className="text-base font-medium">Legal Structure *</Label>
              <Input
                id="legalStructure"
                value={assessmentData.legalStructure}
                onChange={(e) => handleInputChange('legalStructure', e.target.value)}
                placeholder="e.g., Delaware C-Corp, LLC, Partnership"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access the investment readiness assessment.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Investment Readiness Assessment</CardTitle>
            <p className="text-muted-foreground">
              Complete all sections to get a comprehensive analysis of your startup's investment readiness.
            </p>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full mt-4" />
            <div className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Please fill in all required fields:</p>
                    <ul className="list-disc list-inside text-sm">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h3>
              {renderStep()}
            </div>
            
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button onClick={submitAssessment} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;
