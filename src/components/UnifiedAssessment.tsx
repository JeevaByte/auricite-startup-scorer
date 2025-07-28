import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { calculateScore } from '@/utils/scoreCalculator';

interface AssessmentData {
  // Core fields
  prototype: boolean | null;
  externalCapital: boolean | null;
  revenue: boolean | null;
  fullTimeTeam: boolean | null;
  termSheets: boolean | null;
  capTable: boolean | null;
  mrr: string;
  employees: string;
  fundingGoal: string;
  investors: string;
  milestones: string;
  
  // Progressive fields (shown after initial assessment)
  businessModel?: string;
  targetMarket?: string;
  uniqueValueProposition?: string;
  competitiveAdvantage?: string;
  burnRate?: string;
  runway?: string;
  keyTeamMembers?: string;
  advisors?: string;
  customers?: string;
  marketSize?: string;
  growthRate?: string;
  partnerships?: string;
  intellectualProperty?: string;
  legalStructure?: string;
}

interface UnifiedAssessmentProps {
  mode?: 'quick' | 'comprehensive';
  onComplete?: (result: any) => void;
}

export const UnifiedAssessment: React.FC<UnifiedAssessmentProps> = ({ 
  mode = 'quick',
  onComplete 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentMode, setAssessmentMode] = useState<'quick' | 'comprehensive'>(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showProgressiveOption, setShowProgressiveOption] = useState(false);
  
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    prototype: null,
    externalCapital: null,
    revenue: null,
    fullTimeTeam: null,
    termSheets: null,
    capTable: null,
    mrr: '',
    employees: '',
    fundingGoal: '',
    investors: '',
    milestones: ''
  });

  // Define steps based on mode
  const quickSteps = [
    { 
      title: 'Basic Information', 
      fields: ['prototype', 'revenue', 'fullTimeTeam', 'mrr', 'employees'] 
    },
    { 
      title: 'Funding & Goals', 
      fields: ['externalCapital', 'fundingGoal', 'investors', 'milestones'] 
    },
    { 
      title: 'Legal & Documentation', 
      fields: ['termSheets', 'capTable'] 
    }
  ];

  const comprehensiveSteps = [
    ...quickSteps,
    { 
      title: 'Business Strategy', 
      fields: ['businessModel', 'targetMarket', 'uniqueValueProposition', 'competitiveAdvantage'] 
    },
    { 
      title: 'Financial Details', 
      fields: ['burnRate', 'runway'] 
    },
    { 
      title: 'Team & Advisors', 
      fields: ['keyTeamMembers', 'advisors'] 
    },
    { 
      title: 'Market & Traction', 
      fields: ['customers', 'marketSize', 'growthRate', 'partnerships'] 
    },
    { 
      title: 'Legal & IP', 
      fields: ['intellectualProperty', 'legalStructure'] 
    }
  ];

  const steps = assessmentMode === 'quick' ? quickSteps : comprehensiveSteps;

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
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
      // If this is the last step of quick assessment, show progressive option
      if (assessmentMode === 'quick' && currentStep === quickSteps.length - 1) {
        setShowProgressiveOption(true);
        return;
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (showProgressiveOption) {
      setShowProgressiveOption(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const continueToComprehensive = () => {
    setAssessmentMode('comprehensive');
    setCurrentStep(quickSteps.length);
    setShowProgressiveOption(false);
  };

  const submitAssessment = async (skipComprehensive = false) => {
    if (!skipComprehensive && !validateCurrentStep()) {
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
      // Map data for database storage
      const dbData = {
        user_id: user.id,
        prototype: assessmentData.prototype ?? false,
        external_capital: assessmentData.externalCapital ?? false,
        revenue: assessmentData.revenue ?? false,
        full_time_team: assessmentData.fullTimeTeam ?? false,
        term_sheets: assessmentData.termSheets ?? false,
        cap_table: assessmentData.capTable ?? false,
        mrr: assessmentData.mrr || 'none',
        employees: assessmentData.employees || '1-2',
        funding_goal: assessmentData.fundingGoal || '100k',
        investors: assessmentData.investors || 'none',
        milestones: assessmentData.milestones || 'concept'
      };

      const { data, error } = await supabase
        .from('assessments')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      // Calculate score
      const mappedData = {
        prototype: assessmentData.prototype ?? false,
        externalCapital: assessmentData.externalCapital ?? false,
        revenue: assessmentData.revenue ?? false,
        fullTimeTeam: assessmentData.fullTimeTeam ?? false,
        termSheets: assessmentData.termSheets ?? false,
        capTable: assessmentData.capTable ?? false,
        mrr: (assessmentData.mrr || 'none') as 'none' | 'low' | 'medium' | 'high',
        employees: (assessmentData.employees || '1-2') as '1-2' | '3-10' | '11-50' | '50+',
        fundingGoal: (assessmentData.fundingGoal || '100k') as '50k' | '100k' | '500k' | '1m' | '5m' | '10m+',
        investors: (assessmentData.investors || 'none') as 'none' | 'angels' | 'vc' | 'lateStage',
        milestones: (assessmentData.milestones || 'concept') as 'concept' | 'launch' | 'scale' | 'exit'
      };

      const scoreResult = calculateScore(mappedData);

      // Store results in sessionStorage
      sessionStorage.setItem('assessmentResult', JSON.stringify({
        result: scoreResult,
        assessmentData: assessmentData,
        mode: assessmentMode
      }));

      toast({
        title: 'Assessment Completed!',
        description: `Your ${assessmentMode} assessment has been submitted successfully.`
      });

      if (onComplete) {
        onComplete(scoreResult);
      } else {
        navigate('/results', {
          state: {
            result: scoreResult,
            assessmentData: assessmentData,
            mode: assessmentMode
          }
        });
      }
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
    const currentStepFields = steps[currentStep].fields;
    
    return (
      <div className="space-y-6">
        {currentStepFields.map((field) => {
          switch (field) {
            case 'prototype':
              return (
                <div key={field} className="space-y-3">
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
              );

            case 'revenue':
              return (
                <div key={field} className="space-y-3">
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
              );

            case 'mrr':
              return (
                <div key={field} className="space-y-3">
                  <Label className="text-base font-medium">Monthly Recurring Revenue (MRR) *</Label>
                  <RadioGroup
                    value={assessmentData.mrr}
                    onValueChange={(value) => handleInputChange('mrr', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="mrr1" />
                      <Label htmlFor="mrr1">No recurring revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="mrr2" />
                      <Label htmlFor="mrr2">Under $10k/month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="mrr3" />
                      <Label htmlFor="mrr3">$10k - $100k/month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="mrr4" />
                      <Label htmlFor="mrr4">Over $100k/month</Label>
                    </div>
                  </RadioGroup>
                </div>
              );

            // Add more field renderers here...
            default:
              return (
                <div key={field} className="space-y-2">
                  <Label className="text-base font-medium">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                  </Label>
                  <Select 
                    value={assessmentData[field as keyof AssessmentData] as string || ''} 
                    onValueChange={(value) => handleInputChange(field as keyof AssessmentData, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
          }
        })}
      </div>
    );
  };

  // Progressive option screen
  if (showProgressiveOption) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Great Start! 🎉</CardTitle>
          <p className="text-center text-muted-foreground">
            You've completed the quick assessment. Would you like a more detailed analysis?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-muted">
              <h3 className="font-semibold mb-2">Get Results Now</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get your basic investment readiness score based on core metrics.
              </p>
              <Button 
                onClick={() => submitAssessment(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                Get Quick Results
              </Button>
            </Card>
            
            <Card className="p-4 border-2 border-primary">
              <h3 className="font-semibold mb-2">Continue for Detailed Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Answer additional questions for comprehensive insights and recommendations.
              </p>
              <Button 
                onClick={continueToComprehensive}
                variant="default"
                className="w-full"
              >
                Continue Assessment
              </Button>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button variant="ghost" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl">
              {assessmentMode === 'quick' ? 'Quick Investment Score' : 'Comprehensive Business Assessment'}
            </CardTitle>
            <p className="text-muted-foreground">
              {assessmentMode === 'quick' 
                ? 'Get your investment readiness score in minutes'
                : 'In-depth evaluation of your business readiness'
              }
            </p>
          </div>
          {assessmentMode === 'comprehensive' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setAssessmentMode('quick');
                setCurrentStep(0);
              }}
            >
              Switch to Quick
            </Button>
          )}
        </div>
        
        <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete all required fields:
              <ul className="list-disc list-inside mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {renderStep()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => submitAssessment()} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};