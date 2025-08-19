import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        navigate('/auth?error=auth_unavailable');
        return;
      }

      try {
        // Some providers or environments use the hash for tokens (implicit-like flow)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
          // Normalize to URLSearchParams to inspect quickly
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken = params.get('access_token');
          // Let Supabase parse and store the session from the URL (hash or query)
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Auth callback getSession error (hash present):', error);
          }
          if (data?.session || accessToken) {
            navigate('/editor');
            return;
          }
        }

        // Standard PKCE code flow (Supabase handles exchange automatically on load)
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=oauth_error');
          return;
        }
        if (data.session) {
          navigate('/editor');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
