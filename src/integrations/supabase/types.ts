export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_responses: {
        Row: {
          assessment_data: Json
          created_at: string
          id: string
          response_data: Json
        }
        Insert: {
          assessment_data: Json
          created_at?: string
          id?: string
          response_data: Json
        }
        Update: {
          assessment_data?: Json
          created_at?: string
          id?: string
          response_data?: Json
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
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
