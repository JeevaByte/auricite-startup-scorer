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

  const exportToPDF = async (data: any[], filename: string, type: string) => {
    try {
      // Dynamically import jsPDF and html2canvas
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Create temporary container for PDF content
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.fontFamily = 'Inter, system-ui, sans-serif';
      
      container.innerHTML = `
        <div style="max-width: 794px; margin: 0 auto; background: white;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 36px; font-weight: 700; color: #1e40af; margin: 0 0 12px 0;">
              ${type.charAt(0).toUpperCase() + type.slice(1)} Report
            </h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">
              Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
              Total Records: ${data.length}
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                ${Object.keys(data[0] || {}).map(key => `
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
                    ${key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, idx) => `
                <tr style="border-bottom: 1px solid #e5e7eb; ${idx % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">
                  ${Object.values(row).map(val => `
                    <td style="padding: 12px; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                      ${val}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Generated by Investment Readiness Platform</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: container.scrollHeight,
      });
      
      document.body.removeChild(container);
      
      // Generate PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
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
