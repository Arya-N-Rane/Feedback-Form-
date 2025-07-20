import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL format. URL should start with https://');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);

export type Database = {
  public: {
    Tables: {
      feedback_submissions: {
        Row: {
          id: string;
          name: string;
          contact: string;
          date_of_experience: string;
          date_of_submission: string;
          before_image_url: string | null;
          after_image_url: string | null;
          overall_experience: number;
          quality_of_service: string;
          timeliness: string;
          professionalism: string;
          communication_ease: string;
          liked_most: string;
          suggestions: string;
          would_recommend: string;
          permission_to_publish: boolean;
          can_contact_again: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          date_of_experience: string;
          date_of_submission?: string;
          before_image_url?: string | null;
          after_image_url?: string | null;
          overall_experience: number;
          quality_of_service: string;
          timeliness: string;
          professionalism: string;
          communication_ease: string;
          liked_most: string;
          suggestions: string;
          would_recommend: string;
          permission_to_publish: boolean;
          can_contact_again: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          date_of_experience?: string;
          date_of_submission?: string;
          before_image_url?: string | null;
          after_image_url?: string | null;
          overall_experience?: number;
          quality_of_service?: string;
          timeliness?: string;
          professionalism?: string;
          communication_ease?: string;
          liked_most?: string;
          suggestions?: string;
          would_recommend?: string;
          permission_to_publish?: boolean;
          can_contact_again?: boolean;
          created_at?: string;
        };
      };
    };
  };
};