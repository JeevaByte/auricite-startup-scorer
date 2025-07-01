
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { runFullValidation } from '@/utils/validationReport';

interface ChecklistItem {
  category: string;
  items: {
    name: string;
    status: 'complete' | 'partial' | 'pending' | 'missing';
    description: string;
  }[];
}

const checklistData: ChecklistItem[] = [
  {
    category: 'Core Infrastructure',
    items: [
      {
        name: 'Supabase Database',
        status: 'complete',
        description: 'All tables created with proper RLS policies'
      },
      {
        name: 'Authentication',
        status: 'complete',
        description: 'User auth with Supabase Auth'
      },
      {
        name: 'Responsive Design',
        status: 'complete',
        description: 'Mobile-first Tailwind CSS implementation'
      }
    ]
  },
  {
    category: 'Assessment Engine',
    items: [
      {
        name: 'Scoring Algorithm',
        status: 'complete',
        description: 'Weighted scoring with proper calculations'
      },
      {
        name: '11-Question Form',
        status: 'complete',
        description: 'Complete assessment form with validation'
      },
      {
        name: 'Results Dashboard',
        status: 'complete',
        description: 'Score display with recommendations'
      }
    ]
  },
  {
    category: 'Gamification',
    items: [
      {
        name: 'Badge System',
        status: 'complete',
        description: '5 badge types with assignment logic'
      },
      {
        name: 'Achievement Display',
        status: 'complete',
        description: 'Badges shown on results page'
      }
    ]
  },
  {
    category: 'Legal & Compliance',
    items: [
      {
        name: 'Terms of Service',
        status: 'complete',
        description: 'Comprehensive terms page'
      },
      {
        name: 'Privacy Policy',
        status: 'complete',
        description: 'GDPR-compliant privacy policy'
      }
    ]
  },
  {
    category: 'External Integrations',
    items: [
      {
        name: 'Tally.so Form',
        status: 'partial',
        description: 'Using custom form - Tally integration pending'
      },
      {
        name: 'LiteLLM/OpenRouter',
        status: 'partial',
        description: 'Using local functions - API integration pending'
      },
      {
        name: 'PostHog Analytics',
        status: 'pending',
        description: 'Analytics integration not implemented'
      }
    ]
  }
];

const statusIcons = {
  complete: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  partial: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  pending: <Clock className="h-5 w-5 text-blue-600" />,
  missing: <XCircle className="h-5 w-5 text-red-600" />
};

const statusColors = {
  complete: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  missing: 'bg-red-100 text-red-800'
};

export const ProductionChecklist = () => {
  const [validationReport, setValidationReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunValidation = async () => {
    setIsLoading(true);
    try {
      const report = await runFullValidation();
      setValidationReport(report);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalStats = () => {
    const allItems = checklistData.flatMap(category => category.items);
    const complete = allItems.filter(item => item.status === 'complete').length;
    const total = allItems.length;
    return { complete, total, percentage: Math.round((complete / total) * 100) };
  };

  const stats = getTotalStats();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Production Readiness Checklist
        </h1>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-lg text-gray-600">
              MVP Completion: {stats.complete}/{stats.total} items ({stats.percentage}%)
            </p>
          </div>
          <Button 
            onClick={handleRunValidation}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Validating...' : 'Run Full Validation'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {checklistData.map((category) => (
          <Card key={category.category} className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {statusIcons[item.status]}
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[item.status]}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {validationReport && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Validation Report
          </h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {validationReport}
          </pre>
        </Card>
      )}
    </div>
  );
};
