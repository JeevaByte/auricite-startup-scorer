// Common type definitions for the application

export interface Assessment {
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
  company_name?: string;
  total_score?: number;
}

export interface ScoreResult {
  overall_score: number;
  category_scores: CategoryScores;
  feedback: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  contentAnalysis?: boolean;
}

export interface CategoryScores {
  product: number;
  market: number;
  team: number;
  business_model: number;
  financials: number;
  traction: number;
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  assessment_data: Assessment;
  score_result: ScoreResult;
  created_at: string;
  content_type?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

export interface SuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormData {
  [key: string]: string | boolean | number | undefined;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin' | 'investor';
  created_at: string;
  updated_at: string;
}

export interface InvestorProfile {
  id: string;
  user_id: string;
  company_name: string;
  investment_focus: string[];
  stage_preference: string[];
  ticket_size_min: number;
  ticket_size_max: number;
  location: string;
  contact_email: string;
  website?: string;
  description?: string;
  verified: boolean;
}

export interface PitchDeck {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis_result?: Record<string, unknown>;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  category: string;
  user_id: string;
  created_at: string;
}

export interface DraftData {
  assessment_data: Partial<Assessment>;
  current_step: number;
  last_saved: string;
}