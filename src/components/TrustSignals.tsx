
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Users, CheckCircle, Star, TrendingUp } from 'lucide-react';

export const TrustSignals = () => {
  const trustMetrics = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      metric: "500+",
      label: "Startups Assessed",
      description: "Trusted by founders across the UK"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      metric: "£2.5M+",
      label: "Capital Raised",
      description: "By startups using our platform"
    },
    {
      icon: <Award className="h-5 w-5 text-purple-600" />,
      metric: "150+",
      label: "Angel Connections",
      description: "Successful investor introductions"
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      metric: "4.8/5",
      label: "User Rating",
      description: "Average satisfaction score"
    }
  ];

  const trustFeatures = [
    {
      icon: <Shield className="h-4 w-4 text-green-600" />,
      label: "Bank-grade security",
      description: "256-bit SSL encryption"
    },
    {
      icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
      label: "GDPR Compliant",
      description: "Full data privacy protection"
    },
    {
      icon: <Award className="h-4 w-4 text-purple-600" />,
      label: "Validated Methodology",
      description: "Based on 1000+ investor preferences"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustMetrics.map((metric, index) => (
          <Card key={index} className="p-4 text-center">
            <div className="flex justify-center mb-2">
              {metric.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.metric}
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {metric.label}
            </div>
            <div className="text-xs text-gray-500">
              {metric.description}
            </div>
          </Card>
        ))}
      </div>

      {/* Trust Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Why Startups Trust Us
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="mt-1">
                {feature.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {feature.label}
                </div>
                <div className="text-xs text-gray-600">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Methodology Transparency */}
      <Card className="p-6 bg-blue-50">
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">
            Transparent Scoring Methodology
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Our scoring algorithm is based on analysis of 1000+ successful funding rounds 
            and vetted by experienced angel investors and VCs.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">30% Business Idea</Badge>
            <Badge variant="outline">25% Financials</Badge>
            <Badge variant="outline">25% Team</Badge>
            <Badge variant="outline">20% Traction</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
