import { createClient } from '@supabase/supabase-js';
import { ResumeData } from '@/store/useResume';

import { getEnvVar, isDemoMode, isProdMode } from '@/lib/env';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Allow app to run without Supabase in demo mode or development
if (!supabaseUrl || !supabaseAnonKey) {
  if (isProdMode() && !isDemoMode()) {
    console.error('Missing Supabase environment variables in production');
    // Don't throw in production - just disable auth features
  }
  console.warn('⚠️ Supabase not configured - auth features will be disabled');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          template_key: string;
          resume_data: ResumeData;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          template_key?: string;
          resume_data: ResumeData;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          template_key?: string;
          resume_data?: ResumeData;
          is_public?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
