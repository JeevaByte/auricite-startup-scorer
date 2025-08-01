
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Star, Bug, Lightbulb, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const InternalFeedbackSystem = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || !subject || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map priority to rating values expected by the database constraint
      const ratingMap = {
        'low': 'helpful',
        'medium': 'helpful', 
        'high': 'not_helpful',
        'critical': 'not_helpful'
      };
      
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          section: 'overall', // Use valid constraint value
          rating: ratingMap[priority as keyof typeof ratingMap] || 'helpful',
          feedback: `Type: ${feedbackType}\nSubject: ${subject}\n\nDescription: ${description}\n\nPriority: ${priority || 'Not specified'}\n\nContact: ${email || 'Not provided'}`,
        });

      if (error) throw error;

      toast({
        title: 'Feedback Submitted Successfully!',
        description: 'Thank you for your feedback. We\'ll review it and get back to you soon.',
      });

      // Reset form
      setFeedbackType('');
      setPriority('');
      setSubject('');
      setDescription('');
      setEmail('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { id: 'feature-request', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-600' },
    { id: 'bug-report', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { id: 'general-feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-green-600' },
    { id: 'ui-improvement', label: 'UI/UX Improvement', icon: Star, color: 'text-purple-600' },
    { id: 'performance-issue', label: 'Performance Issue', icon: AlertTriangle, color: 'text-orange-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Share Your Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-4">
                Help us improve InvestReady by sharing your thoughts, suggestions, or reporting any issues you've encountered.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {feedbackTypes.slice(0, 3).map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <IconComponent className={`h-5 w-5 ${type.color}`} />
                      <h3 className="font-medium">{type.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {type.id === 'feature-request' && 'Suggest new features or improvements to existing functionality.'}
                      {type.id === 'bug-report' && 'Report technical issues or unexpected behavior.'}
                      {type.id === 'general-feedback' && 'Share your overall experience and thoughts about the platform.'}
                    </p>
                  </Card>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  What type of feedback are you sharing? *
                </Label>
                <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
                  {feedbackTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label htmlFor={type.id} className="flex items-center space-x-2 cursor-pointer">
                          <IconComponent className={`h-4 w-4 ${type.color}`} />
                          <span>{type.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="priority" className="text-base font-medium mb-2 block">
                  Priority Level
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor issue or suggestion</SelectItem>
                    <SelectItem value="medium">Medium - Noticeable improvement needed</SelectItem>
                    <SelectItem value="high">High - Significant issue affecting usability</SelectItem>
                    <SelectItem value="critical">Critical - Blocking or breaking functionality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-base font-medium mb-2 block">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium mb-2 block">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For feature requests, explain the use case and expected behavior."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium mb-2 block">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com - if you'd like us to follow up"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide your email if you'd like updates on your feedback or need a response.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Your feedback is valuable to us and helps make InvestReady better for everyone.</p>
              <p className="mt-1">We typically respond to feedback within 2-3 business days.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
