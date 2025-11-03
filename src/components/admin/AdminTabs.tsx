
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
import { ZohoSyncManager } from './ZohoSyncManager';
import { InvestorVerificationConsole } from './InvestorVerificationConsole';
import { InvestorCSVImporter } from './InvestorCSVImporter';
import BenchmarkManager from './BenchmarkManager';
import DriftMonitoring from './DriftMonitoring';
import { DashboardStats as DashboardStatsType, AssessmentWithUser } from '@/types/admin';
import { FeatureFlagsManager } from './FeatureFlagsManager';
import { ErrorMonitoring } from './ErrorMonitoring';
import { OrganizationManager } from './OrganizationManager';
import { TenantBrandingManager } from './TenantBrandingManager';
import { ScheduledReportsManager } from './ScheduledReportsManager';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import InvestorDirectory from '@/pages/InvestorDirectory';
import StartupDirectory from '@/pages/StartupDirectory';

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
      <TabsList className="grid w-full grid-cols-14">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="donations">Donations</TabsTrigger>
        <TabsTrigger value="investor-directory">Investor Directory</TabsTrigger>
        <TabsTrigger value="startup-directory">Startup Directory</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="scoring">Scoring</TabsTrigger>
        <TabsTrigger value="rescore">Re-score</TabsTrigger>
        <TabsTrigger value="edit">Edit Data</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="crm">CRM Sync</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        <TabsTrigger value="features">Feature Flags</TabsTrigger>
        <TabsTrigger value="errors">Error Monitor</TabsTrigger>
        <TabsTrigger value="organizations">Organizations</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
        <TabsTrigger value="ml-ops">ML Ops</TabsTrigger>
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

      <TabsContent value="investor-directory">
        <InvestorDirectory />
      </TabsContent>

      <TabsContent value="startup-directory">
        <StartupDirectory />
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

      <TabsContent value="crm">
        <div className="space-y-6">
          <ZohoSyncManager />
          <InvestorVerificationConsole />
          <InvestorCSVImporter />
        </div>
      </TabsContent>

      <TabsContent value="security">
        <AbuseDetection />
      </TabsContent>

      <TabsContent value="audit">
        <AuditTrail />
      </TabsContent>

      <TabsContent value="features">
        <FeatureFlagsManager />
      </TabsContent>

      <TabsContent value="errors">
        <ErrorMonitoring />
      </TabsContent>

      <TabsContent value="organizations">
        <OrganizationManager />
      </TabsContent>

      <TabsContent value="branding">
        <TenantBrandingManager />
      </TabsContent>

      <TabsContent value="reports">
        <ScheduledReportsManager />
      </TabsContent>

      <TabsContent value="investors">
        <InvestorVerificationConsole />
      </TabsContent>

      <TabsContent value="health">
        <SystemHealthMonitor />
      </TabsContent>

      <TabsContent value="ml-ops">
        <div className="space-y-6">
          <BenchmarkManager />
          <DriftMonitoring />
        </div>
      </TabsContent>
    </Tabs>
  );
};
