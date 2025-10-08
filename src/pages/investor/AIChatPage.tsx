import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIInvestmentChat } from '@/components/investor/AIInvestmentChat';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sparkles } from 'lucide-react';

const AIChatPage = () => {
  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Investment Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Ask questions about startups, get recommendations, and discover investment opportunities
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AIInvestmentChat />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Find Startups</p>
                  <p className="text-muted-foreground">
                    "Show me top fintech startups with score above 80"
                  </p>
                </div>
                <div>
                  <p className="font-medium">Get Recommendations</p>
                  <p className="text-muted-foreground">
                    "Which startups match my investment criteria?"
                  </p>
                </div>
                <div>
                  <p className="font-medium">Analyze Sectors</p>
                  <p className="text-muted-foreground">
                    "What are the top performing sectors this quarter?"
                  </p>
                </div>
                <div>
                  <p className="font-medium">Compare Startups</p>
                  <p className="text-muted-foreground">
                    "Compare startup A vs startup B"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Natural language queries</p>
                <p>✓ Personalized recommendations</p>
                <p>✓ Real-time startup data</p>
                <p>✓ Score explanations</p>
                <p>✓ Investment insights</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AIChatPage;