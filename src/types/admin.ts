
export interface AssessmentWithUser {
  id: string;
  created_at: string;
  prototype: boolean;
  revenue: boolean;
  full_time_team: boolean;
  employees: string;
  funding_goal: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  company_name?: string;
  total_score?: number;
}

export interface DashboardStats {
  totalAssessments: number;
  avgScore: number;
  completionRate: number;
  recentAssessments: number;
}
