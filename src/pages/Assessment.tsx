
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentData {
  prototype: boolean;
  revenue: boolean;
  fullTimeTeam: boolean;
  externalCapital: boolean;
  termSheets: boolean;
  capTable: boolean;
  employees: string;
  mrr: string;
  fundingGoal: string;
  investors: string;
  milestones: string;
}

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    prototype: false,
    revenue: false,
    fullTimeTeam: false,
    externalCapital: false,
    termSheets: false,
    capTable: false,
    employees: '1-5',
    mrr: '0',
    fundingGoal: '100k-500k',
    investors: '0',
    milestones: 'idea'
  });

  const steps = [
    { title: 'Product & Revenue', fields: ['prototype', 'revenue'] },
    { title: 'Team & Funding', fields: ['fullTimeTeam', 'externalCapital', 'termSheets', 'capTable'] },
    { title: 'Metrics', fields: ['employees', 'mrr', 'fundingGoal', 'investors', 'milestones'] }
  ];

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
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
          employees: assessmentData.employees,
          mrr: assessmentData.mrr,
          funding_goal: assessmentData.fundingGoal,
          investors: assessmentData.investors,
          milestones: assessmentData.milestones
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assessment Submitted',
        description: 'Your assessment has been submitted successfully!'
      });

      navigate('/results');
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
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prototype"
                checked={assessmentData.prototype}
                onCheckedChange={(checked) => handleInputChange('prototype', checked)}
              />
              <Label htmlFor="prototype">Do you have a working prototype?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue"
                checked={assessmentData.revenue}
                onCheckedChange={(checked) => handleInputChange('revenue', checked)}
              />
              <Label htmlFor="revenue">Do you have revenue?</Label>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fullTimeTeam"
                checked={assessmentData.fullTimeTeam}
                onCheckedChange={(checked) => handleInputChange('fullTimeTeam', checked)}
              />
              <Label htmlFor="fullTimeTeam">Do you have a full-time team?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="externalCapital"
                checked={assessmentData.externalCapital}
                onCheckedChange={(checked) => handleInputChange('externalCapital', checked)}
              />
              <Label htmlFor="externalCapital">Have you raised external capital?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termSheets"
                checked={assessmentData.termSheets}
                onCheckedChange={(checked) => handleInputChange('termSheets', checked)}
              />
              <Label htmlFor="termSheets">Do you have term sheets?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="capTable"
                checked={assessmentData.capTable}
                onCheckedChange={(checked) => handleInputChange('capTable', checked)}
              />
              <Label htmlFor="capTable">Do you have a cap table?</Label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Number of employees</Label>
              <RadioGroup
                value={assessmentData.employees}
                onValueChange={(value) => handleInputChange('employees', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-5" id="emp1" />
                  <Label htmlFor="emp1">1-5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6-10" id="emp2" />
                  <Label htmlFor="emp2">6-10</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11-50" id="emp3" />
                  <Label htmlFor="emp3">11-50</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50+" id="emp4" />
                  <Label htmlFor="emp4">50+</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Monthly Recurring Revenue (MRR)</Label>
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Investment Readiness Assessment</CardTitle>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h3>
              {renderStep()}
            </div>
            
            <div className="flex justify-between">
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
