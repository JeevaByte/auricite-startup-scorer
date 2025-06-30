
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Building, Banknote, Globe } from 'lucide-react';

interface Props {
  classification: {
    category: 'Angel' | 'VC' | 'Family Office' | 'Institutional' | 'Crowdfunding';
    confidence: number;
    explanation: string;
  };
}

const categoryIcons = {
  'Angel': Users,
  'VC': TrendingUp,
  'Family Office': Building,
  'Institutional': Banknote,
  'Crowdfunding': Globe,
};

const categoryColors = {
  'Angel': 'bg-blue-500',
  'VC': 'bg-green-500',
  'Family Office': 'bg-purple-500',
  'Institutional': 'bg-orange-500',
  'Crowdfunding': 'bg-pink-500',
};

const categoryDescriptions = {
  'Angel': 'Individual investors who provide capital for startups, typically in early stages.',
  'VC': 'Venture capital firms that invest in high-growth potential companies.',
  'Family Office': 'Private wealth management advisory firms serving ultra-high-net-worth individuals.',
  'Institutional': 'Large financial institutions like pension funds, insurance companies, and endowments.',
  'Crowdfunding': 'Platform-based investing where many individuals contribute smaller amounts.',
};

const InvestorClassification: React.FC<Props> = ({ classification }) => {
  const Icon = categoryIcons[classification.category];
  const confidencePercentage = Math.round(classification.confidence * 100);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${categoryColors[classification.category]} text-white`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl">Your Investor Classification</CardTitle>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {classification.category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Confidence Level</span>
            <span className="text-sm text-muted-foreground">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>

        <div>
          <h3 className="font-semibold mb-2">What this means:</h3>
          <p className="text-muted-foreground mb-4">
            {categoryDescriptions[classification.category]}
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Classification Reasoning:</h4>
            <p className="text-sm">{classification.explanation}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Browse startups that match your investment criteria</li>
            <li>• Connect with entrepreneurs in your preferred stages</li>
            <li>• Join our investor network for exclusive deal flow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestorClassification;
