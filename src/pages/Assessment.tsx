import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentData {
  // Core fields that exist in database
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
  
  // Additional fields for form UI (not saved to database)
  businessModel: string;
  targetMarket: string;
  uniqueValueProposition: string;
  competitiveAdvantage: string;
  burnRate: string;
  runway: string;
  keyTeamMembers: string;
  advisors: string;
  customers: string;
  marketSize: string;
  growthRate: string;
  partnerships: string;
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
    // Database fields
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
    milestones: '',
    
    // UI only fields
    businessModel: '',
    targetMarket: '',
    uniqueValueProposition: '',
    competitiveAdvantage: '',
    burnRate: '',
    runway: '',
    keyTeamMembers: '',
    advisors: '',
    customers: '',
    marketSize: '',
    growthRate: '',
    partnerships: '',
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
      fields: ['fullTimeTeam', 'employees', 'keyTeamMembers', 'advisors'] 
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
      console.log('Submitting assessment with data:', assessmentData);
      
      // Map form data to database fields with proper defaults
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

      console.log('Database data to be inserted:', dbData);

      const { data, error } = await supabase
        .from('assessments')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Assessment saved successfully:', data);

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
              <Select value={assessmentData.businessModel} onValueChange={(value) => handleInputChange('businessModel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your business model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">Software as a Service (SaaS)</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="subscription">Subscription Service</SelectItem>
                  <SelectItem value="advertising">Advertising/Media</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="licensing">Licensing</SelectItem>
                  <SelectItem value="consulting">Consulting/Services</SelectItem>
                  <SelectItem value="hardware">Hardware Sales</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket" className="text-base font-medium">Target Market *</Label>
              <Select value={assessmentData.targetMarket} onValueChange={(value) => handleInputChange('targetMarket', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your target market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2b-enterprise">B2B Enterprise</SelectItem>
                  <SelectItem value="b2b-smb">B2B Small/Medium Business</SelectItem>
                  <SelectItem value="b2c-consumer">B2C Consumer</SelectItem>
                  <SelectItem value="b2c-premium">B2C Premium/Luxury</SelectItem>
                  <SelectItem value="b2g">B2G Government</SelectItem>
                  <SelectItem value="b2b2c">B2B2C</SelectItem>
                  <SelectItem value="niche-vertical">Niche Industry Vertical</SelectItem>
                  <SelectItem value="global-mass">Global Mass Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniqueValueProposition" className="text-base font-medium">Unique Value Proposition *</Label>
              <Select value={assessmentData.uniqueValueProposition} onValueChange={(value) => handleInputChange('uniqueValueProposition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main value proposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost-reduction">Significant Cost Reduction</SelectItem>
                  <SelectItem value="time-saving">Time Saving/Efficiency</SelectItem>
                  <SelectItem value="new-capability">Enables New Capabilities</SelectItem>
                  <SelectItem value="better-experience">Better User Experience</SelectItem>
                  <SelectItem value="automation">Process Automation</SelectItem>
                  <SelectItem value="data-insights">Data Insights/Analytics</SelectItem>
                  <SelectItem value="security">Enhanced Security</SelectItem>
                  <SelectItem value="scalability">Improved Scalability</SelectItem>
                  <SelectItem value="integration">Better Integration</SelectItem>
                  <SelectItem value="innovation">Breakthrough Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage" className="text-base font-medium">Competitive Advantage *</Label>
              <Select value={assessmentData.competitiveAdvantage} onValueChange={(value) => handleInputChange('competitiveAdvantage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your competitive advantage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietary-technology">Proprietary Technology</SelectItem>
                  <SelectItem value="network-effects">Network Effects</SelectItem>
                  <SelectItem value="first-mover">First Mover Advantage</SelectItem>
                  <SelectItem value="exclusive-partnerships">Exclusive Partnerships</SelectItem>
                  <SelectItem value="brand-recognition">Strong Brand Recognition</SelectItem>
                  <SelectItem value="regulatory-moat">Regulatory Barriers</SelectItem>
                  <SelectItem value="data-advantage">Unique Data Access</SelectItem>
                  <SelectItem value="cost-structure">Superior Cost Structure</SelectItem>
                  <SelectItem value="team-expertise">Team Expertise</SelectItem>
                  <SelectItem value="customer-lock-in">High Customer Lock-in</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="fundingGoal" className="text-base font-medium">Funding Goal *</Label>
              <Select value={assessmentData.fundingGoal} onValueChange={(value) => handleInputChange('fundingGoal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your funding goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50k">Under $50k</SelectItem>
                  <SelectItem value="100k">$50k - $100k</SelectItem>
                  <SelectItem value="500k">$100k - $500k</SelectItem>
                  <SelectItem value="1m">$500k - $1M</SelectItem>
                  <SelectItem value="5m">$1M - $5M</SelectItem>
                  <SelectItem value="10m+">Over $5M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnRate" className="text-base font-medium">Monthly Burn Rate *</Label>
              <Select value={assessmentData.burnRate} onValueChange={(value) => handleInputChange('burnRate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your monthly burn rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10K</SelectItem>
                  <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                  <SelectItem value="25k-50k">$25K - $50K</SelectItem>
                  <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                  <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                  <SelectItem value="over-250k">Over $250K</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="runway" className="text-base font-medium">Current Runway *</Label>
              <Select value={assessmentData.runway} onValueChange={(value) => handleInputChange('runway', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your current runway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-6m">Less than 6 months</SelectItem>
                  <SelectItem value="6m-12m">6-12 months</SelectItem>
                  <SelectItem value="12m-18m">12-18 months</SelectItem>
                  <SelectItem value="18m-24m">18-24 months</SelectItem>
                  <SelectItem value="over-24m">Over 24 months</SelectItem>
                </SelectContent>
              </Select>
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
                value={assessmentData.employees}
                onValueChange={(value) => handleInputChange('employees', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2" id="size1" />
                  <Label htmlFor="size1">1-2 employees</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3-10" id="size2" />
                  <Label htmlFor="size2">3-10 employees</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11-50" id="size3" />
                  <Label htmlFor="size3">11-50 employees</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50+" id="size4" />
                  <Label htmlFor="size4">50+ employees</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyTeamMembers" className="text-base font-medium">Key Team Members Background *</Label>
              <Select value={assessmentData.keyTeamMembers} onValueChange={(value) => handleInputChange('keyTeamMembers', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-time">First-time entrepreneurs</SelectItem>
                  <SelectItem value="some-experience">Some startup experience</SelectItem>
                  <SelectItem value="serial-entrepreneurs">Serial entrepreneurs</SelectItem>
                  <SelectItem value="industry-veterans">Industry veterans</SelectItem>
                  <SelectItem value="tech-experts">Technical experts</SelectItem>
                  <SelectItem value="domain-experts">Domain experts</SelectItem>
                  <SelectItem value="mixed-background">Mixed backgrounds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advisors" className="text-base font-medium">Advisory Board *</Label>
              <Select value={assessmentData.advisors} onValueChange={(value) => handleInputChange('advisors', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select advisor status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No advisors</SelectItem>
                  <SelectItem value="informal">Informal mentors</SelectItem>
                  <SelectItem value="formal-advisors">Formal advisory board</SelectItem>
                  <SelectItem value="industry-experts">Industry expert advisors</SelectItem>
                  <SelectItem value="investor-advisors">Investor advisors</SelectItem>
                  <SelectItem value="strategic-advisors">Strategic advisors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3: // Traction & Market
        return (
          <div className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="customers" className="text-base font-medium">Customer Base *</Label>
              <Select value={assessmentData.customers} onValueChange={(value) => handleInputChange('customers', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your customer base size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-customers">No customers yet</SelectItem>
                  <SelectItem value="1-10">1-10 customers</SelectItem>
                  <SelectItem value="11-100">11-100 customers</SelectItem>
                  <SelectItem value="101-1000">101-1,000 customers</SelectItem>
                  <SelectItem value="1001-10000">1,001-10,000 customers</SelectItem>
                  <SelectItem value="over-10000">Over 10,000 customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketSize" className="text-base font-medium">Market Size (TAM) *</Label>
              <Select value={assessmentData.marketSize} onValueChange={(value) => handleInputChange('marketSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select total addressable market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-100m">Under $100M</SelectItem>
                  <SelectItem value="100m-1b">$100M - $1B</SelectItem>
                  <SelectItem value="1b-10b">$1B - $10B</SelectItem>
                  <SelectItem value="10b-100b">$10B - $100B</SelectItem>
                  <SelectItem value="over-100b">Over $100B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="growthRate" className="text-base font-medium">Growth Rate *</Label>
              <Select value={assessmentData.growthRate} onValueChange={(value) => handleInputChange('growthRate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your growth rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-growth">No growth/declining</SelectItem>
                  <SelectItem value="slow">Slow growth (0-10% monthly)</SelectItem>
                  <SelectItem value="moderate">Moderate growth (10-20% monthly)</SelectItem>
                  <SelectItem value="high">High growth (20-50% monthly)</SelectItem>
                  <SelectItem value="hypergrowth">Hypergrowth (50%+ monthly)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerships" className="text-base font-medium">Key Partnerships *</Label>
              <Select value={assessmentData.partnerships} onValueChange={(value) => handleInputChange('partnerships', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select partnership status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No partnerships</SelectItem>
                  <SelectItem value="exploring">Exploring partnerships</SelectItem>
                  <SelectItem value="signed-mous">Signed MOUs/LOIs</SelectItem>
                  <SelectItem value="active-partnerships">Active partnerships</SelectItem>
                  <SelectItem value="strategic-partnerships">Strategic partnerships</SelectItem>
                  <SelectItem value="enterprise-partnerships">Enterprise partnerships</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={assessmentData.intellectualProperty} onValueChange={(value) => handleInputChange('intellectualProperty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select IP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No IP protection</SelectItem>
                  <SelectItem value="trade-secrets">Trade secrets</SelectItem>
                  <SelectItem value="copyrights">Copyrights</SelectItem>
                  <SelectItem value="trademarks">Trademarks</SelectItem>
                  <SelectItem value="patent-pending">Patents pending</SelectItem>
                  <SelectItem value="patents-granted">Patents granted</SelectItem>
                  <SelectItem value="comprehensive-ip">Comprehensive IP portfolio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalStructure" className="text-base font-medium">Legal Structure *</Label>
              <Select value={assessmentData.legalStructure} onValueChange={(value) => handleInputChange('legalStructure', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select legal structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="c-corp">C-Corporation</SelectItem>
                  <SelectItem value="s-corp">S-Corporation</SelectItem>
                  <SelectItem value="delaware-c-corp">Delaware C-Corporation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Set default values for missing fields */}
            {(() => {
              // Auto-set required fields based on form data
              if (!assessmentData.investors) {
                handleInputChange('investors', 'none');
              }
              if (!assessmentData.milestones) {
                handleInputChange('milestones', 'concept');
              }
              return null;
            })()}
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
