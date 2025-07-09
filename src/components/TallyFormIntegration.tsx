
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Star } from 'lucide-react';

export const TallyFormIntegration = () => {
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

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-medium">Feature Request</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Suggest new features or improvements to existing functionality.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">General Feedback</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Share your overall experience and thoughts about the platform.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Send className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Bug Report</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Report technical issues or unexpected behavior.
                </p>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Feedback Form</h3>
              <p className="text-gray-600 mb-4">
                Click below to open our feedback form in a new window
              </p>
              <button
                onClick={() => window.open('https://tally.so/r/feedback-form', '_blank')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Open Feedback Form
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Your feedback is valuable to us and helps make InvestReady better for everyone.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
