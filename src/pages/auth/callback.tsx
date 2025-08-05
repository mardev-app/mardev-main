import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing authentication...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Debug logging
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        
        // Get the URL hash and search params
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL params
        const urlError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (urlError) {
          console.error('OAuth error:', urlError, errorDescription);
          setMessage(`Authentication failed: ${errorDescription || urlError}`);
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Handle the OAuth callback - let Supabase handle the session automatically
        // Supabase should automatically detect and set the session from the URL
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session data:', sessionData);
        console.log('Session error:', sessionError);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setMessage('Authentication failed: Unable to get session');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (sessionData.session) {
          setMessage('Authentication successful! Redirecting to setup...');
          setStatus('success');
          // Clean up the URL by removing the hash
          window.history.replaceState(null, '', window.location.pathname);
          // Redirect to onboarding
          setTimeout(() => navigate('/onboarding'), 1500);
          return;
        }

        // If no session yet, try manual hash parsing as fallback
        if (hash && hash.includes('access_token')) {
          console.log('Trying manual hash parsing...');
          // Parse the hash parameters
          const hashParams = new URLSearchParams(hash.substring(1)); // Remove the # symbol
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          console.log('Access token found:', !!accessToken);
          console.log('Refresh token found:', !!refreshToken);
          
          if (accessToken) {
            // Set the session using the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            console.log('Set session result:', { data, error });
            
            if (error) {
              console.error('Set session error:', error);
              setMessage('Authentication failed: Unable to set session');
              setStatus('error');
              setTimeout(() => navigate('/'), 3000);
              return;
            }
            
            if (data.session) {
              setMessage('Authentication successful! Redirecting to setup...');
              setStatus('success');
              // Clean up the URL by removing the hash
              window.history.replaceState(null, '', window.location.pathname);
              // Redirect to onboarding
              setTimeout(() => navigate('/onboarding'), 1500);
              return;
            }
          }
        }
        // Try the code exchange method as a final fallback for PKCE flow
        console.log('Trying code exchange as fallback...');
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError);
          setMessage('Authentication failed: Unable to complete login');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        setMessage('Authentication successful! Redirecting to setup...');
        setStatus('success');
        // Redirect to onboarding
        setTimeout(() => navigate('/onboarding'), 1500);
      } catch (err) {
        console.error('Auth callback error:', err);
        setMessage('Authentication failed: Unexpected error');
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="text-green-500 text-4xl mb-2">✅</div>
            )}
            {status === 'error' && (
              <div className="text-red-500 text-4xl mb-2">❌</div>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {status === 'loading' ? 'Processing...' : 
             status === 'success' ? 'Success!' : 'Error'}
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
