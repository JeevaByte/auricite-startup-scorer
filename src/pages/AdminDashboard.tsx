
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { useAdminData } from '@/hooks/useAdminData';
import { exportAssessmentsToCSV } from '@/utils/adminExport';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    assessments,
    stats,
    loading,
    isAdmin
  } = useAdminData(user?.id);

  const handleExportCSV = () => {
    exportAssessmentsToCSV(assessments, searchTerm);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminHeader onExportCSV={handleExportCSV} />
      <AdminTabs 
        stats={stats}
        assessments={assessments}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}
