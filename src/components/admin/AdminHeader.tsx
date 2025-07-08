
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AdminHeaderProps {
  onExportCSV: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onExportCSV }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Button onClick={onExportCSV} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};
