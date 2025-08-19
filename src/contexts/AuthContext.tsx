import React, { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, Profile, AuthContextType } from '@/contexts/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
  console.debug('[Auth] getSession resolved', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug('[Auth] onAuthStateChange', { event, hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
  console.debug('[Auth] Fetching profile for', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Note: Profile will be auto-created by database trigger
      // No need to manually insert into profiles table
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }

    try {
  console.debug('[Auth] signIn called');
      setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  console.debug('[Auth] signIn resolved', { hasError: !!error });
      return { error };
    } catch (error) {
  console.error('[Auth] signIn threw', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.debug('[Auth] signOut called');
    try {
      setLoading(true);
      // Fallback timeout to avoid hanging if network stalls
      const timeout = new Promise<{ error: AuthError | null }>((resolve) => {
        setTimeout(() => {
          console.warn('[Auth] signOut timed out; clearing local state');
          resolve({ error: null });
        }, 5000);
      });
      const signOutPromise = supabase?.auth.signOut().then(({ error }) => {
        console.debug('[Auth] supabase.auth.signOut resolved', { hasError: !!error });
        return { error };
      });

      const { error } = await Promise.race([signOutPromise, timeout]);

      if (!error) {
        // Optimistically clear local auth state; onAuthStateChange will also handle this
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      return { error: error ?? undefined };
    } catch (error) {
      console.error('[Auth] signOut threw', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }

    try {
  console.debug('[Auth] signInWithGoogle called');
  setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
  console.debug('[Auth] signInWithGoogle resolved', { hasError: !!error });
      return { error };
    } catch (error) {
  console.error('[Auth] signInWithGoogle threw', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !supabase) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
