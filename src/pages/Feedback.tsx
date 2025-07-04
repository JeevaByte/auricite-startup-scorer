
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TallyFormIntegration } from '@/components/TallyFormIntegration';
import { AIFeedbackSystem } from '@/components/AIFeedbackSystem';
import { PitchDeckValidator } from '@/components/PitchDeckValidator';
import { MessageSquare, Brain, FileText, Send } from 'lucide-react';

export default function Feedback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback & AI Analysis</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get AI-powered feedback on your content, validate your pitch deck, and share your thoughts with our team
          </p>
        </div>

        <Tabs defaultValue="ai-feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ai-feedback" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Content Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="pitch-deck" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Pitch Deck Validator</span>
            </TabsTrigger>
            <TabsTrigger value="user-feedback" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Share Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-feedback">
            <AIFeedbackSystem />
          </TabsContent>

          <TabsContent value="pitch-deck">
            <PitchDeckValidator />
          </TabsContent>

          <TabsContent value="user-feedback">
            <TallyFormIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
