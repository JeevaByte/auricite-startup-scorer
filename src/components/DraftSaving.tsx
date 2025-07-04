import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Clock, CheckCircle } from 'lucide-react';
import { AssessmentData } from '@/utils/scoreCalculator';

interface DraftSavingProps {
  assessmentData: AssessmentData;
  currentStep: number;
  onLoadDraft?: (data: AssessmentData, step: number) => void;
}

export const DraftSaving = ({ assessmentData, currentStep, onLoadDraft }: DraftSavingProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const { toast } = useToast();

  // Auto-save every 30 seconds or when data changes
  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(autoSave);
  }, [assessmentData, currentStep]);

  // Save draft to localStorage (in real app, this would be Supabase)
  const saveDraft = async () => {
    try {
      setSaveStatus('saving');
      
      const draftData = {
        assessmentData,
        currentStep,
        timestamp: new Date().toISOString(),
        id: `draft_${Date.now()}`
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.setItem('assessment_draft', JSON.stringify(draftData));
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      toast({
        title: "Save Failed",
        description: "Unable to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load existing draft
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('assessment_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (onLoadDraft) {
          onLoadDraft(draft.assessmentData, draft.currentStep);
        }
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: "Load Failed",
        description: "Unable to load your saved progress.",
        variant: "destructive",
      });
    }
  };

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('assessment_draft');
    setHasDraft(!!savedDraft);
  }, []);

  const clearDraft = () => {
    localStorage.removeItem('assessment_draft');
    setHasDraft(false);
    toast({
      title: "Draft Cleared",
      description: "Saved progress has been removed.",
    });
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        {saveStatus === 'saving' && (
          <>
            <Clock className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Saving...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Saved</span>
          </>
        )}
        {saveStatus === 'idle' && lastSaved && (
          <span className="text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={saveDraft}
          disabled={saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-1" />
          Save Now
        </Button>

        {hasDraft && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDraft}
            >
              Load Draft
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
            >
              Clear
            </Button>
          </>
        )}
      </div>

      <Badge variant="secondary" className="text-xs">
        Auto-save enabled
      </Badge>
    </div>
  );
};
