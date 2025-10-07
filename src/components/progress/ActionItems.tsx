import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Users, 
  FileText,
  Brain,
  CheckCircle
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  icon: any;
  route: string;
}

interface ActionItemsProps {
  score: any;
}

export const ActionItems: React.FC<ActionItemsProps> = ({ score }) => {
  const navigate = useNavigate();

  const getActionItems = (): ActionItem[] => {
    if (!score) {
      return [{
        id: '1',
        title: 'Complete Your Assessment',
        description: 'Start by completing your investment readiness assessment to get personalized recommendations.',
        priority: 'high',
        category: 'Assessment',
        action: 'Start Now',
        icon: Target,
        route: '/?assessment=true'
      }];
    }

    const items: ActionItem[] = [];
    const totalScore = score.totalScore || 0;

    // Business Idea improvements
    if (score.businessIdea < 70) {
      items.push({
        id: 'business',
        title: 'Strengthen Your Business Model',
        description: 'Your business idea score is below 70. Review your value proposition and market positioning.',
        priority: 'high',
        category: 'Business Idea',
        action: 'Learn More',
        icon: Brain,
        route: '/learn'
      });
    }

    // Team improvements
    if (score.team < 70) {
      items.push({
        id: 'team',
        title: 'Build Your Team',
        description: 'Investors look for strong teams. Consider adding key advisors or co-founders.',
        priority: 'high',
        category: 'Team',
        action: 'Get Guidance',
        icon: Users,
        route: '/learn'
      });
    }

    // Traction improvements
    if (score.traction < 70) {
      items.push({
        id: 'traction',
        title: 'Demonstrate Traction',
        description: 'Focus on acquiring users, generating revenue, or achieving key milestones.',
        priority: 'medium',
        category: 'Traction',
        action: 'View Resources',
        icon: TrendingUp,
        route: '/learn'
      });
    }

    // Financials improvements
    if (score.financials < 70) {
      items.push({
        id: 'financials',
        title: 'Improve Financial Planning',
        description: 'Strengthen your financial projections and documentation.',
        priority: 'medium',
        category: 'Financials',
        action: 'Learn How',
        icon: FileText,
        route: '/learn'
      });
    }

    // Always suggest AI feedback
    items.push({
      id: 'ai-feedback',
      title: 'Get AI-Powered Feedback',
      description: 'Upload your pitch deck or business plan for detailed AI analysis.',
      priority: 'low',
      category: 'Enhancement',
      action: 'Try AI Analysis',
      icon: Brain,
      route: '/ai-feedback'
    });

    // Suggest investor matching if score is good
    if (totalScore >= 60) {
      items.push({
        id: 'investors',
        title: 'Connect with Investors',
        description: 'Your score qualifies you to browse our investor directory.',
        priority: 'medium',
        category: 'Networking',
        action: 'Browse Investors',
        icon: Users,
        route: '/investor-directory'
      });
    }

    return items.slice(0, 5); // Limit to top 5 action items
  };

  const actionItems = getActionItems();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Action Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant={getPriorityColor(item.priority)} className="flex items-center gap-1 whitespace-nowrap">
                    {getPriorityIcon(item.priority)}
                    {item.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(item.route)}
                    className="ml-auto"
                  >
                    {item.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
