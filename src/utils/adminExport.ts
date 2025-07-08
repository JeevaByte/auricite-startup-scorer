
import { AssessmentWithUser } from '@/types/admin';

export const exportAssessmentsToCSV = (assessments: AssessmentWithUser[], searchTerm: string) => {
  const filteredAssessments = assessments.filter(assessment =>
    assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = ['Date', 'User Email', 'User Name', 'Company', 'Score', 'Prototype', 'Revenue', 'Team Size'];
  const csvData = [
    headers.join(','),
    ...filteredAssessments.map(assessment => [
      new Date(assessment.created_at).toLocaleDateString(),
      assessment.user_email || '',
      assessment.user_name || '',
      assessment.company_name || '',
      assessment.total_score || 0,
      assessment.prototype ? 'Yes' : 'No',
      assessment.revenue ? 'Yes' : 'No',
      assessment.employees
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assessments_export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
