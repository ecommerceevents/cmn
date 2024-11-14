export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          industry: string | null
          employee_count_min: number | null
          employee_count_max: number | null
          annual_revenue_min: number | null
          annual_revenue_max: number | null
          founded_year: number | null
          linkedin_url: string | null
          twitter_url: string | null
          description: string | null
          logo_url: string | null
          headquarters_address: string | null
          headquarters_city: string | null
          headquarters_state: string | null
          headquarters_country: string | null
          headquarters_postal_code: string | null
          tech_stack: Json | null
          funding_rounds: Json | null
          last_enrichment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          industry?: string | null
          employee_count_min?: number | null
          employee_count_max?: number | null
          annual_revenue_min?: number | null
          annual_revenue_max?: number | null
          founded_year?: number | null
          linkedin_url?: string | null
          twitter_url?: string | null
          description?: string | null
          logo_url?: string | null
          headquarters_address?: string | null
          headquarters_city?: string | null
          headquarters_state?: string | null
          headquarters_country?: string | null
          headquarters_postal_code?: string | null
          tech_stack?: Json | null
          funding_rounds?: Json | null
          last_enrichment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          industry?: string | null
          employee_count_min?: number | null
          employee_count_max?: number | null
          annual_revenue_min?: number | null
          annual_revenue_max?: number | null
          founded_year?: number | null
          linkedin_url?: string | null
          twitter_url?: string | null
          description?: string | null
          logo_url?: string | null
          headquarters_address?: string | null
          headquarters_city?: string | null
          headquarters_state?: string | null
          headquarters_country?: string | null
          headquarters_postal_code?: string | null
          tech_stack?: Json | null
          funding_rounds?: Json | null
          last_enrichment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          company_id: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          title: string | null
          department: string | null
          linkedin_url: string | null
          twitter_url: string | null
          is_verified: boolean
          verification_date: string | null
          verification_method: string | null
          last_enrichment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          title?: string | null
          department?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verification_method?: string | null
          last_enrichment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          title?: string | null
          department?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verification_method?: string | null
          last_enrichment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          service: string
          api_key: string
          is_active: boolean
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service: string
          api_key: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service?: string
          api_key?: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrichment_queue: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          service: string
          priority: number
          retry_count: number
          max_retries: number
          status: string
          last_error: string | null
          scheduled_for: string
          locked_at: string | null
          locked_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          service: string
          priority?: number
          retry_count?: number
          max_retries?: number
          status?: string
          last_error?: string | null
          scheduled_for?: string
          locked_at?: string | null
          locked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          service?: string
          priority?: number
          retry_count?: number
          max_retries?: number
          status?: string
          last_error?: string | null
          scheduled_for?: string
          locked_at?: string | null
          locked_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      vw_company_contacts: {
        Row: {
          company_id: string
          company_name: string
          industry: string | null
          website: string | null
          contact_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          title: string | null
          department: string | null
        }
      }
    }
  }
}