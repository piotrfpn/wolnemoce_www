export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          nip: string;
          name: string;
          description: string | null;
          industry: string | null;
          location_voivodeship: string | null;
          location_city: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          service_types: string[];
          industries: string[];
          website_url: string | null;
          presentation_path: string | null;
          presentation_file_name: string | null;
          presentation_mime_type: string | null;
          presentation_size_bytes: number | null;
          presentation_uploaded_at: string | null;
          slug: string | null;
          plan: string;
          regon: string | null;
          location_postal_code: string | null;
          location_street: string | null;
          location_full_address: string | null;
          krs: string | null;
          legal_form: string | null;
          business_status: string | null;
          primary_pkd: string | null;
          pkd_codes: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          nip: string;
          name: string;
          description?: string | null;
          industry?: string | null;
          location_voivodeship?: string | null;
          location_city?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          service_types?: string[];
          industries?: string[];
          website_url?: string | null;
          presentation_path?: string | null;
          presentation_file_name?: string | null;
          presentation_mime_type?: string | null;
          presentation_size_bytes?: number | null;
          presentation_uploaded_at?: string | null;
          slug?: string | null;
          plan?: string;
          regon?: string | null;
          location_postal_code?: string | null;
          location_street?: string | null;
          location_full_address?: string | null;
          krs?: string | null;
          legal_form?: string | null;
          business_status?: string | null;
          primary_pkd?: string | null;
          pkd_codes?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          nip?: string;
          name?: string;
          description?: string | null;
          industry?: string | null;
          location_voivodeship?: string | null;
          location_city?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          service_types?: string[];
          industries?: string[];
          website_url?: string | null;
          presentation_path?: string | null;
          presentation_file_name?: string | null;
          presentation_mime_type?: string | null;
          presentation_size_bytes?: number | null;
          presentation_uploaded_at?: string | null;
          slug?: string | null;
          plan?: string;
          regon?: string | null;
          location_postal_code?: string | null;
          location_street?: string | null;
          location_full_address?: string | null;
          krs?: string | null;
          legal_form?: string | null;
          business_status?: string | null;
          primary_pkd?: string | null;
          pkd_codes?: Json | null;
        };
      };
    };
  };
};
