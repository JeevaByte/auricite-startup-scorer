import React, { useState } from 'react';
import { Search, HelpCircle, MessageCircle, Book, Video, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { sanitizeText } from '@/utils/inputSanitization';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Your Assessment',
    description: 'Learn how to complete your first investment readiness assessment',
    category: 'Getting Started',
    content: `
      <h3>Welcome to Investment Assessment</h3>
      <p>Our platform helps you evaluate your startup's investment readiness through a comprehensive 5-step assessment.</p>
      
      <h4>Assessment Steps:</h4>
      <ol>
        <li><strong>Business Idea:</strong> Evaluate your market opportunity, competitive advantage, and innovation</li>
        <li><strong>Team:</strong> Assess founder experience, team composition, and advisory board</li>
        <li><strong>Financials:</strong> Review revenue model, financial projections, and funding requirements</li>
        <li><strong>Traction:</strong> Demonstrate customer validation, growth metrics, and market penetration</li>
        <li><strong>Review:</strong> Final review and submission of your assessment</li>
      </ol>
      
      <h4>Tips for Success:</h4>
      <ul>
        <li>Be honest and thorough in your responses</li>
        <li>Provide specific examples and data where possible</li>
        <li>Take your time - you can save and continue later</li>
        <li>Review our scoring criteria for each section</li>
      </ul>
    `,
    tags: ['assessment', 'getting-started', 'basics']
  },
  {
    id: 'scoring-system',
    title: 'Understanding the Scoring System',
    description: 'Learn how we calculate your investment readiness score',
    category: 'Scoring',
    content: `
      <h3>How Scoring Works</h3>
      <p>Your investment readiness score is calculated based on four key areas, each weighted according to investor priorities.</p>
      
      <h4>Scoring Breakdown:</h4>
      <ul>
        <li><strong>Business Idea (25%):</strong> Market size, competitive advantage, innovation</li>
        <li><strong>Team (30%):</strong> Founder experience, team composition, advisory board</li>
        <li><strong>Financials (25%):</strong> Revenue model, projections, unit economics</li>
        <li><strong>Traction (20%):</strong> Customer validation, growth metrics, market penetration</li>
      </ul>
      
      <h4>Score Ranges:</h4>
      <ul>
        <li><strong>80-100:</strong> Investment Ready - Strong candidate for funding</li>
        <li><strong>60-79:</strong> Nearly Ready - Address key areas for improvement</li>
        <li><strong>40-59:</strong> Developing - Significant work needed before seeking investment</li>
        <li><strong>Below 40:</strong> Early Stage - Focus on fundamentals before assessment</li>
      </ul>
    `,
    tags: ['scoring', 'evaluation', 'metrics']
  },
  {
    id: 'premium-features',
    title: 'Premium Features Overview',
    description: 'Discover advanced features available with premium plans',
    category: 'Premium',
    content: `
      <h3>Premium Features</h3>
      <p>Upgrade to unlock advanced capabilities that help you connect with investors and track your progress.</p>
      
      <h4>Investor Matching:</h4>
      <ul>
        <li>AI-powered matching with relevant investors</li>
        <li>Direct contact information and preferences</li>
        <li>Investment criteria and portfolio analysis</li>
        <li>Introduction request system</li>
      </ul>
      
      <h4>Advanced Analytics:</h4>
      <ul>
        <li>Detailed progress tracking over time</li>
        <li>Benchmark comparisons with industry peers</li>
        <li>Investor readiness trends</li>
        <li>Custom reporting and insights</li>
      </ul>
      
      <h4>Priority Support:</h4>
      <ul>
        <li>24/7 customer support</li>
        <li>1-on-1 consultation sessions</li>
        <li>Custom assessment guidance</li>
        <li>Investor pitch preparation</li>
      </ul>
    `,
    tags: ['premium', 'features', 'investors', 'analytics']
  },
  {
    id: 'technical-issues',
    title: 'Troubleshooting Technical Issues',
    description: 'Common technical problems and their solutions',
    category: 'Technical',
    content: `
      <h3>Common Technical Issues</h3>
      
      <h4>Assessment Not Saving:</h4>
      <ul>
        <li>Check your internet connection</li>
        <li>Ensure you're logged in to your account</li>
        <li>Try refreshing the page and continuing</li>
        <li>Clear your browser cache and cookies</li>
      </ul>
      
      <h4>Can't Access Results:</h4>
      <ul>
        <li>Ensure you've completed all assessment steps</li>
        <li>Check if your assessment is still processing</li>
        <li>Try logging out and back in</li>
        <li>Contact support if the issue persists</li>
      </ul>
      
      <h4>Browser Compatibility:</h4>
      <ul>
        <li>We support Chrome, Firefox, Safari, and Edge</li>
        <li>Ensure your browser is up to date</li>
        <li>Disable ad blockers for our site</li>
        <li>Try using an incognito/private window</li>
      </ul>
    `,
    tags: ['technical', 'troubleshooting', 'browser', 'support']
  }
];

const faqItems = [
  {
    question: "How long does the assessment take?",
    answer: "Most users complete the assessment in 20-30 minutes. You can save your progress and return at any time."
  },
  {
    question: "Is my data secure and confidential?",
    answer: "Yes, we use enterprise-grade encryption and never share your data without explicit permission. All information is stored securely and confidentially."
  },
  {
    question: "Can I retake the assessment?",
    answer: "Yes, you can retake the assessment as many times as you like. We recommend waiting at least 30 days between assessments to track meaningful progress."
  },
  {
    question: "How do I upgrade to premium?",
    answer: "You can upgrade at any time by visiting the pricing page or clicking the upgrade button in your dashboard. All premium features are available immediately after payment."
  },
  {
    question: "What if I need help with my results?",
    answer: "Premium users have access to 1-on-1 consultation sessions. Free users can access our help center and community forums for guidance."
  }
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = ['all', ...Array.from(new Set(helpArticles.map(article => article.category)))];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Help Center
              </CardTitle>
              <CardDescription>
                Find answers to common questions and learn how to use the platform
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          {selectedArticle ? (
            <div className="p-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedArticle(null)}
                className="mb-4"
              >
                ← Back to Help Center
              </Button>
              
              <div className="prose max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-2xl font-bold m-0">{selectedArticle.title}</h1>
                  <Badge variant="secondary">{selectedArticle.category}</Badge>
                </div>
                <div 
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeText(selectedArticle.content) }}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search for help articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Book className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive guides and tutorials</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Video Tutorials</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Contact Support</h3>
                    <p className="text-sm text-muted-foreground">Get help from our team</p>
                  </CardContent>
                </Card>
              </div>

              {/* Articles */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Help Articles</h2>
                <div className="grid gap-4">
                  {filteredArticles.map(article => (
                    <Card 
                      key={article.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{article.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {article.description}
                            </p>
                            <div className="flex gap-1 mt-2">
                              {article.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible>
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};