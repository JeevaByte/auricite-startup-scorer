
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { saveAssessmentData } from '@/utils/database';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';
import { calculateConfigBasedScore } from '@/utils/configBasedScoring';
import { sendReportEmail } from '@/utils/emailService';

export const AssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    prototype: null,
    externalCapital: null,
    revenue: null,
    fullTimeTeam: null,
    termSheets: null,
    capTable: null,
    mrr: null,
    employees: null,
    fundingGoal: null,
    investors: null,
    milestones: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const checkCompletion = () => {
      const allFieldsFilled = Object.values(assessmentData).every(value => value !== null);
      setIsComplete(allFieldsFilled);
    };

    checkCompletion();
  }, [assessmentData]);

  useEffect(() => {
    if (user) {
      loadDraft();
    }
  }, [user]);

  const loadDraft = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assessment_drafts')
        .select('draft_data')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading draft:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved draft.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.draft_data) {
        setAssessmentData(data.draft_data as AssessmentData);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved draft.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      saveDraft();
    }
  }, [assessmentData, user]);

  const saveDraft = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('assessment_drafts')
        .upsert({
          user_id: user.id,
          draft_data: assessmentData,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving draft:', error);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSwitchChange = (field: keyof AssessmentData, checked: boolean) => {
    setAssessmentData(prevData => ({
      ...prevData,
      [field]: checked,
    }));
  };

  const handleSelectChange = (field: keyof AssessmentData, value: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleInputChange = (field: keyof AssessmentData, value: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isComplete || !user) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting assessment data:', assessmentData);

      // Use config-based scoring
      const result = await calculateConfigBasedScore(assessmentData);
      console.log('Calculated score result:', result);

      // Save to database
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          prototype: assessmentData.prototype,
          external_capital: assessmentData.externalCapital,
          revenue: assessmentData.revenue,
          full_time_team: assessmentData.fullTimeTeam,
          term_sheets: assessmentData.termSheets,
          cap_table: assessmentData.capTable,
          mrr: assessmentData.mrr,
          employees: assessmentData.employees,
          funding_goal: assessmentData.fundingGoal || '',
          investors: assessmentData.investors,
          milestones: assessmentData.milestones,
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Assessment save error:', assessmentError);
        throw assessmentError;
      }

      console.log('Assessment saved:', assessment);

      // Save score
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          business_idea: result.businessIdea,
          business_idea_explanation: result.businessIdeaExplanation,
          financials: result.financials,
          financials_explanation: result.financialsExplanation,
          team: result.team,
          team_explanation: result.teamExplanation,
          traction: result.traction,
          traction_explanation: result.tractionExplanation,
          total_score: result.totalScore,
        });

      if (scoreError) {
        console.error('Score save error:', scoreError);
        throw scoreError;
      }

      // Save to assessment history
      await saveAssessmentData(assessmentData, user.id);

      // Send email notification if user has email
      if (user.email) {
        try {
          const success = await sendReportEmail({
            email: user.email,
            name: user.user_metadata?.full_name,
            totalScore: result.totalScore,
            assessmentId: assessment.id,
          });

          if (success) {
            toast({
              title: 'Email Sent!',
              description: 'Your assessment report has been emailed to you.',
            });
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't block the flow if email fails
        }
      }

      // Clear draft
      await supabase
        .from('assessment_drafts')
        .delete()
        .eq('user_id', user.id);

      navigate('/results', { 
        state: { result, assessmentData }
      });

    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle>Investment Readiness Assessment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="prototype">Do you have a working prototype?</Label>
            <Switch 
              id="prototype" 
              checked={assessmentData.prototype || false} 
              onCheckedChange={(checked) => handleSwitchChange('prototype', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="externalCapital">Have you raised external capital?</Label>
            <Switch 
              id="externalCapital" 
              checked={assessmentData.externalCapital || false} 
              onCheckedChange={(checked) => handleSwitchChange('externalCapital', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="revenue">Are you generating revenue?</Label>
            <Switch 
              id="revenue" 
              checked={assessmentData.revenue || false} 
              onCheckedChange={(checked) => handleSwitchChange('revenue', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullTimeTeam">Is your team full-time?</Label>
            <Switch 
              id="fullTimeTeam" 
              checked={assessmentData.fullTimeTeam || false} 
              onCheckedChange={(checked) => handleSwitchChange('fullTimeTeam', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="termSheets">Have you received term sheets?</Label>
            <Switch 
              id="termSheets" 
              checked={assessmentData.termSheets || false} 
              onCheckedChange={(checked) => handleSwitchChange('termSheets', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="capTable">Do you have a documented cap table?</Label>
            <Switch 
              id="capTable" 
              checked={assessmentData.capTable || false} 
              onCheckedChange={(checked) => handleSwitchChange('capTable', checked)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mrr">Monthly Recurring Revenue (MRR)</Label>
            <Select onValueChange={(value) => handleSelectChange('mrr', value)} value={assessmentData.mrr || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select MRR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Select onValueChange={(value) => handleSelectChange('employees', value)} value={assessmentData.employees || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2</SelectItem>
                <SelectItem value="3-10">3-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fundingGoal">Funding Goal</Label>
            <Input
              type="text"
              id="fundingGoal"
              value={assessmentData.fundingGoal || ''}
              onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
              placeholder="Enter funding goal"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="investors">Type of Investors</Label>
            <Select onValueChange={(value) => handleSelectChange('investors', value)} value={assessmentData.investors || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Investor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="angels">Angels</SelectItem>
                <SelectItem value="vc">VC</SelectItem>
                <SelectItem value="lateStage">Late Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="milestones">Current Milestone</Label>
            <Select onValueChange={(value) => handleSelectChange('milestones', value)} value={assessmentData.milestones || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Milestone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="launch">Launch</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || !isComplete}>
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
