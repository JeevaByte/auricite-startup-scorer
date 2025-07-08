import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoringVersionManager } from './ScoringVersionManager';
import { RescoreManager } from './RescoreManager';
import { AuditTrail } from './AuditTrail';
import { AssessmentsTable } from './AssessmentsTable';
import { SearchFilter } from './SearchFilter';
import { ApiAccessManager } from './ApiAccessManager';

interface AssessmentWithUser {
  id: string;
  created_at: string;
  prototype: boolean;
  revenue: boolean;
  full_time_team: boolean;
  employees: string;
  funding_goal: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  company_name?: string;
  total_score?: number;
}

interface AdminTabsProps {
  assessments: AssessmentWithUser[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ 
  assessments, 
  searchTerm, 
  onSearchChange 
}) => {
  const filteredAssessments = assessments.filter(assessment =>
    assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs defaultValue="assessments" className="space-y-4">
      <TabsList>
        <TabsTrigger value="assessments">All Assessments</TabsTrigger>
        <TabsTrigger value="scoring">Scoring Management</TabsTrigger>
        <TabsTrigger value="rescore">Dynamic Re-Scoring</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        <TabsTrigger value="api">API Access</TabsTrigger>
        <TabsTrigger value="config">System Config</TabsTrigger>
      </TabsList>

      <TabsContent value="assessments" className="space-y-4">
        <SearchFilter searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <AssessmentsTable assessments={filteredAssessments} />
      </TabsContent>

      <TabsContent value="scoring">
        <ScoringVersionManager />
      </TabsContent>

      <TabsContent value="rescore">
        <RescoreManager />
      </TabsContent>

      <TabsContent value="audit">
        <AuditTrail />
      </TabsContent>

      <TabsContent value="api">
        <ApiAccessManager />
      </TabsContent>

      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced system configuration options will be available in the next update.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
