
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Users, TrendingUp } from 'lucide-react';

export const BrandVoice = {
  // Brand tone and voice guidelines
  tone: 'empowering-and-clear',
  
  // Messaging themes
  messaging: {
    empowerment: "Take control of your funding journey",
    clarity: "Clear insights, actionable steps",
    confidence: "Present your startup with confidence",
    growth: "Built for ambitious founders"
  },
  
  // Voice attributes
  attributes: {
    professional: true,
    approachable: true,
    innovative: true,
    trustworthy: true,
    action_oriented: true
  }
};

// Brand messaging component
export const BrandMessaging = () => {
  const brandMessages = [
    {
      icon: <Target className="h-5 w-5 text-blue-600" />,
      title: "Funding-Ready in Minutes",
      description: "Transform uncertainty into confidence with instant, actionable feedback"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-green-600" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations that actually move the needle"
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: "Founder-First Design",
      description: "Built by entrepreneurs, for entrepreneurs who refuse to settle"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      title: "Track Your Progress",
      description: "Watch your investment readiness grow with every improvement"
    }
  ];

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="text-center mb-6">
        <Badge className="mb-4">Empowering Founders</Badge>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Funding Journey Starts Here
        </h2>
        <p className="text-gray-600">
          Stop guessing. Start knowing. Get the clarity you need to raise funding with confidence.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brandMessages.map((message, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
            {message.icon}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {message.title}
              </h3>
              <p className="text-xs text-gray-600">
                {message.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
