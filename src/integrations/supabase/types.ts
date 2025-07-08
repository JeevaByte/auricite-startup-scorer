export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_responses: {
        Row: {
          assessment_data: Json
          created_at: string
          id: string
          response_data: Json
          user_id: string | null
        }
        Insert: {
          assessment_data: Json
          created_at?: string
          id?: string
          response_data: Json
          user_id?: string | null
        }
        Update: {
          assessment_data?: Json
          created_at?: string
          id?: string
          response_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_drafts: {
        Row: {
          created_at: string
          draft_data: Json
          id: string
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_data: Json
          id?: string
          step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_data?: Json
          id?: string
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_history: {
        Row: {
          assessment_data: Json
          created_at: string
          id: string
          score_result: Json
          user_id: string
        }
        Insert: {
          assessment_data: Json
          created_at?: string
          id?: string
          score_result: Json
          user_id: string
        }
        Update: {
          assessment_data?: Json
          created_at?: string
          id?: string
          score_result?: Json
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          cap_table: boolean
          created_at: string
          employees: string
          external_capital: boolean
          full_time_team: boolean
          funding_goal: string
          id: string
          investors: string
          milestones: string
          mrr: string
          prototype: boolean
          revenue: boolean
          term_sheets: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          cap_table: boolean
          created_at?: string
          employees: string
          external_capital: boolean
          full_time_team: boolean
          funding_goal: string
          id?: string
          investors: string
          milestones: string
          mrr: string
          prototype: boolean
          revenue: boolean
          term_sheets: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          cap_table?: boolean
          created_at?: string
          employees?: string
          external_capital?: boolean
          full_time_team?: boolean
          funding_goal?: string
          id?: string
          investors?: string
          milestones?: string
          mrr?: string
          prototype?: boolean
          revenue?: boolean
          term_sheets?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          assessment_id: string
          badge_name: string
          created_at: string
          explanation: string
          id: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          badge_name: string
          created_at?: string
          explanation: string
          id?: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          badge_name?: string
          created_at?: string
          explanation?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmark_data: {
        Row: {
          business_idea_avg: number
          created_at: string
          financials_avg: number
          id: string
          sample_size: number
          sector: string
          stage: string
          team_avg: number
          total_score_avg: number
          traction_avg: number
          updated_at: string
        }
        Insert: {
          business_idea_avg?: number
          created_at?: string
          financials_avg?: number
          id?: string
          sample_size?: number
          sector: string
          stage: string
          team_avg?: number
          total_score_avg?: number
          traction_avg?: number
          updated_at?: string
        }
        Update: {
          business_idea_avg?: number
          created_at?: string
          financials_avg?: number
          id?: string
          sample_size?: number
          sector?: string
          stage?: string
          team_avg?: number
          total_score_avg?: number
          traction_avg?: number
          updated_at?: string
        }
        Relationships: []
      }
      investor_classifications: {
        Row: {
          category: string
          confidence: number
          created_at: string
          explanation: string
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          category: string
          confidence: number
          created_at?: string
          explanation: string
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string
          explanation?: string
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_classifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_matches: {
        Row: {
          assessment_id: string
          classification_id: string
          created_at: string
          id: string
          investor_user_id: string
          match_score: number
          startup_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          classification_id: string
          created_at?: string
          id?: string
          investor_user_id: string
          match_score: number
          startup_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          classification_id?: string
          created_at?: string
          id?: string
          investor_user_id?: string
          match_score?: number
          startup_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_matches_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_matches_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "investor_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          check_size: string
          created_at: string
          deal_source: string
          due_diligence: boolean
          esg_metrics: boolean
          frequency: string
          id: string
          objective: string
          personal_capital: boolean
          registered_entity: boolean
          stage: string
          structured_fund: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          check_size: string
          created_at?: string
          deal_source: string
          due_diligence: boolean
          esg_metrics: boolean
          frequency: string
          id?: string
          objective: string
          personal_capital: boolean
          registered_entity: boolean
          stage: string
          structured_fund: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          check_size?: string
          created_at?: string
          deal_source?: string
          due_diligence?: boolean
          esg_metrics?: boolean
          frequency?: string
          id?: string
          objective?: string
          personal_capital?: boolean
          registered_entity?: boolean
          stage?: string
          structured_fund?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          assessment_id: string
          business_idea: number
          business_idea_explanation: string
          created_at: string
          financials: number
          financials_explanation: string
          id: string
          team: number
          team_explanation: string
          total_score: number
          traction: number
          traction_explanation: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          business_idea: number
          business_idea_explanation: string
          created_at?: string
          financials: number
          financials_explanation: string
          id?: string
          team: number
          team_explanation: string
          total_score: number
          traction: number
          traction_explanation: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          business_idea?: number
          business_idea_explanation?: string
          created_at?: string
          financials?: number
          financials_explanation?: string
          id?: string
          team?: number
          team_explanation?: string
          total_score?: number
          traction?: number
          traction_explanation?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_config: {
        Row: {
          config_data: Json
          config_name: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          config_data: Json
          config_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          config_data?: Json
          config_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      startup_clusters: {
        Row: {
          assessment_id: string | null
          cluster_id: number
          created_at: string
          id: string
          percentile_business_idea: number | null
          percentile_financials: number | null
          percentile_team: number | null
          percentile_total: number | null
          percentile_traction: number | null
          sector: string
          stage: string
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          cluster_id: number
          created_at?: string
          id?: string
          percentile_business_idea?: number | null
          percentile_financials?: number | null
          percentile_team?: number | null
          percentile_total?: number | null
          percentile_traction?: number | null
          sector: string
          stage: string
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          cluster_id?: number
          created_at?: string
          id?: string
          percentile_business_idea?: number | null
          percentile_financials?: number | null
          percentile_team?: number | null
          percentile_total?: number | null
          percentile_traction?: number | null
          sector?: string
          stage?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_clusters_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          assessment_id: string | null
          created_at: string
          feedback: string | null
          id: string
          rating: string
          section: string
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating: string
          section: string
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: string
          section?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
