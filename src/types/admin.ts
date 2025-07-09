
export interface AssessmentWithUser {
  id: string;
  created_at: string;
  prototype: boolean;
  external_capital: boolean;
  revenue: boolean;
  full_time_team: boolean;
  term_sheets: boolean;
  cap_table: boolean;
  mrr: string;
  employees: string;
  funding_goal: string;
  investors: string;
  milestones: string;
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
