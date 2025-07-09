
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BotProtection } from '@/components/security/BotProtection';
import { useTranslation } from '@/utils/i18n';

export const AssessmentForm: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    prototype: false,
    revenue: false,
    fullTimeTeam: false,
    externalCapital: false,
    termSheets: false,
    capTable: false,
    mrr: '',
    employees: '',
    fundingGoal: '',
    investors: '',
    milestones: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please complete the security verification',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to submit your assessment',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('assessments').insert({
        user_id: user.user.id,
        prototype: formData.prototype,
        revenue: formData.revenue,
        full_time_team: formData.fullTimeTeam,
        external_capital: formData.externalCapital,
        term_sheets: formData.termSheets,
        cap_table: formData.capTable,
        mrr: formData.mrr,
        employees: formData.employees,
        funding_goal: formData.fundingGoal,
        investors: formData.investors,
        milestones: formData.milestones
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assessment submitted successfully',
      });

      // Reset form
      setFormData({
        prototype: false,
        revenue: false,
        fullTimeTeam: false,
        externalCapital: false,
        termSheets: false,
        capTable: false,
        mrr: '',
        employees: '',
        fundingGoal: '',
        investors: '',
        milestones: ''
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Readiness Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prototype"
                checked={formData.prototype}
                onChange={(e) => setFormData({...formData, prototype: e.target.checked})}
                aria-describedby="prototype-description"
              />
              <label htmlFor="prototype" className="font-medium">
                {t('form.prototype')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="revenue"
                checked={formData.revenue}
                onChange={(e) => setFormData({...formData, revenue: e.target.checked})}
                aria-describedby="revenue-description"
              />
              <label htmlFor="revenue" className="font-medium">
                {t('form.revenue')}
              </label>
            </div>
          </div>

          <BotProtection onVerificationChange={setIsVerified} />

          <Button 
            type="submit" 
            disabled={!isVerified}
            className="w-full"
            aria-label="Submit assessment form"
          >
            {t('button.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
