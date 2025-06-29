
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet, Share2 } from 'lucide-react';
import { ScoreResult, AssessmentData } from '@/pages/Index';
import { RecommendationsData } from '@/utils/recommendationsService';
import { generateReportData, downloadAsJSON, downloadAsCSV } from '@/utils/reportGenerator';

interface DownloadDialogProps {
  scoreResult: ScoreResult;
  assessmentData: AssessmentData;
  recommendations?: RecommendationsData;
}

export const DownloadDialog = ({ scoreResult, assessmentData, recommendations }: DownloadDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'json' | 'csv') => {
    setIsDownloading(true);
    try {
      const reportData = generateReportData(assessmentData, scoreResult, recommendations);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `startup-assessment-report-${timestamp}`;

      if (format === 'json') {
        downloadAsJSON(reportData, `${filename}.json`);
      } else {
        downloadAsCSV(reportData, `${filename}.csv`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Download Assessment Report</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose your preferred format to download your complete assessment report with scores and recommendations.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleDownload('json')}
              disabled={isDownloading}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Format
              <span className="ml-auto text-xs text-gray-500">Detailed data</span>
            </Button>
            
            <Button
              onClick={() => handleDownload('csv')}
              disabled={isDownloading}
              className="w-full justify-start"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV Format
              <span className="ml-auto text-xs text-gray-500">Spreadsheet friendly</span>
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Your report includes scores, explanations, and personalized recommendations for each category.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
