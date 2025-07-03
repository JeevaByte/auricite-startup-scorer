
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Rocket, Building, Heart, Cpu, ShoppingCart, Lightbulb } from 'lucide-react';

interface TargetAudienceSelectorProps {
  onSelect: (stage: string, industry: string) => void;
  selectedStage?: string;
  selectedIndustry?: string;
}

export const TargetAudienceSelector = ({ 
  onSelect, 
  selectedStage = '', 
  selectedIndustry = '' 
}: TargetAudienceSelectorProps) => {
  const [stage, setStage] = useState(selectedStage);
  const [industry, setIndustry] = useState(selectedIndustry);

  const stages = [
    { 
      id: 'pre-seed', 
      name: 'Pre-Seed', 
      description: 'Idea to MVP, seeking £25K-£100K',
      icon: <Lightbulb className="h-5 w-5" />
    },
    { 
      id: 'seed', 
      name: 'Seed', 
      description: 'MVP to product-market fit, £100K-£1M',
      icon: <Rocket className="h-5 w-5" />
    },
    { 
      id: 'series-a', 
      name: 'Series A', 
      description: 'Scaling operations, £1M-£5M',
      icon: <Building className="h-5 w-5" />
    }
  ];

  const industries = [
    { id: 'saas', name: 'SaaS/Tech', icon: <Cpu className="h-4 w-4" /> },
    { id: 'fintech', name: 'FinTech', icon: <Building className="h-4 w-4" /> },
    { id: 'healthtech', name: 'HealthTech', icon: <Heart className="h-4 w-4" /> },
    { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'marketplace', name: 'Marketplace', icon: <Building className="h-4 w-4" /> },
    { id: 'other', name: 'Other', icon: <Lightbulb className="h-4 w-4" /> }
  ];

  const handleSubmit = () => {
    if (stage && industry) {
      onSelect(stage, industry);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your startup
        </h2>
        <p className="text-gray-600">
          This helps us provide more targeted recommendations
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-4 block">
            What stage is your startup?
          </Label>
          <RadioGroup value={stage} onValueChange={setStage}>
            <div className="space-y-3">
              {stages.map((stageOption) => (
                <div key={stageOption.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={stageOption.id} id={stageOption.id} />
                  <Label 
                    htmlFor={stageOption.id} 
                    className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {stageOption.icon}
                      <div>
                        <div className="font-medium">{stageOption.name}</div>
                        <div className="text-sm text-gray-600">{stageOption.description}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-semibold mb-4 block">
            Which industry best describes your startup?
          </Label>
          <RadioGroup value={industry} onValueChange={setIndustry}>
            <div className="grid grid-cols-2 gap-3">
              {industries.map((industryOption) => (
                <div key={industryOption.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={industryOption.id} id={industryOption.id} />
                  <Label 
                    htmlFor={industryOption.id} 
                    className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 flex-1"
                  >
                    {industryOption.icon}
                    <span className="text-sm">{industryOption.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!stage || !industry}
          className="w-full"
        >
          Continue to Assessment
        </Button>
      </div>
    </Card>
  );
};
