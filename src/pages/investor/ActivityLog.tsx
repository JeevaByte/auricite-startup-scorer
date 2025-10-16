import React from 'react';
import { AuditLogViewer } from '@/components/investor/AuditLogViewer';
import { ExportReports } from '@/components/investor/ExportReports';

export default function ActivityLog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity & Reports</h1>
        <p className="text-muted-foreground">
          Track your interactions and export detailed reports
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AuditLogViewer />
        </div>
        <div>
          <ExportReports />
        </div>
      </div>
    </div>
  );
}
