import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail?: string;
}

export const AuthStatus = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Cookie utility functions
  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  const checkAuthStatus = () => {
    const possibleCookieNames = [
      'openauth.session',
      'session',
      'auth',
      'authorization',
      'token',
      'mardev_auth'
    ];

    let authCookie = null;
    for (const name of possibleCookieNames) {
      const cookie = getCookie(name);
      if (cookie) {
        authCookie = cookie;
        break;
      }
    }

    setAuth({
      isAuthenticated: !!authCookie,
      isLoading: false,
      userEmail: authCookie ? 'user@mardev.app' : undefined,
    });
  };

  const login = () => {
    window.location.href = 'https://auth.mardev.app/authorize?client_id=mardev-app-client&response_type=code&redirect_uri=https://mardev.app/auth/callback';
  };

  const logout = () => {
    // Clear cookies
    deleteCookie('mardev_auth');
    deleteCookie('mardev_refresh');
    
    // Redirect to auth server logout
    window.location.href = 'https://auth.mardev.app/logout?redirect_uri=' + encodeURIComponent(window.location.origin);
  };

  useEffect(() => {
    // Handle OAuth callback if present
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setAuth({ isAuthenticated: false, isLoading: false });
      return;
    }

    if (code) {
      // In a real implementation, you'd exchange the code for a token
      // For now, we'll just mark as authenticated
      setAuth({ isAuthenticated: true, isLoading: false });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    checkAuthStatus();
  }, []);

  if (auth.isLoading) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-gradient-glass backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
          <span className="text-sm text-muted-foreground">Checking auth...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {auth.isAuthenticated ? (
        <>
          <div className="bg-gradient-glass backdrop-blur-md border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
            <User className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Welcome back!</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={logout}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </>
      ) : (
        <Button variant="default" size="sm" onClick={login}>
          Login
        </Button>
      )}
    </div>
  );
};