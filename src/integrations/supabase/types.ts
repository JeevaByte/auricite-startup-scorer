export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abuse_reports: {
        Row: {
          assessment_id: string | null
          created_at: string
          details: Json
          id: string
          report_type: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          report_type: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          report_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abuse_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
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
      assessment_edits: {
        Row: {
          assessment_id: string
          created_at: string
          edit_reason: string | null
          edited_by: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          edit_reason?: string | null
          edited_by: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          edit_reason?: string | null
          edited_by?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_edits_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
      assessment_stages: {
        Row: {
          assessment_id: string
          completed_at: string | null
          created_at: string
          id: string
          stage_data: Json
          stage_name: string
          stage_number: number
          updated_at: string
        }
        Insert: {
          assessment_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_data: Json
          stage_name: string
          stage_number: number
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_data?: Json
          stage_name?: string
          stage_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_stages_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
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
      crm_contacts: {
        Row: {
          company_name: string | null
          created_at: string
          crm_contact_id: string | null
          email: string
          full_name: string | null
          id: string
          last_donation_date: string | null
          lead_source: string | null
          lead_status: string | null
          phone: string | null
          synced_at: string | null
          total_donations: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          crm_contact_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          last_donation_date?: string | null
          lead_source?: string | null
          lead_status?: string | null
          phone?: string | null
          synced_at?: string | null
          total_donations?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          crm_contact_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_donation_date?: string | null
          lead_source?: string | null
          lead_status?: string | null
          phone?: string | null
          synced_at?: string | null
          total_donations?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          donor_name: string | null
          email: string
          id: string
          message: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          donor_name?: string | null
          email: string
          id?: string
          message?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          donor_name?: string | null
          email?: string
          id?: string
          message?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      honeypot_submissions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          submission_data: Json | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          submission_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          submission_data?: Json | null
          user_agent?: string | null
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
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent: string | null
          notification_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent?: string | null
          notification_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent?: string | null
          notification_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pitch_decks: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          updated_at: string
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          updated_at?: string
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          updated_at?: string
          upload_status?: string | null
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
      score_feedback: {
        Row: {
          accuracy_rating: string
          assessment_id: string | null
          comments: string | null
          created_at: string
          id: string
          score_received: number | null
          user_id: string | null
        }
        Insert: {
          accuracy_rating: string
          assessment_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          score_received?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy_rating?: string
          assessment_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          score_received?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_feedback_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
          change_reason: string | null
          config_data: Json
          config_name: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          updated_at: string
          version: number
        }
        Insert: {
          change_reason?: string | null
          config_data: Json
          config_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version?: number
        }
        Update: {
          change_reason?: string | null
          config_data?: Json
          config_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      scoring_config_history: {
        Row: {
          change_reason: string | null
          config_data: Json
          config_id: string
          created_at: string
          created_by: string | null
          id: string
          previous_version: number | null
          version: number
        }
        Insert: {
          change_reason?: string | null
          config_data: Json
          config_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          previous_version?: number | null
          version: number
        }
        Update: {
          change_reason?: string | null
          config_data?: Json
          config_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          previous_version?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scoring_config_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "scoring_config"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_validation_rules: {
        Row: {
          created_at: string
          error_message: string
          id: string
          is_active: boolean
          rule_name: string
          validation_logic: Json
        }
        Insert: {
          created_at?: string
          error_message: string
          id?: string
          is_active?: boolean
          rule_name: string
          validation_logic: Json
        }
        Update: {
          created_at?: string
          error_message?: string
          id?: string
          is_active?: boolean
          rule_name?: string
          validation_logic?: Json
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: string
          id: string
          ip_address: unknown | null
          type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          ip_address?: unknown | null
          type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          ip_address?: unknown | null
          type?: string
          user_agent?: string | null
          user_id?: string | null
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
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_assessments: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_assessments?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_assessments?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_access: {
        Row: {
          access_type: string
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scoring_profiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          kpis: Json | null
          name: string
          role_type: string
          updated_at: string
          user_id: string
          visibility: string
          weights: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          kpis?: Json | null
          name: string
          role_type: string
          updated_at?: string
          user_id: string
          visibility?: string
          weights: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          kpis?: Json | null
          name?: string
          role_type?: string
          updated_at?: string
          user_id?: string
          visibility?: string
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_scoring_profiles_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          created_at: string
          id: string
          scoring_weights: Json
          segment_criteria: Json
          segment_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scoring_weights: Json
          segment_criteria: Json
          segment_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scoring_weights?: Json
          segment_criteria?: Json
          segment_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_subscribers: {
        Row: {
          created_at: string
          email: string
          feature_interest: string | null
          id: string
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          feature_interest?: string | null
          id?: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          feature_interest?: string | null
          id?: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret_key: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          secret_key?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret_key?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_missing_fk_indexes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      debug_user_access: {
        Args: { user_email: string }
        Returns: {
          access_type: string
          expires_at: string
          granted_at: string
          granted_by: string
          has_access: boolean
          subscription_plan: string
          subscription_status: string
        }[]
      }
      exec_sql: {
        Args: { sql: string }
        Returns: Json
      }
      fix_auth_uid_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_auth_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      grant_temporary_access: {
        Args: { access_types: string[]; user_email: string }
        Returns: string
      }
      has_paid_access: {
        Args: { access_type_param: string; user_uuid: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      list_unindexed_foreign_keys: {
        Args: { table_name: string }
        Returns: {
          column_name: string
        }[]
      }
      update_auth_settings: {
        Args: { config: Json }
        Returns: Json
      }
      validate_scoring_config: {
        Args: { config_data: Json }
        Returns: {
          errors: string[]
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      user_role: "free" | "premium" | "admin"
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
    Enums: {
      user_role: ["free", "premium", "admin"],
    },
  },
} as const
