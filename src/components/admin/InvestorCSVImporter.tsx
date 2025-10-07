import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2, Download, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CSVRow {
  email: string;
  display_name: string;
  org_name?: string;
  bio?: string;
  sectors?: string;
  ticket_min?: string;
  ticket_max?: string;
  region?: string;
  is_verified?: string;
}

export const InvestorCSVImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setImported(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 10)); // Show first 10 rows
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          try {
            // Check if user exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', row.email)
              .maybeSingle();

            if (!profile) {
              console.warn(`No user found for email: ${row.email}`);
              errorCount++;
              continue;
            }

            // Parse sectors
            const sectors = row.sectors
              ? row.sectors.split(';').map((s) => s.trim())
              : [];

            // Insert investor profile
            const { error } = await supabase.from('investor_profiles').upsert({
              user_id: profile.id,
              display_name: row.display_name,
              org_name: row.org_name || null,
              bio: row.bio || null,
              sectors,
              ticket_min: row.ticket_min ? parseInt(row.ticket_min) : null,
              ticket_max: row.ticket_max ? parseInt(row.ticket_max) : null,
              region: row.region || null,
              verification_status:
                row.is_verified?.toLowerCase() === 'true' ? 'verified' : 'pending',
              is_qualified: row.is_verified?.toLowerCase() === 'true',
              is_public: true,
              // Required fields
              personal_capital: true,
              structured_fund: false,
              registered_entity: false,
              due_diligence: false,
              esg_metrics: false,
              check_size: 'medium',
              stage: 'seed',
              deal_source: 'platforms',
              frequency: 'frequent',
              objective: 'returns',
            });

            if (error) {
              console.error(`Error importing ${row.email}:`, error);
              errorCount++;
            } else {
              successCount++;
            }
          } catch (error) {
            console.error(`Error processing row:`, error);
            errorCount++;
          }
        }

        toast({
          title: 'Import Complete',
          description: `Successfully imported ${successCount} investors. ${errorCount} failed.`,
        });

        setImported(true);
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import CSV',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `email,display_name,org_name,bio,sectors,ticket_min,ticket_max,region,is_verified
investor@example.com,Jane Smith,Acme Ventures,"Early-stage investor","SaaS;FinTech;AI",50000,500000,North America,true
investor2@example.com,John Doe,Example Capital,"Angel investor","HealthTech;EdTech",25000,250000,Europe,false`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investor_import_template.csv';
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Importer</CardTitle>
        <CardDescription>
          Bulk import investor profiles from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="secondary" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {file ? file.name : 'Select CSV File'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {preview.length > 0 && (
          <>
            <Alert>
              <AlertDescription>
                <strong>Preview:</strong> Showing first {preview.length} rows. Total rows in file:{' '}
                {preview.length}
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Sectors</TableHead>
                    <TableHead>Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{row.email}</TableCell>
                      <TableCell>{row.display_name}</TableCell>
                      <TableCell>{row.org_name || '-'}</TableCell>
                      <TableCell className="text-sm">{row.sectors || '-'}</TableCell>
                      <TableCell>
                        {row.is_verified?.toLowerCase() === 'true' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing || imported}
                className="flex-1"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : imported ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Imported Successfully
                  </>
                ) : (
                  'Import All Rows'
                )}
              </Button>
            </div>
          </>
        )}

        <Alert>
          <AlertDescription className="text-sm space-y-2">
            <p>
              <strong>CSV Format:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Required: email, display_name</li>
              <li>Optional: org_name, bio, sectors (semicolon-separated), ticket_min, ticket_max, region</li>
              <li>is_verified: set to "true" to mark as verified</li>
              <li>Users must exist in the system (email must match a registered user)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
