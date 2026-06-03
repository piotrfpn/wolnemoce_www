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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          billing_provider: string | null
          billing_provider_payment_id: string | null
          branza_id: string | null
          clicks_count: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          ends_at: string | null
          firma_id: string
          id: string
          image_url: string | null
          impressions_count: number
          payment_status: Database["public"]["Enums"]["wm_payment_status"]
          price_amount: number | null
          product_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["wm_ad_status"]
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          branza_id?: string | null
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          ends_at?: string | null
          firma_id: string
          id?: string
          image_url?: string | null
          impressions_count?: number
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["wm_ad_status"]
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          branza_id?: string | null
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          ends_at?: string | null
          firma_id?: string
          id?: string
          image_url?: string | null
          impressions_count?: number
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["wm_ad_status"]
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_campaigns_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "monetization_products"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_profile_errors: {
        Row: {
          created_at: string
          email: string | null
          error_detail: string | null
          error_hint: string | null
          error_message: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          error_detail?: string | null
          error_hint?: string | null
          error_message?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          error_detail?: string | null
          error_hint?: string | null
          error_message?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string
          event_source: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          provider_event_id: string | null
          related_payment_id: string | null
        }
        Insert: {
          created_at?: string
          event_source: string
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          provider_event_id?: string | null
          related_payment_id?: string | null
        }
        Update: {
          created_at?: string
          event_source?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          provider_event_id?: string | null
          related_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["wm_article_status"]
          tags: string[]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["wm_article_status"]
          tags?: string[]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["wm_article_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_path: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_path?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_path?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      branza_certyfikaty: {
        Row: {
          branza_id: string
          certyfikat_id: string
          created_at: string
          display_order: number
          is_required: boolean
        }
        Insert: {
          branza_id: string
          certyfikat_id: string
          created_at?: string
          display_order?: number
          is_required?: boolean
        }
        Update: {
          branza_id?: string
          certyfikat_id?: string
          created_at?: string
          display_order?: number
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "branza_certyfikaty_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branza_certyfikaty_certyfikat_id_fkey"
            columns: ["certyfikat_id"]
            isOneToOne: false
            referencedRelation: "certyfikaty"
            referencedColumns: ["id"]
          },
        ]
      }
      branza_podkategorie: {
        Row: {
          branza_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name_pl: string
          slug: string
          updated_at: string
        }
        Insert: {
          branza_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_pl: string
          slug: string
          updated_at?: string
        }
        Update: {
          branza_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_pl?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branza_podkategorie_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
        ]
      }
      branza_technologie: {
        Row: {
          branza_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name_pl: string
          slug: string
          updated_at: string
        }
        Insert: {
          branza_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_pl: string
          slug: string
          updated_at?: string
        }
        Update: {
          branza_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_pl?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branza_technologie_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
        ]
      }
      branze: {
        Row: {
          code: string
          created_at: string
          default_unit_measure: string | null
          description_long: string | null
          description_short: string | null
          display_order: number
          emoji: string | null
          icon_key: string | null
          id: string
          is_active: boolean
          name_pl: string
          parent_category: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_unit_measure?: string | null
          description_long?: string | null
          description_short?: string | null
          display_order?: number
          emoji?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name_pl: string
          parent_category?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_unit_measure?: string | null
          description_long?: string | null
          description_short?: string | null
          display_order?: number
          emoji?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name_pl?: string
          parent_category?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      certyfikaty: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name_pl: string
          slug: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name_pl: string
          slug: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name_pl?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          business_status: string | null
          created_at: string
          custom_active_pending_offer_limit: number | null
          description: string | null
          id: string
          industries: string[]
          industry: string | null
          is_verified: boolean
          krs: string | null
          legal_form: string | null
          location_city: string | null
          location_full_address: string | null
          location_postal_code: string | null
          location_street: string | null
          location_voivodeship: string | null
          name: string
          nip: string
          pkd_codes: Json | null
          plan: string
          presentation_file_name: string | null
          presentation_mime_type: string | null
          presentation_path: string | null
          presentation_size_bytes: number | null
          presentation_uploaded_at: string | null
          primary_pkd: string | null
          regon: string | null
          service_types: string[]
          slug: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          business_status?: string | null
          created_at?: string
          custom_active_pending_offer_limit?: number | null
          description?: string | null
          id?: string
          industries?: string[]
          industry?: string | null
          is_verified?: boolean
          krs?: string | null
          legal_form?: string | null
          location_city?: string | null
          location_full_address?: string | null
          location_postal_code?: string | null
          location_street?: string | null
          location_voivodeship?: string | null
          name: string
          nip: string
          pkd_codes?: Json | null
          plan?: string
          presentation_file_name?: string | null
          presentation_mime_type?: string | null
          presentation_path?: string | null
          presentation_size_bytes?: number | null
          presentation_uploaded_at?: string | null
          primary_pkd?: string | null
          regon?: string | null
          service_types?: string[]
          slug?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          business_status?: string | null
          created_at?: string
          custom_active_pending_offer_limit?: number | null
          description?: string | null
          id?: string
          industries?: string[]
          industry?: string | null
          is_verified?: boolean
          krs?: string | null
          legal_form?: string | null
          location_city?: string | null
          location_full_address?: string | null
          location_postal_code?: string | null
          location_street?: string | null
          location_voivodeship?: string | null
          name?: string
          nip?: string
          pkd_codes?: Json | null
          plan?: string
          presentation_file_name?: string | null
          presentation_mime_type?: string | null
          presentation_path?: string | null
          presentation_size_bytes?: number | null
          presentation_uploaded_at?: string | null
          primary_pkd?: string | null
          regon?: string | null
          service_types?: string[]
          slug?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_config_fk"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "plan_config"
            referencedColumns: ["plan_key"]
          },
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_certificates: {
        Row: {
          admin_note: string | null
          certificate_number: string | null
          company_id: string
          created_at: string
          expires_at: string | null
          file_bucket: string | null
          file_name: string | null
          file_path: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          mime_type: string | null
          name: string
          size_bytes: number | null
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          visibility: string
        }
        Insert: {
          admin_note?: string | null
          certificate_number?: string | null
          company_id: string
          created_at?: string
          expires_at?: string | null
          file_bucket?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Update: {
          admin_note?: string | null
          certificate_number?: string | null
          company_id?: string
          created_at?: string
          expires_at?: string | null
          file_bucket?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_certificates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_certificates_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_project_images: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          project_id: string
          storage_path: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          project_id: string
          storage_path: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          project_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_project_images_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_project_images_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "company_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      company_projects: {
        Row: {
          admin_notes: string | null
          archived_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          industry: string[]
          moderated_at: string | null
          moderated_by: string | null
          nda_confirmation: boolean
          published_at: string | null
          rejected_at: string | null
          slug: string
          status: string
          technology: string[]
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          archived_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          industry?: string[]
          moderated_at?: string | null
          moderated_by?: string | null
          nda_confirmation?: boolean
          published_at?: string | null
          rejected_at?: string | null
          slug: string
          status?: string
          technology?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          archived_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          industry?: string[]
          moderated_at?: string | null
          moderated_by?: string | null
          nda_confirmation?: boolean
          published_at?: string | null
          rejected_at?: string | null
          slug?: string
          status?: string
          technology?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_projects_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contact_settings: {
        Row: {
          company_id: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_contact_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_entitlement_changes: {
        Row: {
          admin_email: string | null
          changed_by: string
          company_id: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string
        }
        Insert: {
          admin_email?: string | null
          changed_by: string
          company_id: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason: string
        }
        Update: {
          admin_email?: string | null
          changed_by?: string
          company_id?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_entitlement_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_plan_changes: {
        Row: {
          admin_email: string | null
          changed_by: string
          company_id: string
          created_at: string
          id: string
          new_plan: string
          old_plan: string | null
          reason: string
        }
        Insert: {
          admin_email?: string | null
          changed_by: string
          company_id: string
          created_at?: string
          id?: string
          new_plan: string
          old_plan?: string | null
          reason: string
        }
        Update: {
          admin_email?: string | null
          changed_by?: string
          company_id?: string
          created_at?: string
          id?: string
          new_plan?: string
          old_plan?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_plan_changes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_plan_changes_new_plan_fk"
            columns: ["new_plan"]
            isOneToOne: false
            referencedRelation: "plan_config"
            referencedColumns: ["plan_key"]
          },
          {
            foreignKeyName: "company_plan_changes_old_plan_fk"
            columns: ["old_plan"]
            isOneToOne: false
            referencedRelation: "plan_config"
            referencedColumns: ["plan_key"]
          },
        ]
      }
      company_verification_reviews: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_verified: boolean
          verification_note: string | null
          verified_at: string
          verified_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_verified: boolean
          verification_note?: string | null
          verified_at?: string
          verified_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          verification_note?: string | null
          verified_at?: string
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_verification_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          handled_at: string | null
          id: string
          message: string
          name: string
          phone: string | null
          read_at: string | null
          source: string | null
          status: string
          topic: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          handled_at?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          source?: string | null
          status?: string
          topic?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          handled_at?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          source?: string | null
          status?: string
          topic?: string | null
        }
        Relationships: []
      }
      firma_adresy: {
        Row: {
          address_type: Database["public"]["Enums"]["wm_address_type"]
          building_number: string | null
          city: string
          country: string
          created_at: string
          firma_id: string
          id: string
          is_primary: boolean
          is_public: boolean
          latitude: number | null
          longitude: number | null
          name: string | null
          notes: string | null
          postal_code: string | null
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          street_address: string | null
          unit_number: string | null
          updated_at: string
        }
        Insert: {
          address_type?: Database["public"]["Enums"]["wm_address_type"]
          building_number?: string | null
          city: string
          country?: string
          created_at?: string
          firma_id: string
          id?: string
          is_primary?: boolean
          is_public?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          notes?: string | null
          postal_code?: string | null
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
        }
        Update: {
          address_type?: Database["public"]["Enums"]["wm_address_type"]
          building_number?: string | null
          city?: string
          country?: string
          created_at?: string
          firma_id?: string
          id?: string
          is_primary?: boolean
          is_public?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          notes?: string | null
          postal_code?: string | null
          province?: Database["public"]["Enums"]["wm_wojewodztwo"]
          street_address?: string | null
          unit_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "firma_adresy_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      firma_branze: {
        Row: {
          branza_id: string
          created_at: string
          firma_id: string
        }
        Insert: {
          branza_id: string
          created_at?: string
          firma_id: string
        }
        Update: {
          branza_id?: string
          created_at?: string
          firma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firma_branze_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "firma_branze_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      firma_opinie: {
        Row: {
          admin_note: string | null
          collaboration_evidence_data: Json
          collaboration_evidence_note: string | null
          collaboration_reference_id: string | null
          collaboration_reference_type: string | null
          collaboration_status: Database["public"]["Enums"]["wm_collaboration_status"]
          collaboration_verification_method:
            | Database["public"]["Enums"]["wm_collaboration_verification_method"]
            | null
          collaboration_verified_at: string | null
          collaboration_verified_by: string | null
          comment: string
          cooperation_date: string | null
          created_at: string
          id: string
          moderation_status: Database["public"]["Enums"]["wm_moderation_status"]
          published_at: string | null
          rating: number
          related_oferta_id: string | null
          related_rfq_id: string | null
          reviewed_firma_id: string
          reviewer_firma_id: string | null
          reviewer_user_id: string
          title: string | null
          updated_at: string
          verified_collaboration: boolean
        }
        Insert: {
          admin_note?: string | null
          collaboration_evidence_data?: Json
          collaboration_evidence_note?: string | null
          collaboration_reference_id?: string | null
          collaboration_reference_type?: string | null
          collaboration_status?: Database["public"]["Enums"]["wm_collaboration_status"]
          collaboration_verification_method?:
            | Database["public"]["Enums"]["wm_collaboration_verification_method"]
            | null
          collaboration_verified_at?: string | null
          collaboration_verified_by?: string | null
          comment: string
          cooperation_date?: string | null
          created_at?: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["wm_moderation_status"]
          published_at?: string | null
          rating: number
          related_oferta_id?: string | null
          related_rfq_id?: string | null
          reviewed_firma_id: string
          reviewer_firma_id?: string | null
          reviewer_user_id: string
          title?: string | null
          updated_at?: string
          verified_collaboration?: boolean
        }
        Update: {
          admin_note?: string | null
          collaboration_evidence_data?: Json
          collaboration_evidence_note?: string | null
          collaboration_reference_id?: string | null
          collaboration_reference_type?: string | null
          collaboration_status?: Database["public"]["Enums"]["wm_collaboration_status"]
          collaboration_verification_method?:
            | Database["public"]["Enums"]["wm_collaboration_verification_method"]
            | null
          collaboration_verified_at?: string | null
          collaboration_verified_by?: string | null
          comment?: string
          cooperation_date?: string | null
          created_at?: string
          id?: string
          moderation_status?: Database["public"]["Enums"]["wm_moderation_status"]
          published_at?: string | null
          rating?: number
          related_oferta_id?: string | null
          related_rfq_id?: string | null
          reviewed_firma_id?: string
          reviewer_firma_id?: string | null
          reviewer_user_id?: string
          title?: string | null
          updated_at?: string
          verified_collaboration?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "firma_opinie_related_oferta_id_fkey"
            columns: ["related_oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "firma_opinie_related_rfq_id_fkey"
            columns: ["related_rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "firma_opinie_reviewed_firma_id_fkey"
            columns: ["reviewed_firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "firma_opinie_reviewer_firma_id_fkey"
            columns: ["reviewer_firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      firma_subscriptions: {
        Row: {
          admin_note: string | null
          billing_provider: string | null
          billing_provider_customer_id: string | null
          billing_provider_subscription_id: string | null
          cancelled_at: string | null
          created_at: string
          firma_id: string
          id: string
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["wm_subscription_status"]
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          admin_note?: string | null
          billing_provider?: string | null
          billing_provider_customer_id?: string | null
          billing_provider_subscription_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          firma_id: string
          id?: string
          plan_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["wm_subscription_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          admin_note?: string | null
          billing_provider?: string | null
          billing_provider_customer_id?: string | null
          billing_provider_subscription_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          firma_id?: string
          id?: string
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["wm_subscription_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "firma_subscriptions_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "firma_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      firma_verification_requests: {
        Row: {
          admin_note: string | null
          billing_provider: string | null
          billing_provider_payment_id: string | null
          created_at: string
          currency: string
          firma_id: string
          id: string
          payment_status: Database["public"]["Enums"]["wm_payment_status"]
          price_amount: number | null
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["wm_verification_status"]
          updated_at: string
          verification_type: string
        }
        Insert: {
          admin_note?: string | null
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["wm_verification_status"]
          updated_at?: string
          verification_type?: string
        }
        Update: {
          admin_note?: string | null
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["wm_verification_status"]
          updated_at?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "firma_verification_requests_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      firma_weryfikacje: {
        Row: {
          created_at: string
          firma_id: string | null
          id: string
          krs: string | null
          nip: string
          provider: Database["public"]["Enums"]["wm_registry_provider"]
          raw_response: Json
          regon: string | null
          result_status: string
          returned_address: string | null
          returned_city: string | null
          returned_company_name: string | null
          returned_province: string | null
        }
        Insert: {
          created_at?: string
          firma_id?: string | null
          id?: string
          krs?: string | null
          nip: string
          provider: Database["public"]["Enums"]["wm_registry_provider"]
          raw_response?: Json
          regon?: string | null
          result_status: string
          returned_address?: string | null
          returned_city?: string | null
          returned_company_name?: string | null
          returned_province?: string | null
        }
        Update: {
          created_at?: string
          firma_id?: string | null
          id?: string
          krs?: string | null
          nip?: string
          provider?: Database["public"]["Enums"]["wm_registry_provider"]
          raw_response?: Json
          regon?: string | null
          result_status?: string
          returned_address?: string | null
          returned_city?: string | null
          returned_company_name?: string | null
          returned_province?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "firma_weryfikacje_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      firmy: {
        Row: {
          city: string
          cover_url: string | null
          created_at: string
          current_plan_code: string
          description: string | null
          employees: Database["public"]["Enums"]["wm_employees_range"] | null
          founded_year: number | null
          id: string
          is_verified: boolean
          krs: string | null
          legal_form: string | null
          logo_url: string | null
          nazwa: string
          nip: string
          profile_completed: boolean
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          rating_avg: number
          registry_last_checked_at: string | null
          registry_raw_data: Json
          registry_source:
            | Database["public"]["Enums"]["wm_registry_provider"]
            | null
          registry_status: string | null
          regon: string | null
          reviews_count: number
          search_vector: unknown
          slug: string
          subscription_valid_until: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["wm_verification_status"]
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          city: string
          cover_url?: string | null
          created_at?: string
          current_plan_code?: string
          description?: string | null
          employees?: Database["public"]["Enums"]["wm_employees_range"] | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean
          krs?: string | null
          legal_form?: string | null
          logo_url?: string | null
          nazwa: string
          nip: string
          profile_completed?: boolean
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          rating_avg?: number
          registry_last_checked_at?: string | null
          registry_raw_data?: Json
          registry_source?:
            | Database["public"]["Enums"]["wm_registry_provider"]
            | null
          registry_status?: string | null
          regon?: string | null
          reviews_count?: number
          search_vector?: unknown
          slug: string
          subscription_valid_until?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["wm_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          city?: string
          cover_url?: string | null
          created_at?: string
          current_plan_code?: string
          description?: string | null
          employees?: Database["public"]["Enums"]["wm_employees_range"] | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean
          krs?: string | null
          legal_form?: string | null
          logo_url?: string | null
          nazwa?: string
          nip?: string
          profile_completed?: boolean
          province?: Database["public"]["Enums"]["wm_wojewodztwo"]
          rating_avg?: number
          registry_last_checked_at?: string | null
          registry_raw_data?: Json
          registry_source?:
            | Database["public"]["Enums"]["wm_registry_provider"]
            | null
          registry_status?: string | null
          regon?: string | null
          reviews_count?: number
          search_vector?: unknown
          slug?: string
          subscription_valid_until?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["wm_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "firmy_current_plan_code_fkey"
            columns: ["current_plan_code"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      inquiries: {
        Row: {
          branch: string | null
          budget: string | null
          buyer_company: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          company_id: string | null
          created_at: string
          deadline: string | null
          expected_deadline: string | null
          id: string
          lead_status: string
          message: string
          offer_id: string | null
          quantity: string | null
          quantity_scope: string | null
          recipient_read_at: string | null
          sender_id: string | null
          service_type: string | null
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          branch?: string | null
          budget?: string | null
          buyer_company?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          expected_deadline?: string | null
          id?: string
          lead_status?: string
          message: string
          offer_id?: string | null
          quantity?: string | null
          quantity_scope?: string | null
          recipient_read_at?: string | null
          sender_id?: string | null
          service_type?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          branch?: string | null
          budget?: string | null
          buyer_company?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          company_id?: string | null
          created_at?: string
          deadline?: string | null
          expected_deadline?: string | null
          id?: string
          lead_status?: string
          message?: string
          offer_id?: string | null
          quantity?: string | null
          quantity_scope?: string | null
          recipient_read_at?: string | null
          sender_id?: string | null
          service_type?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_attachments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          inquiry_id: string
          mime_type: string | null
          offer_id: string | null
          original_file_name: string
          size_bytes: number
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          inquiry_id: string
          mime_type?: string | null
          offer_id?: string | null
          original_file_name: string
          size_bytes: number
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          mime_type?: string | null
          offer_id?: string | null
          original_file_name?: string
          size_bytes?: number
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_attachments_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_attachments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_unlocks: {
        Row: {
          billing_provider: string | null
          billing_provider_payment_id: string | null
          created_at: string
          currency: string
          firma_id: string
          id: string
          payment_status: Database["public"]["Enums"]["wm_payment_status"]
          price_amount: number | null
          product_id: string | null
          rfq_id: string
          unlock_method: Database["public"]["Enums"]["wm_lead_unlock_method"]
          unlocked_at: string | null
          unlocked_by_user_id: string | null
        }
        Insert: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          rfq_id: string
          unlock_method?: Database["public"]["Enums"]["wm_lead_unlock_method"]
          unlocked_at?: string | null
          unlocked_by_user_id?: string | null
        }
        Update: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          rfq_id?: string
          unlock_method?: Database["public"]["Enums"]["wm_lead_unlock_method"]
          unlocked_at?: string | null
          unlocked_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_unlocks_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_unlocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "monetization_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_unlocks_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      monetization_products: {
        Row: {
          billing_period: Database["public"]["Enums"]["wm_billing_period"]
          code: string
          created_at: string
          currency: string
          description_pl: string | null
          display_order: number
          display_price_label: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          is_custom_pricing: boolean
          metadata: Json
          min_price_amount: number | null
          name_pl: string
          price_amount: number | null
          product_type: Database["public"]["Enums"]["wm_product_type"]
          updated_at: string
        }
        Insert: {
          billing_period?: Database["public"]["Enums"]["wm_billing_period"]
          code: string
          created_at?: string
          currency?: string
          description_pl?: string | null
          display_order?: number
          display_price_label?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          is_custom_pricing?: boolean
          metadata?: Json
          min_price_amount?: number | null
          name_pl: string
          price_amount?: number | null
          product_type: Database["public"]["Enums"]["wm_product_type"]
          updated_at?: string
        }
        Update: {
          billing_period?: Database["public"]["Enums"]["wm_billing_period"]
          code?: string
          created_at?: string
          currency?: string
          description_pl?: string | null
          display_order?: number
          display_price_label?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          is_custom_pricing?: boolean
          metadata?: Json
          min_price_amount?: number | null
          name_pl?: string
          price_amount?: number | null
          product_type?: Database["public"]["Enums"]["wm_product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          consent_marketing: boolean
          created_at: string
          email: string
          id: string
          source: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          consent_marketing?: boolean
          created_at?: string
          email: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          consent_marketing?: boolean
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      oferta_certyfikaty: {
        Row: {
          certyfikat_id: string
          created_at: string
          oferta_id: string
        }
        Insert: {
          certyfikat_id: string
          created_at?: string
          oferta_id: string
        }
        Update: {
          certyfikat_id?: string
          created_at?: string
          oferta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oferta_certyfikaty_certyfikat_id_fkey"
            columns: ["certyfikat_id"]
            isOneToOne: false
            referencedRelation: "certyfikaty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_certyfikaty_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
        ]
      }
      oferta_podkategorie: {
        Row: {
          created_at: string
          oferta_id: string
          podkategoria_id: string
        }
        Insert: {
          created_at?: string
          oferta_id: string
          podkategoria_id: string
        }
        Update: {
          created_at?: string
          oferta_id?: string
          podkategoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oferta_podkategorie_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_podkategorie_podkategoria_id_fkey"
            columns: ["podkategoria_id"]
            isOneToOne: false
            referencedRelation: "branza_podkategorie"
            referencedColumns: ["id"]
          },
        ]
      }
      oferta_promotions: {
        Row: {
          billing_provider: string | null
          billing_provider_payment_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          ends_at: string
          id: string
          oferta_id: string
          payment_status: Database["public"]["Enums"]["wm_payment_status"]
          price_amount: number | null
          product_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["wm_promotion_status"]
          updated_at: string
        }
        Insert: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          ends_at: string
          id?: string
          oferta_id: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["wm_promotion_status"]
          updated_at?: string
        }
        Update: {
          billing_provider?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          ends_at?: string
          id?: string
          oferta_id?: string
          payment_status?: Database["public"]["Enums"]["wm_payment_status"]
          price_amount?: number | null
          product_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["wm_promotion_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oferta_promotions_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "monetization_products"
            referencedColumns: ["id"]
          },
        ]
      }
      oferty: {
        Row: {
          branza_id: string
          capacity_unit: string
          capacity_value: number
          city: string
          created_at: string
          custom_certifications: string[]
          description: string
          equipment: string[]
          featured_until: string | null
          firma_id: string
          gallery_urls: Json
          id: string
          inquiries_count: number
          is_featured: boolean
          lead_time: string | null
          location_note: string | null
          min_order: string | null
          moderation_status: Database["public"]["Enums"]["wm_moderation_status"]
          price_type: Database["public"]["Enums"]["wm_price_type"]
          price_value: number | null
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          published_at: string | null
          search_vector: unknown
          slug: string
          status_display: Database["public"]["Enums"]["wm_offer_status_display"]
          title: string
          updated_at: string
          valid_until: string
          verified: boolean
          video_url: string | null
          views_count: number
        }
        Insert: {
          branza_id: string
          capacity_unit: string
          capacity_value: number
          city: string
          created_at?: string
          custom_certifications?: string[]
          description: string
          equipment?: string[]
          featured_until?: string | null
          firma_id: string
          gallery_urls?: Json
          id?: string
          inquiries_count?: number
          is_featured?: boolean
          lead_time?: string | null
          location_note?: string | null
          min_order?: string | null
          moderation_status?: Database["public"]["Enums"]["wm_moderation_status"]
          price_type?: Database["public"]["Enums"]["wm_price_type"]
          price_value?: number | null
          province: Database["public"]["Enums"]["wm_wojewodztwo"]
          published_at?: string | null
          search_vector?: unknown
          slug: string
          status_display?: Database["public"]["Enums"]["wm_offer_status_display"]
          title: string
          updated_at?: string
          valid_until: string
          verified?: boolean
          video_url?: string | null
          views_count?: number
        }
        Update: {
          branza_id?: string
          capacity_unit?: string
          capacity_value?: number
          city?: string
          created_at?: string
          custom_certifications?: string[]
          description?: string
          equipment?: string[]
          featured_until?: string | null
          firma_id?: string
          gallery_urls?: Json
          id?: string
          inquiries_count?: number
          is_featured?: boolean
          lead_time?: string | null
          location_note?: string | null
          min_order?: string | null
          moderation_status?: Database["public"]["Enums"]["wm_moderation_status"]
          price_type?: Database["public"]["Enums"]["wm_price_type"]
          price_value?: number | null
          province?: Database["public"]["Enums"]["wm_wojewodztwo"]
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          status_display?: Database["public"]["Enums"]["wm_offer_status_display"]
          title?: string
          updated_at?: string
          valid_until?: string
          verified?: boolean
          video_url?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "oferty_branza_id_fkey"
            columns: ["branza_id"]
            isOneToOne: false
            referencedRelation: "branze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferty_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          offer_id: string
          path: string
          sort_order: number
          user_id: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          offer_id: string
          path: string
          sort_order?: number
          user_id: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          offer_id?: string
          path?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_images_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          branch: string
          company_id: string
          created_at: string
          description: string | null
          featured_priority: number
          featured_until: string | null
          id: string
          is_featured: boolean
          lead_time: string | null
          min_order: string | null
          power_available: string | null
          service_type: string
          slug: string
          status: Database["public"]["Enums"]["offer_status"]
          title: string
          updated_at: string
        }
        Insert: {
          branch: string
          company_id: string
          created_at?: string
          description?: string | null
          featured_priority?: number
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          lead_time?: string | null
          min_order?: string | null
          power_available?: string | null
          service_type: string
          slug: string
          status?: Database["public"]["Enums"]["offer_status"]
          title: string
          updated_at?: string
        }
        Update: {
          branch?: string
          company_id?: string
          created_at?: string
          description?: string | null
          featured_priority?: number
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          lead_time?: string | null
          min_order?: string | null
          power_available?: string | null
          service_type?: string
          slug?: string
          status?: Database["public"]["Enums"]["offer_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          billing_provider: string | null
          billing_provider_checkout_id: string | null
          billing_provider_payment_id: string | null
          created_at: string
          currency: string
          firma_id: string | null
          id: string
          metadata: Json
          product_id: string | null
          status: Database["public"]["Enums"]["wm_payment_status"]
          target_id: string | null
          target_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_provider?: string | null
          billing_provider_checkout_id?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id?: string | null
          id?: string
          metadata?: Json
          product_id?: string | null
          status?: Database["public"]["Enums"]["wm_payment_status"]
          target_id?: string | null
          target_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_provider?: string | null
          billing_provider_checkout_id?: string | null
          billing_provider_payment_id?: string | null
          created_at?: string
          currency?: string
          firma_id?: string | null
          id?: string
          metadata?: Json
          product_id?: string | null
          status?: Database["public"]["Enums"]["wm_payment_status"]
          target_id?: string | null
          target_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "monetization_products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_config: {
        Row: {
          can_feature_offers: boolean
          created_at: string
          max_active_pending_offers: number | null
          moderation_priority: number
          monthly_bumps_limit: number
          plan_key: string
          updated_at: string
        }
        Insert: {
          can_feature_offers?: boolean
          created_at?: string
          max_active_pending_offers?: number | null
          moderation_priority?: number
          monthly_bumps_limit?: number
          plan_key: string
          updated_at?: string
        }
        Update: {
          can_feature_offers?: boolean
          created_at?: string
          max_active_pending_offers?: number | null
          moderation_priority?: number
          monthly_bumps_limit?: number
          plan_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_events: {
        Row: {
          created_at: string
          event_type: string
          firma_id: string | null
          id: string
          ip_hash: string | null
          metadata: Json
          oferta_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          firma_id?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          oferta_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          firma_id?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          oferta_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_events_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_events_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_email: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          profile_completed: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          phone?: string | null
          profile_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          profile_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rfq_contact_details: {
        Row: {
          contact_company_name: string | null
          contact_email: string
          contact_name: string
          contact_note: string | null
          contact_phone: string | null
          created_at: string
          rfq_id: string
          updated_at: string
        }
        Insert: {
          contact_company_name?: string | null
          contact_email: string
          contact_name: string
          contact_note?: string | null
          contact_phone?: string | null
          created_at?: string
          rfq_id: string
          updated_at?: string
        }
        Update: {
          contact_company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_note?: string | null
          contact_phone?: string | null
          created_at?: string
          rfq_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_contact_details_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: true
            referencedRelation: "rfq_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_inquiries: {
        Row: {
          budget_amount: number | null
          budget_currency: string
          buyer_firma_id: string | null
          buyer_user_id: string
          completed_at: string | null
          created_at: string
          deadline: string | null
          id: string
          message: string
          oferta_id: string
          quantity: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["wm_rfq_status"]
          subject: string
          updated_at: string
          vendor_last_viewed_at: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_currency?: string
          buyer_firma_id?: string | null
          buyer_user_id: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          message: string
          oferta_id: string
          quantity?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["wm_rfq_status"]
          subject: string
          updated_at?: string
          vendor_last_viewed_at?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_currency?: string
          buyer_firma_id?: string | null
          buyer_user_id?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          message?: string
          oferta_id?: string
          quantity?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["wm_rfq_status"]
          subject?: string
          updated_at?: string
          vendor_last_viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_inquiries_buyer_firma_id_fkey"
            columns: ["buyer_firma_id"]
            isOneToOne: false
            referencedRelation: "firmy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_inquiries_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "oferty"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          industry: string
          proposed_service: string
          reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          industry: string
          proposed_service: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          industry?: string
          proposed_service?: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          analytics_enabled: boolean
          api_access: boolean
          billing_period: Database["public"]["Enums"]["wm_billing_period"]
          code: string
          created_at: string
          currency: string
          description_pl: string | null
          display_order: number
          display_price_label: string | null
          features: Json
          id: string
          is_active: boolean
          is_custom_pricing: boolean
          max_active_offers: number | null
          monthly_included_leads: number | null
          name_pl: string
          price_amount: number | null
          priority_visibility: boolean
          subtitle_pl: string | null
          support_level: string | null
          updated_at: string
          verification_level: string | null
          website_visible: boolean
        }
        Insert: {
          analytics_enabled?: boolean
          api_access?: boolean
          billing_period?: Database["public"]["Enums"]["wm_billing_period"]
          code: string
          created_at?: string
          currency?: string
          description_pl?: string | null
          display_order?: number
          display_price_label?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_custom_pricing?: boolean
          max_active_offers?: number | null
          monthly_included_leads?: number | null
          name_pl: string
          price_amount?: number | null
          priority_visibility?: boolean
          subtitle_pl?: string | null
          support_level?: string | null
          updated_at?: string
          verification_level?: string | null
          website_visible?: boolean
        }
        Update: {
          analytics_enabled?: boolean
          api_access?: boolean
          billing_period?: Database["public"]["Enums"]["wm_billing_period"]
          code?: string
          created_at?: string
          currency?: string
          description_pl?: string | null
          display_order?: number
          display_price_label?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_custom_pricing?: boolean
          max_active_offers?: number | null
          monthly_included_leads?: number | null
          name_pl?: string
          price_amount?: number | null
          priority_visibility?: boolean
          subtitle_pl?: string | null
          support_level?: string | null
          updated_at?: string
          verification_level?: string | null
          website_visible?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_change_company_offer_limit: {
        Args: { p_company_id: string; p_custom_limit: number; p_reason: string }
        Returns: undefined
      }
      admin_change_company_plan: {
        Args: { p_company_id: string; p_new_plan: string; p_reason: string }
        Returns: undefined
      }
      admin_set_company_verification: {
        Args: {
          p_company_id: string
          p_is_verified: boolean
          p_verification_note: string
        }
        Returns: undefined
      }
      get_current_plan_for_firma: {
        Args: { p_firma_id: string }
        Returns: {
          analytics_enabled: boolean
          api_access: boolean
          max_active_offers: number
          monthly_included_leads: number
          plan_code: string
          priority_visibility: boolean
          website_visible: boolean
        }[]
      }
      increment_offer_inquiries: {
        Args: { p_offer_id: string }
        Returns: undefined
      }
      increment_offer_views: {
        Args: { p_offer_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_app_admin: { Args: never; Returns: boolean }
      recalculate_firma_rating: {
        Args: { p_firma_id: string }
        Returns: undefined
      }
      refresh_offer_featured_state: {
        Args: { p_oferta_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      storage_certificate_company_id_from_path: {
        Args: { object_name: string }
        Returns: string
      }
      storage_company_id_from_path: {
        Args: { object_name: string }
        Returns: string
      }
      storage_inquiry_id_from_path: {
        Args: { object_name: string }
        Returns: string
      }
      storage_offer_image_offer_id_from_path: {
        Args: { object_name: string }
        Returns: string
      }
      storage_offer_image_user_id_from_path: {
        Args: { object_name: string }
        Returns: string
      }
      user_owns_company: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      user_owns_inquiry: {
        Args: { target_inquiry_id: string }
        Returns: boolean
      }
      user_owns_offer: { Args: { target_offer_id: string }; Returns: boolean }
      verify_review_collaboration: {
        Args: {
          p_evidence_data?: Json
          p_method: Database["public"]["Enums"]["wm_collaboration_verification_method"]
          p_note?: string
          p_reference_id?: string
          p_reference_type?: string
          p_review_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      inquiry_status: "pending" | "responded" | "completed" | "cancelled"
      offer_status: "draft" | "pending" | "active" | "rejected" | "archived"
      user_role: "admin" | "vendor" | "user"
      wm_ad_status:
        | "draft"
        | "pending"
        | "active"
        | "paused"
        | "expired"
        | "rejected"
      wm_address_type:
        | "registered_office"
        | "production_site"
        | "warehouse"
        | "service_point"
        | "other"
      wm_article_status: "draft" | "published" | "archived"
      wm_billing_period: "none" | "one_time" | "monthly" | "yearly" | "custom"
      wm_collaboration_status:
        | "unverified"
        | "pending_verification"
        | "verified"
        | "rejected"
      wm_collaboration_verification_method:
        | "admin_manual"
        | "rfq_completed"
        | "transaction_completed"
        | "both_sides_confirmed"
        | "document_uploaded"
        | "platform_payment"
      wm_employees_range:
        | "emp_1_9"
        | "emp_10_49"
        | "emp_50_249"
        | "emp_250_plus"
      wm_lead_unlock_method:
        | "paid"
        | "plan_included"
        | "admin_manual"
        | "free_promo"
      wm_moderation_status: "pending" | "published" | "rejected" | "archived"
      wm_offer_status_display: "aktywna" | "zawieszona"
      wm_payment_status:
        | "not_required"
        | "unpaid"
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      wm_price_type: "na_zapytanie" | "od_x_pln" | "ryczalt"
      wm_product_type:
        | "subscription"
        | "offer_boost"
        | "lead_unlock"
        | "company_verification"
        | "banner_ad"
        | "other"
      wm_promotion_status: "pending" | "active" | "expired" | "cancelled"
      wm_registry_provider:
        | "gus_regon"
        | "ceidg"
        | "krs"
        | "rejestr_io"
        | "manual"
        | "other"
      wm_rfq_status:
        | "new"
        | "viewed"
        | "responded"
        | "completed"
        | "cancelled"
        | "spam"
      wm_subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
      wm_user_role: "buyer" | "vendor" | "admin"
      wm_verification_status:
        | "not_verified"
        | "pending"
        | "verified"
        | "rejected"
        | "expired"
      wm_wojewodztwo:
        | "dolnoslaskie"
        | "kujawsko_pomorskie"
        | "lubelskie"
        | "lubuskie"
        | "lodzkie"
        | "malopolskie"
        | "mazowieckie"
        | "opolskie"
        | "podkarpackie"
        | "podlaskie"
        | "pomorskie"
        | "slaskie"
        | "swietokrzyskie"
        | "warminsko_mazurskie"
        | "wielkopolskie"
        | "zachodniopomorskie"
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
      inquiry_status: ["pending", "responded", "completed", "cancelled"],
      offer_status: ["draft", "pending", "active", "rejected", "archived"],
      user_role: ["admin", "vendor", "user"],
      wm_ad_status: [
        "draft",
        "pending",
        "active",
        "paused",
        "expired",
        "rejected",
      ],
      wm_address_type: [
        "registered_office",
        "production_site",
        "warehouse",
        "service_point",
        "other",
      ],
      wm_article_status: ["draft", "published", "archived"],
      wm_billing_period: ["none", "one_time", "monthly", "yearly", "custom"],
      wm_collaboration_status: [
        "unverified",
        "pending_verification",
        "verified",
        "rejected",
      ],
      wm_collaboration_verification_method: [
        "admin_manual",
        "rfq_completed",
        "transaction_completed",
        "both_sides_confirmed",
        "document_uploaded",
        "platform_payment",
      ],
      wm_employees_range: [
        "emp_1_9",
        "emp_10_49",
        "emp_50_249",
        "emp_250_plus",
      ],
      wm_lead_unlock_method: [
        "paid",
        "plan_included",
        "admin_manual",
        "free_promo",
      ],
      wm_moderation_status: ["pending", "published", "rejected", "archived"],
      wm_offer_status_display: ["aktywna", "zawieszona"],
      wm_payment_status: [
        "not_required",
        "unpaid",
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      wm_price_type: ["na_zapytanie", "od_x_pln", "ryczalt"],
      wm_product_type: [
        "subscription",
        "offer_boost",
        "lead_unlock",
        "company_verification",
        "banner_ad",
        "other",
      ],
      wm_promotion_status: ["pending", "active", "expired", "cancelled"],
      wm_registry_provider: [
        "gus_regon",
        "ceidg",
        "krs",
        "rejestr_io",
        "manual",
        "other",
      ],
      wm_rfq_status: [
        "new",
        "viewed",
        "responded",
        "completed",
        "cancelled",
        "spam",
      ],
      wm_subscription_status: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
      wm_user_role: ["buyer", "vendor", "admin"],
      wm_verification_status: [
        "not_verified",
        "pending",
        "verified",
        "rejected",
        "expired",
      ],
      wm_wojewodztwo: [
        "dolnoslaskie",
        "kujawsko_pomorskie",
        "lubelskie",
        "lubuskie",
        "lodzkie",
        "malopolskie",
        "mazowieckie",
        "opolskie",
        "podkarpackie",
        "podlaskie",
        "pomorskie",
        "slaskie",
        "swietokrzyskie",
        "warminsko_mazurskie",
        "wielkopolskie",
        "zachodniopomorskie",
      ],
    },
  },
} as const
