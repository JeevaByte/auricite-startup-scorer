import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  report_name: string;
  report_type: string;
  frequency: string;
  format: string;
  is_active: boolean;
  next_scheduled_at: string;
  last_sent_at?: string;
}

export const ScheduledReportsManager: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    report_name: '',
    report_type: 'investment_summary',
    frequency: 'weekly',
    format: 'pdf',
    recipients: '',
    next_scheduled_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as any) || []);
    } catch (error) {
      toast.error('Failed to load scheduled reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const recipients = formData.recipients
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email);

      const { error } = await supabase
        .from('scheduled_reports')
        .insert([{
          user_id: user.id,
          report_name: formData.report_name,
          report_type: formData.report_type,
          frequency: formData.frequency,
          format: formData.format,
          recipients,
          next_scheduled_at: new Date(formData.next_scheduled_at).toISOString()
        }]);

      if (error) throw error;

      toast.success('Scheduled report created');
      setIsDialogOpen(false);
      setFormData({
        report_name: '',
        report_type: 'investment_summary',
        frequency: 'weekly',
        format: 'pdf',
        recipients: '',
        next_scheduled_at: new Date().toISOString().split('T')[0]
      });
      loadReports();
    } catch (error) {
      toast.error('Failed to create scheduled report');
      console.error(error);
    }
  };

  const toggleReportStatus = async (reportId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: !currentStatus })
        .eq('id', reportId);

      if (error) throw error;
      toast.success(`Report ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadReports();
    } catch (error) {
      toast.error('Failed to update report status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Reports</h2>
          <p className="text-muted-foreground">
            Automate report generation and distribution
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Scheduled Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Scheduled Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="report_name">Report Name</Label>
                <Input
                  id="report_name"
                  value={formData.report_name}
                  onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
                  placeholder="Monthly Investment Summary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select
                    value={formData.report_type}
                    onValueChange={(value) => setFormData({ ...formData, report_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment_summary">Investment Summary</SelectItem>
                      <SelectItem value="portfolio_analytics">Portfolio Analytics</SelectItem>
                      <SelectItem value="risk_report">Risk Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="next_scheduled">Next Scheduled</Label>
                  <Input
                    id="next_scheduled"
                    type="date"
                    value={formData.next_scheduled_at}
                    onChange={(e) => setFormData({ ...formData, next_scheduled_at: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="recipients"
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="user1@example.com, user2@example.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">Loading reports...</CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No scheduled reports yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 mt-0.5" />
                    <div>
                      <CardTitle className="text-lg">{report.report_name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{report.report_type}</Badge>
                        <Badge variant="outline">{report.frequency}</Badge>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={report.is_active}
                    onCheckedChange={() => toggleReportStatus(report.id, report.is_active)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Next: {new Date(report.next_scheduled_at).toLocaleDateString()}</span>
                  </div>
                  {report.last_sent_at && (
                    <span>Last sent: {new Date(report.last_sent_at).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};