
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from './DashboardStats';
import { AssessmentsTable } from './AssessmentsTable';
import { ApiAccessManager } from './ApiAccessManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RescoreManager } from './RescoreManager';
import { ScoringVersionManager } from './ScoringVersionManager';
import { AuditTrail } from './AuditTrail';
import { SearchFilter } from './SearchFilter';
import { DashboardStats as DashboardStatsType, AssessmentWithUser } from '@/types/admin';

interface AdminTabsProps {
  stats: DashboardStatsType;
  assessments: AssessmentWithUser[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ stats, assessments, searchTerm, onSearchChange }) => {
  const filteredAssessments = assessments.filter(assessment =>
    assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="scoring">Scoring</TabsTrigger>
        <TabsTrigger value="rescore">Re-score</TabsTrigger>
        <TabsTrigger value="api">API Access</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardStats stats={stats} />
      </TabsContent>

      <TabsContent value="assessments">
        <div className="space-y-4">
          <SearchFilter searchTerm={searchTerm} onSearchChange={onSearchChange} />
          <AssessmentsTable assessments={filteredAssessments} />
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>

      <TabsContent value="scoring">
        <ScoringVersionManager />
      </TabsContent>

      <TabsContent value="rescore">
        <RescoreManager />
      </TabsContent>

      <TabsContent value="api">
        <ApiAccessManager />
      </TabsContent>

      <TabsContent value="audit">
        <AuditTrail />
      </TabsContent>
    </Tabs>
  );
};
