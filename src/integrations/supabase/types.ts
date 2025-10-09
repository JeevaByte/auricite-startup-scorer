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
      advanced_scores: {
        Row: {
          assessment_id: string | null
          calibrated_score: number | null
          confidence: number | null
          contributing_phrases: Json | null
          created_at: string
          embedding_score: number | null
          explanations: Json
          extracted_features_id: string | null
          final_score: number
          id: string
          innovation_score: number | null
          key_strengths: Json | null
          key_weaknesses: Json | null
          llm_model: string | null
          llm_score: number | null
          llm_temperature: number | null
          market_score: number | null
          ml_model_score: number | null
          model_version: string | null
          processing_time_ms: number | null
          scoring_version: string
          team_score: number | null
          traction_score: number | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          calibrated_score?: number | null
          confidence?: number | null
          contributing_phrases?: Json | null
          created_at?: string
          embedding_score?: number | null
          explanations?: Json
          extracted_features_id?: string | null
          final_score: number
          id?: string
          innovation_score?: number | null
          key_strengths?: Json | null
          key_weaknesses?: Json | null
          llm_model?: string | null
          llm_score?: number | null
          llm_temperature?: number | null
          market_score?: number | null
          ml_model_score?: number | null
          model_version?: string | null
          processing_time_ms?: number | null
          scoring_version: string
          team_score?: number | null
          traction_score?: number | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          calibrated_score?: number | null
          confidence?: number | null
          contributing_phrases?: Json | null
          created_at?: string
          embedding_score?: number | null
          explanations?: Json
          extracted_features_id?: string | null
          final_score?: number
          id?: string
          innovation_score?: number | null
          key_strengths?: Json | null
          key_weaknesses?: Json | null
          llm_model?: string | null
          llm_score?: number | null
          llm_temperature?: number | null
          market_score?: number | null
          ml_model_score?: number | null
          model_version?: string | null
          processing_time_ms?: number | null
          scoring_version?: string
          team_score?: number | null
          traction_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advanced_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advanced_scores_extracted_features_id_fkey"
            columns: ["extracted_features_id"]
            isOneToOne: false
            referencedRelation: "extracted_features"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
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
      api_access_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          organization_id: string | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          organization_id?: string | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
          user_id?: string | null
          version: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          organization_id?: string | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          is_public: boolean | null
          milestones: string
          mrr: string
          prototype: boolean
          public_fields: Json | null
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
          is_public?: boolean | null
          milestones: string
          mrr: string
          prototype: boolean
          public_fields?: Json | null
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
          is_public?: boolean | null
          milestones?: string
          mrr?: string
          prototype?: boolean
          public_fields?: Json | null
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
      background_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number | null
          payload: Json
          priority: number | null
          result: Json | null
          scheduled_at: string
          started_at: string | null
          status: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
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
      benchmark_metrics: {
        Row: {
          business_idea_p25: number
          business_idea_p50: number
          business_idea_p75: number
          cac_ltv_benchmark: number | null
          created_at: string
          financials_p25: number
          financials_p50: number
          financials_p75: number
          id: string
          last_updated: string
          retention_benchmark: number | null
          revenue_growth_benchmark: number | null
          sample_size: number
          sector: string
          stage: string
          team_p25: number
          team_p50: number
          team_p75: number
          traction_p25: number
          traction_p50: number
          traction_p75: number
        }
        Insert: {
          business_idea_p25: number
          business_idea_p50: number
          business_idea_p75: number
          cac_ltv_benchmark?: number | null
          created_at?: string
          financials_p25: number
          financials_p50: number
          financials_p75: number
          id?: string
          last_updated?: string
          retention_benchmark?: number | null
          revenue_growth_benchmark?: number | null
          sample_size?: number
          sector: string
          stage: string
          team_p25: number
          team_p50: number
          team_p75: number
          traction_p25: number
          traction_p50: number
          traction_p75: number
        }
        Update: {
          business_idea_p25?: number
          business_idea_p50?: number
          business_idea_p75?: number
          cac_ltv_benchmark?: number | null
          created_at?: string
          financials_p25?: number
          financials_p50?: number
          financials_p75?: number
          id?: string
          last_updated?: string
          retention_benchmark?: number | null
          revenue_growth_benchmark?: number | null
          sample_size?: number
          sector?: string
          stage?: string
          team_p25?: number
          team_p50?: number
          team_p75?: number
          traction_p25?: number
          traction_p50?: number
          traction_p75?: number
        }
        Relationships: []
      }
      benchmark_startups: {
        Row: {
          assessment_data: Json
          category: string | null
          created_at: string
          description: string | null
          expected_score_range: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          assessment_data: Json
          category?: string | null
          created_at?: string
          description?: string | null
          expected_score_range: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          assessment_data?: Json
          category?: string | null
          created_at?: string
          description?: string | null
          expected_score_range?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          investor_user_id: string
          message: string | null
          startup_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          investor_user_id: string
          message?: string | null
          startup_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          investor_user_id?: string
          message?: string | null
          startup_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
      data_export_requests: {
        Row: {
          completed_at: string | null
          download_url: string | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      document_access_audit: {
        Row: {
          action: string
          created_at: string
          document_id: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          document_id: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_access_requests: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          investor_user_id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          startup_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          investor_user_id: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          startup_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          investor_user_id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          startup_user_id?: string
          status?: string
          updated_at?: string
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
      drift_monitoring: {
        Row: {
          baseline_value: number | null
          current_value: number | null
          detection_date: string
          drift_magnitude: number | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          threshold_exceeded: boolean | null
        }
        Insert: {
          baseline_value?: number | null
          current_value?: number | null
          detection_date?: string
          drift_magnitude?: number | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          threshold_exceeded?: boolean | null
        }
        Update: {
          baseline_value?: number | null
          current_value?: number | null
          detection_date?: string
          drift_magnitude?: number | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          threshold_exceeded?: boolean | null
        }
        Relationships: []
      }
      embedding_cache: {
        Row: {
          content_hash: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          last_accessed: string
          model_name: string
        }
        Insert: {
          content_hash: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          last_accessed?: string
          model_name: string
        }
        Update: {
          content_hash?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          last_accessed?: string
          model_name?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      extracted_features: {
        Row: {
          assessment_id: string | null
          confidence_score: number | null
          created_at: string
          extraction_version: string
          funding_amount: number | null
          funding_per_employee: number | null
          funding_round: string | null
          growth_momentum: number | null
          growth_rate: number | null
          id: string
          locations: Json | null
          market_size: number | null
          organizations: Json | null
          persons: Json | null
          revenue: number | null
          revenue_per_user: number | null
          team_size: number | null
          user_id: string | null
          users: number | null
          years_experience: number | null
        }
        Insert: {
          assessment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_version: string
          funding_amount?: number | null
          funding_per_employee?: number | null
          funding_round?: string | null
          growth_momentum?: number | null
          growth_rate?: number | null
          id?: string
          locations?: Json | null
          market_size?: number | null
          organizations?: Json | null
          persons?: Json | null
          revenue?: number | null
          revenue_per_user?: number | null
          team_size?: number | null
          user_id?: string | null
          users?: number | null
          years_experience?: number | null
        }
        Update: {
          assessment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_version?: string
          funding_amount?: number | null
          funding_per_employee?: number | null
          funding_round?: string | null
          growth_momentum?: number | null
          growth_rate?: number | null
          id?: string
          locations?: Json | null
          market_size?: number | null
          organizations?: Json | null
          persons?: Json | null
          revenue?: number | null
          revenue_per_user?: number | null
          team_size?: number | null
          user_id?: string | null
          users?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_features_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string | null
          email: string
          id: string
          ip_address: unknown | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          flag_key: string
          flag_name: string
          id: string
          metadata: Json | null
          rollout_percentage: number | null
          target_roles: string[] | null
          target_users: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          flag_key: string
          flag_name: string
          id?: string
          metadata?: Json | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          target_users?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          flag_key?: string
          flag_name?: string
          id?: string
          metadata?: Json | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          target_users?: string[] | null
          updated_at?: string
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
      impersonation_logs: {
        Row: {
          actions_taken: Json | null
          admin_user_id: string
          ended_at: string | null
          id: string
          ip_address: unknown | null
          reason: string
          started_at: string
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          actions_taken?: Json | null
          admin_user_id: string
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          reason: string
          started_at?: string
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          actions_taken?: Json | null
          admin_user_id?: string
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          reason?: string
          started_at?: string
          target_user_id?: string
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
      investor_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
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
      investor_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          parent_message_id: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          parent_message_id?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          parent_message_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "investor_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_portfolio: {
        Row: {
          added_at: string
          assessment_id: string | null
          id: string
          investment_amount: number | null
          investment_date: string | null
          investor_user_id: string
          notes: string | null
          startup_user_id: string
          status: string
        }
        Insert: {
          added_at?: string
          assessment_id?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          investor_user_id: string
          notes?: string | null
          startup_user_id: string
          status?: string
        }
        Update: {
          added_at?: string
          assessment_id?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          investor_user_id?: string
          notes?: string | null
          startup_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_portfolio_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          bio: string | null
          check_size: string
          created_at: string
          deal_source: string
          display_name: string | null
          due_diligence: boolean
          esg_metrics: boolean
          frequency: string
          id: string
          is_public: boolean | null
          is_qualified: boolean | null
          objective: string
          org_name: string | null
          personal_capital: boolean
          public_fields: Json | null
          region: string | null
          registered_entity: boolean
          sectors: string[] | null
          stage: string
          structured_fund: boolean
          ticket_max: number | null
          ticket_min: number | null
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bio?: string | null
          check_size: string
          created_at?: string
          deal_source: string
          display_name?: string | null
          due_diligence: boolean
          esg_metrics: boolean
          frequency: string
          id?: string
          is_public?: boolean | null
          is_qualified?: boolean | null
          objective: string
          org_name?: string | null
          personal_capital: boolean
          public_fields?: Json | null
          region?: string | null
          registered_entity: boolean
          sectors?: string[] | null
          stage: string
          structured_fund: boolean
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bio?: string | null
          check_size?: string
          created_at?: string
          deal_source?: string
          display_name?: string | null
          due_diligence?: boolean
          esg_metrics?: boolean
          frequency?: string
          id?: string
          is_public?: boolean | null
          is_qualified?: boolean | null
          objective?: string
          org_name?: string | null
          personal_capital?: boolean
          public_fields?: Json | null
          region?: string | null
          registered_entity?: boolean
          sectors?: string[] | null
          stage?: string
          structured_fund?: boolean
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      investor_saved_startups: {
        Row: {
          assessment_id: string | null
          id: string
          investor_user_id: string
          notes: string | null
          saved_at: string
          startup_user_id: string
        }
        Insert: {
          assessment_id?: string | null
          id?: string
          investor_user_id: string
          notes?: string | null
          saved_at?: string
          startup_user_id: string
        }
        Update: {
          assessment_id?: string | null
          id?: string
          investor_user_id?: string
          notes?: string | null
          saved_at?: string
          startup_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_saved_startups_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_syndicates: {
        Row: {
          created_at: string
          description: string | null
          focus_sectors: string[] | null
          id: string
          is_public: boolean | null
          lead_investor_id: string
          name: string
          ticket_max: number | null
          ticket_min: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          focus_sectors?: string[] | null
          id?: string
          is_public?: boolean | null
          lead_investor_id: string
          name: string
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          focus_sectors?: string[] | null
          id?: string
          is_public?: boolean | null
          lead_investor_id?: string
          name?: string
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
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
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          context: Json | null
          id: string
          metric_name: string
          metric_type: string
          recorded_at: string
          unit: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          context?: Json | null
          id?: string
          metric_name: string
          metric_type: string
          recorded_at?: string
          unit?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          context?: Json | null
          id?: string
          metric_name?: string
          metric_type?: string
          recorded_at?: string
          unit?: string | null
          user_id?: string | null
          value?: number
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
          is_public: boolean | null
          notification_preferences: Json | null
          public_fields: Json | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_public?: boolean | null
          notification_preferences?: Json | null
          public_fields?: Json | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean | null
          notification_preferences?: Json | null
          public_fields?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          filters: Json | null
          format: string
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          next_scheduled_at: string
          organization_id: string | null
          recipients: string[] | null
          report_name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          format?: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at: string
          organization_id?: string | null
          recipients?: string[] | null
          report_name: string
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          format?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string
          organization_id?: string | null
          recipients?: string[] | null
          report_name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      score_history: {
        Row: {
          assessment_id: string
          business_idea: number
          financials: number
          id: string
          recorded_at: string
          team: number
          total_score: number
          traction: number
          user_id: string
        }
        Insert: {
          assessment_id: string
          business_idea: number
          financials: number
          id?: string
          recorded_at?: string
          team: number
          total_score: number
          traction: number
          user_id: string
        }
        Update: {
          assessment_id?: string
          business_idea?: number
          financials?: number
          id?: string
          recorded_at?: string
          team?: number
          total_score?: number
          traction?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      score_submetrics: {
        Row: {
          advisor_quality: number | null
          burn_rate_efficiency: number | null
          cac_ltv_ratio: number | null
          category: string
          created_at: string
          domain_expertise: number | null
          hiring_velocity: number | null
          id: string
          innovation_index: number | null
          market_size_score: number | null
          product_differentiation: number | null
          retention_rate: number | null
          revenue_growth_pct: number | null
          revenue_quality: number | null
          runway_adequacy: number | null
          scalability_score: number | null
          score_id: string
          team_completeness: number | null
          unit_economics: number | null
          updated_at: string
          user_acquisition_rate: number | null
          user_id: string
        }
        Insert: {
          advisor_quality?: number | null
          burn_rate_efficiency?: number | null
          cac_ltv_ratio?: number | null
          category: string
          created_at?: string
          domain_expertise?: number | null
          hiring_velocity?: number | null
          id?: string
          innovation_index?: number | null
          market_size_score?: number | null
          product_differentiation?: number | null
          retention_rate?: number | null
          revenue_growth_pct?: number | null
          revenue_quality?: number | null
          runway_adequacy?: number | null
          scalability_score?: number | null
          score_id: string
          team_completeness?: number | null
          unit_economics?: number | null
          updated_at?: string
          user_acquisition_rate?: number | null
          user_id: string
        }
        Update: {
          advisor_quality?: number | null
          burn_rate_efficiency?: number | null
          cac_ltv_ratio?: number | null
          category?: string
          created_at?: string
          domain_expertise?: number | null
          hiring_velocity?: number | null
          id?: string
          innovation_index?: number | null
          market_size_score?: number | null
          product_differentiation?: number | null
          retention_rate?: number | null
          revenue_growth_pct?: number | null
          revenue_quality?: number | null
          runway_adequacy?: number | null
          scalability_score?: number | null
          score_id?: string
          team_completeness?: number | null
          unit_economics?: number | null
          updated_at?: string
          user_acquisition_rate?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_submetrics_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "scores"
            referencedColumns: ["id"]
          },
        ]
      }
      score_variance_tests: {
        Row: {
          benchmark_startup_id: string | null
          created_at: string
          id: string
          mean_score: number | null
          passed: boolean | null
          scores: Json
          scoring_version: string
          std_deviation: number | null
          test_run_id: string
          variance: number | null
        }
        Insert: {
          benchmark_startup_id?: string | null
          created_at?: string
          id?: string
          mean_score?: number | null
          passed?: boolean | null
          scores: Json
          scoring_version: string
          std_deviation?: number | null
          test_run_id: string
          variance?: number | null
        }
        Update: {
          benchmark_startup_id?: string | null
          created_at?: string
          id?: string
          mean_score?: number | null
          passed?: boolean | null
          scores?: Json
          scoring_version?: string
          std_deviation?: number | null
          test_run_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_variance_tests_benchmark_startup_id_fkey"
            columns: ["benchmark_startup_id"]
            isOneToOne: false
            referencedRelation: "benchmark_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      score_verifications: {
        Row: {
          component: string
          confidence_boost: number
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          score_id: string
          updated_at: string
          user_id: string
          verification_date: string
          verification_notes: string | null
          verification_type: string
          verified_by: string | null
        }
        Insert: {
          component: string
          confidence_boost?: number
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          score_id: string
          updated_at?: string
          user_id: string
          verification_date?: string
          verification_notes?: string | null
          verification_type: string
          verified_by?: string | null
        }
        Update: {
          component?: string
          confidence_boost?: number
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          score_id?: string
          updated_at?: string
          user_id?: string
          verification_date?: string
          verification_notes?: string | null
          verification_type?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_verifications_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "scores"
            referencedColumns: ["id"]
          },
        ]
      }
      score_weights: {
        Row: {
          created_at: string | null
          id: string
          stage: string
          updated_at: string | null
          weights: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          stage: string
          updated_at?: string | null
          weights?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          stage?: string
          updated_at?: string | null
          weights?: Json
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
      scoring_audit_log: {
        Row: {
          assessment_id: string | null
          created_at: string
          error_message: string | null
          event_status: string
          event_type: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          model_version: string | null
          output_data: Json | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          error_message?: string | null
          event_status: string
          event_type: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          output_data?: Json | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          error_message?: string | null
          event_status?: string
          event_type?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          output_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_audit_log_assessment_id_fkey"
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
      smart_alerts: {
        Row: {
          alert_type: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string
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
      syndicate_members: {
        Row: {
          id: string
          investor_id: string
          joined_at: string
          role: string
          syndicate_id: string
        }
        Insert: {
          id?: string
          investor_id: string
          joined_at?: string
          role?: string
          syndicate_id: string
        }
        Update: {
          id?: string
          investor_id?: string
          joined_at?: string
          role?: string
          syndicate_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicate_members_syndicate_id_fkey"
            columns: ["syndicate_id"]
            isOneToOne: false
            referencedRelation: "investor_syndicates"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_metrics: {
        Row: {
          error_rate: number | null
          id: string
          last_check_at: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
          uptime_percentage: number | null
        }
        Insert: {
          error_rate?: number | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
          uptime_percentage?: number | null
        }
        Update: {
          error_rate?: number | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      tenant_branding: {
        Row: {
          created_at: string
          custom_css: string | null
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          show_powered_by: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          show_powered_by?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          show_powered_by?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[]
          created_at: string
          enabled: boolean
          enabled_at: string | null
          id: string
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[]
          created_at?: string
          enabled?: boolean
          enabled_at?: string | null
          id?: string
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[]
          created_at?: string
          enabled?: boolean
          enabled_at?: string | null
          id?: string
          secret?: string
          updated_at?: string
          user_id?: string
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cleanup_old_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
      get_managed_orgs_for_current_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          organization_id: string
        }[]
      }
      get_user_organization_role: {
        Args: { org_id: string; user_uuid: string }
        Returns: string
      }
      get_user_organizations: {
        Args: { _user_id: string }
        Returns: {
          organization_id: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      grant_temporary_access: {
        Args: { access_types: string[]; user_email: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_paid_access: {
        Args: { access_type_param: string; user_uuid: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { _flag_key: string; _user_id?: string }
        Returns: boolean
      }
      is_organization_admin: {
        Args: { org_id: string; user_uuid: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      list_unindexed_foreign_keys: {
        Args: { table_name: string }
        Returns: {
          column_name: string
        }[]
      }
      log_admin_action: {
        Args: {
          _action: string
          _details?: Json
          _target_id: string
          _target_table: string
        }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      user_role: "free" | "premium" | "admin" | "investor"
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
      user_role: ["free", "premium", "admin", "investor"],
    },
  },
} as const
