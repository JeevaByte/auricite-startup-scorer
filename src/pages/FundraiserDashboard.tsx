import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentsTable } from '@/components/admin/AssessmentsTable';
import { useAdminData } from '@/hooks/useAdminData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function FundraiserDashboard() {
  const { user } = useAuth();
  const { assessments, stats, loading } = useAdminData(user?.id);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fundraiser Dashboard</h1>
        <p className="text-muted-foreground">Manage investor interest and explore opportunities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Fundraisers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalAssessments}</p>
            <p className="text-xs text-muted-foreground">Active fundraising campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Investor Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {assessments.filter(a => a.total_score && a.total_score > 70).length}
            </p>
            <p className="text-xs text-muted-foreground">High-score fundraisers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {assessments.length > 0 
                ? Math.round(assessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / assessments.length)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
      </div>

      <AssessmentsTable assessments={assessments.filter(a => a.total_score)} />
    </div>
  );
}
