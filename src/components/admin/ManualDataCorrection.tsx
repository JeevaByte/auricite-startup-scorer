
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit3, Save, X } from 'lucide-react';
import { AssessmentWithUser } from '@/types/admin';

interface ManualDataCorrectionProps {
  assessment: AssessmentWithUser;
  onUpdate: () => void;
}

export const ManualDataCorrection: React.FC<ManualDataCorrectionProps> = ({ assessment, onUpdate }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    prototype: assessment.prototype,
    revenue: assessment.revenue,
    full_time_team: assessment.full_time_team,
    external_capital: assessment.external_capital,
    term_sheets: assessment.term_sheets,
    cap_table: assessment.cap_table,
    mrr: assessment.mrr || '',
    employees: assessment.employees || '',
    funding_goal: assessment.funding_goal || '',
    investors: assessment.investors || '',
    milestones: assessment.milestones || ''
  });
  const [editReason, setEditReason] = useState('');

  const handleSave = async () => {
    if (!editReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the edit',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update the assessment
      const { error: updateError } = await supabase
        .from('assessments')
        .update(editData)
        .eq('id', assessment.id);

      if (updateError) throw updateError;

      // Log the edit
      const changes = Object.keys(editData).filter(key => {
        const originalValue = assessment[key as keyof typeof assessment];
        const newValue = editData[key as keyof typeof editData];
        return originalValue !== newValue;
      });

      for (const field of changes) {
        await supabase.from('assessment_edits').insert({
          assessment_id: assessment.id,
          edited_by: (await supabase.auth.getUser()).data.user?.id,
          field_name: field,
          old_value: String(assessment[field as keyof typeof assessment] || ''),
          new_value: String(editData[field as keyof typeof editData] || ''),
          edit_reason: editReason
        });
      }

      toast({
        title: 'Success',
        description: 'Assessment updated successfully',
      });

      setIsEditing(false);
      setEditReason('');
      onUpdate();
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assessment',
        variant: 'destructive',
      });
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Manual Data Correction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit Assessment Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Assessment Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prototype</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.prototype}
                onChange={(e) => setEditData({...editData, prototype: e.target.checked})}
                aria-label="Has prototype"
              />
              <span>Has Prototype</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Revenue</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.revenue}
                onChange={(e) => setEditData({...editData, revenue: e.target.checked})}
                aria-label="Has revenue"
              />
              <span>Has Revenue</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full-time Team</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.full_time_team}
                onChange={(e) => setEditData({...editData, full_time_team: e.target.checked})}
                aria-label="Has full-time team"
              />
              <span>Has Full-time Team</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>External Capital</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.external_capital}
                onChange={(e) => setEditData({...editData, external_capital: e.target.checked})}
                aria-label="Has external capital"
              />
              <span>Has External Capital</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mrr">Monthly Recurring Revenue</Label>
            <Input
              id="mrr"
              value={editData.mrr}
              onChange={(e) => setEditData({...editData, mrr: e.target.value})}
              aria-label="Monthly recurring revenue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              value={editData.employees}
              onChange={(e) => setEditData({...editData, employees: e.target.value})}
              aria-label="Number of employees"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="funding_goal">Funding Goal</Label>
          <Input
            id="funding_goal"
            value={editData.funding_goal}
            onChange={(e) => setEditData({...editData, funding_goal: e.target.value})}
            aria-label="Funding goal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_reason">Reason for Edit *</Label>
          <Textarea
            id="edit_reason"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="Explain why you're making this edit..."
            required
            aria-label="Reason for editing assessment"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
