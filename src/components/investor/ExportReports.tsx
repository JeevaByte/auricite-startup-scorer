import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type ReportType = 'portfolio' | 'saved' | 'activity' | 'matches';
type ExportFormat = 'pdf' | 'csv';

export function ExportReports() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('portfolio');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export reports',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let data: any[] = [];
      let filename = '';

      // Mock data - in production this would fetch from database
      const mockData = [
        {
          id: '1',
          name: 'TechStartup Inc',
          sector: 'FinTech',
          stage: 'Seed',
          score: 750,
          date: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'InnovateCo',
          sector: 'HealthTech',
          stage: 'Pre-seed',
          score: 680,
          date: new Date().toISOString(),
        },
      ];

      data = mockData;
      filename = `${reportType}_report`;

      if (exportFormat === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToPDF(data, filename, reportType);
      }

      toast({
        title: 'Export Successful',
        description: `Your ${reportType} report has been downloaded`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any[], filename: string, type: string) => {
    // Simple PDF generation - in production, use a library like jsPDF
    const content = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Records: ${data.length}</p>
          <table>
            <thead>
              <tr>${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portfolio">Portfolio Summary</SelectItem>
              <SelectItem value="saved">Saved Startups</SelectItem>
              <SelectItem value="activity">Activity Log</SelectItem>
              <SelectItem value="matches">Match History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Document
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  CSV Spreadsheet
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export Report'}
          <Download className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
