
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from './DashboardStats';
import { AssessmentsTable } from './AssessmentsTable';
import { ApiAccessManager } from './ApiAccessManager';
import { EnhancedAnalyticsDashboard } from './EnhancedAnalyticsDashboard';
import { RescoreManager } from './RescoreManager';
import { ScoringVersionManager } from './ScoringVersionManager';
import { AuditTrail } from './AuditTrail';
import { SearchFilter } from './SearchFilter';
import { ManualDataCorrection } from './ManualDataCorrection';
import { WebhookManager } from './WebhookManager';
import { AbuseDetection } from '@/components/security/AbuseDetection';
import { DonationsTable } from './DonationsTable';
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
      <TabsList className="grid w-full grid-cols-10">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="donations">Donations</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="scoring">Scoring</TabsTrigger>
        <TabsTrigger value="rescore">Re-score</TabsTrigger>
        <TabsTrigger value="edit">Edit Data</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
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
        <EnhancedAnalyticsDashboard />
      </TabsContent>

      <TabsContent value="scoring">
        <ScoringVersionManager />
      </TabsContent>

      <TabsContent value="rescore">
        <RescoreManager />
      </TabsContent>

      <TabsContent value="donations" className="space-y-4">
        <DonationsTable />
      </TabsContent>

      <TabsContent value="edit">
        <div className="space-y-4">
          <SearchFilter searchTerm={searchTerm} onSearchChange={onSearchChange} />
          {filteredAssessments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssessments.slice(0, 5).map((assessment) => (
                <ManualDataCorrection
                  key={assessment.id}
                  assessment={assessment}
                  onUpdate={() => window.location.reload()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No assessments found for editing.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="webhooks">
        <WebhookManager />
      </TabsContent>

      <TabsContent value="security">
        <AbuseDetection />
      </TabsContent>

      <TabsContent value="audit">
        <AuditTrail />
      </TabsContent>
    </Tabs>
  );
};
