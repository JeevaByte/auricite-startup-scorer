
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssessmentWithUser } from '@/types/admin';

interface AssessmentsTableProps {
  assessments: AssessmentWithUser[];
}

export const AssessmentsTable: React.FC<AssessmentsTableProps> = ({ assessments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell>
                  {new Date(assessment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{assessment.user_name}</div>
                    <div className="text-sm text-muted-foreground">{assessment.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>{assessment.company_name}</TableCell>
                <TableCell>
                  <Badge variant={assessment.total_score && assessment.total_score > 600 ? "default" : "secondary"}>
                    {assessment.total_score || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={assessment.total_score ? "default" : "secondary"}>
                    {assessment.total_score ? 'Complete' : 'Incomplete'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
