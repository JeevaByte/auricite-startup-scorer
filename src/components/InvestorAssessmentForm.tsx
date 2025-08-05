
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { InvestorProfileData, saveInvestorProfile, saveInvestorClassification, classifyInvestor } from '@/utils/investorDatabase';
import { Loader2 } from 'lucide-react';

interface InvestorClassification {
  category: string;
  risk_tolerance: string;
  investment_style: string;
  stage_preference: string[];
  sector_focus: string[];
  ticket_size_range: {
    min: number;
    max: number;
  };
}

interface Props {
  onComplete: (classification: InvestorClassification) => void;
}

const InvestorAssessmentForm: React.FC<Props> = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InvestorProfileData>({
    defaultValues: {
      personalCapital: false,
      structuredFund: false,
      registeredEntity: false,
      dueDiligence: false,
      esgMetrics: false,
      checkSize: 'low',
      stage: 'preSeed',
      dealSource: 'personal',
      frequency: 'occasional',
      objective: 'support',
    },
  });

  const onSubmit = async (data: InvestorProfileData) => {
    setIsSubmitting(true);
    try {
      // Save investor profile
      const profileId = await saveInvestorProfile(data);
      
      // Get AI classification
      const classification = await classifyInvestor(data);
      
      // Save classification
      await saveInvestorClassification(profileId, classification);
      
      toast({
        title: "Assessment Complete!",
        description: `You've been classified as: ${classification.category}`,
      });
      
      onComplete(classification);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Assessment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Investor Classification Assessment</CardTitle>
        <p className="text-muted-foreground">
          Help us understand your investment profile to match you with relevant startups.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Yes/No Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="personalCapital"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you invest your personal capital?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="structuredFund"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you manage a structured fund?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registeredEntity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Are you a registered investment entity?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDiligence"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you conduct formal due diligence?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esgMetrics"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you consider ESG metrics?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Multiple Choice Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="checkSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your typical check size?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <label htmlFor="low">Low ($1K-$25K)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <label htmlFor="medium">Medium ($25K-$100K)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <label htmlFor="high">High ($100K-$1M)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="veryHigh" id="veryHigh" />
                          <label htmlFor="veryHigh">Very High ($1M+)</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What stage do you typically invest in?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="preSeed" id="preSeed" />
                          <label htmlFor="preSeed">Pre-Seed</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seed" id="seed" />
                          <label htmlFor="seed">Seed</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seriesB" id="seriesB" />
                          <label htmlFor="seriesB">Series A/B</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="preIPO" id="preIPO" />
                          <label htmlFor="preIPO">Pre-IPO</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you source deals?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="personal" id="personal" />
                          <label htmlFor="personal">Personal Network</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="platforms" id="platforms" />
                          <label htmlFor="platforms">Investment Platforms</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="funds" id="funds" />
                          <label htmlFor="funds">Through Funds</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <label htmlFor="public">Public Offerings</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How often do you invest?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="occasional" id="occasional" />
                          <label htmlFor="occasional">Occasional</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="frequent" id="frequent" />
                          <label htmlFor="frequent">Frequent</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quarterly" id="quarterly" />
                          <label htmlFor="quarterly">Quarterly</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portfolio" id="portfolio" />
                          <label htmlFor="portfolio">Portfolio Based</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your primary investment objective?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="support" id="support" />
                          <label htmlFor="support">Support Entrepreneurs</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="returns" id="returns" />
                          <label htmlFor="returns">Financial Returns</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="strategic" id="strategic" />
                          <label htmlFor="strategic">Strategic Value</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="impact" id="impact" />
                          <label htmlFor="impact">Social Impact</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Assessment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvestorAssessmentForm;
