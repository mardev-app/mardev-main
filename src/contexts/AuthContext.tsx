import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (provider: 'google' | 'github' | 'discord') => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
  getUserDisplayName: () => string | null;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return null;
  };

  // Helper function to get user's name from various sources
  const getUserDisplayName = (): string | null => {
    // First check cookies (most recent/reliable)
    const cookieName = getCookie('mardev_user_name');
    if (cookieName) return cookieName;
    
    // Then check localStorage
    const localName = localStorage.getItem('mardev_user_name');
    if (localName) return localName;
    
    // Then check user metadata
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth system...');
        setIsOfflineMode(false); // Start in online mode
        
        // Get the session directly - this is more reliable than connection testing
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          // Only go offline for network errors, not auth errors
          if (sessionError.message?.includes('fetch') || sessionError.message?.includes('network')) {
            console.log('Network error detected, switching to offline mode');
            setIsOfflineMode(true);
            setLoading(false);
            return;
          }
        }
        
        console.log('Session result:', session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const onboardingComplete = await checkOnboardingStatus(session.user.id);
            setIsOnboardingComplete(onboardingComplete);
          } catch (error) {
            console.error('Error checking onboarding:', error);
            setIsOnboardingComplete(false);
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error in initializeAuth:', error);
        
        // Only go offline for network/connection errors
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('timeout')) {
          console.log('Network error in auth init, switching to offline mode');
          setIsOfflineMode(true);
        }
        
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      console.log('Session user metadata:', session?.user?.user_metadata);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const onboardingComplete = await checkOnboardingStatus(session.user.id);
          console.log('Setting onboarding complete to:', onboardingComplete);
          setIsOnboardingComplete(onboardingComplete);
        } catch (error) {
          console.error('Error checking onboarding:', error);
          setIsOnboardingComplete(false);
        }
      } else {
        setIsOnboardingComplete(false);
      }
    });

    // Shorter timeout to prevent long loading states
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization timeout, continuing...');
      setLoading(false);
    }, 5000); // Reduced from 10 seconds to 5 seconds

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    if (isOfflineMode) {
      // In offline mode, check local storage and cookies only
      const cookieComplete = getCookie('mardev_onboarding_complete');
      const localComplete = localStorage.getItem('mardev_onboarding_complete');
      console.log('Offline mode - Cookie:', cookieComplete, 'localStorage:', localComplete);
      return cookieComplete === 'true' || localComplete === 'true';
    }
    
    try {
      console.log('Checking onboarding status for user:', userId);
      
      // First check cookies for quick access
      const cookieComplete = getCookie('mardev_onboarding_complete');
      console.log('Cookie onboarding_complete:', cookieComplete);
      
      if (cookieComplete === 'true') {
        console.log('Onboarding complete found in cookies');
        return true;
      }
      
      // Also check localStorage
      const localComplete = localStorage.getItem('mardev_onboarding_complete');
      console.log('localStorage onboarding_complete:', localComplete);
      
      if (localComplete === 'true') {
        console.log('Onboarding complete found in localStorage');
        // Update cookie to match localStorage
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const expires = `expires=${expiryDate.toUTCString()}`;
        document.cookie = `mardev_onboarding_complete=true; ${expires}; path=/; SameSite=Strict`;
        return true;
      }
      
      // Then check user metadata for quick access
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User metadata onboarding_complete:', user?.user_metadata?.onboarding_complete);
      
      if (user?.user_metadata?.onboarding_complete) {
        console.log('Onboarding complete found in user metadata');
        // Update local storage and cookies to match metadata
        localStorage.setItem('mardev_onboarding_complete', 'true');
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const expires = `expires=${expiryDate.toUTCString()}`;
        document.cookie = `mardev_onboarding_complete=true; ${expires}; path=/; SameSite=Strict`;
        return true;
      }

      // Finally check the database
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('is_complete')
        .eq('user_id', userId)
        .single();

      console.log('Database onboarding check result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        return false;
      }

      const isComplete = data?.is_complete || false;
      console.log('Final onboarding status:', isComplete);
      
      // If database says complete, update cookies and localStorage
      if (isComplete) {
        localStorage.setItem('mardev_onboarding_complete', 'true');
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const expires = `expires=${expiryDate.toUTCString()}`;
        document.cookie = `mardev_onboarding_complete=true; ${expires}; path=/; SameSite=Strict`;
      }
      
      return isComplete;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // As fallback, check local storage and cookies even on error
      const cookieComplete = getCookie('mardev_onboarding_complete');
      const localComplete = localStorage.getItem('mardev_onboarding_complete');
      console.log('Error fallback - Cookie:', cookieComplete, 'localStorage:', localComplete);
      return cookieComplete === 'true' || localComplete === 'true';
    }
  };

  const signIn = async (provider: 'google' | 'github' | 'discord') => {
    console.log('SignIn called with provider:', provider, 'isOfflineMode:', isOfflineMode);
    
    if (isOfflineMode) {
      alert('Authentication is currently unavailable. Please check your internet connection and try again.');
      return;
    }

    try {
      console.log('Signing in with provider:', provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // If it's a network error, switch to offline mode
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setIsOfflineMode(true);
          alert('Network error. Please check your internet connection.');
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('provider is not enabled')) {
        alert('This sign-in method is not configured yet. Please contact support.');
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        alert('Network error. Please check your internet connection and try again.');
        setIsOfflineMode(true);
      } else {
        alert('Authentication failed. Please try again.');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    console.log('SignOut function called, isOfflineMode:', isOfflineMode);
    
    // Don't clear onboarding data on sign out - this should persist across sessions
    // Only clear session-specific data if needed
    
    if (isOfflineMode) {
      // Clear local state in offline mode
      setUser(null);
      setSession(null);
      setIsOnboardingComplete(false);
      // Reload the page after clearing state
      window.location.reload();
      return;
    }

    try {
      console.log('Signing out...');
      
      // Clear local state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setIsOnboardingComplete(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Still reload even on error to ensure clean state
      }
      
      // Reload the page after successful sign out
      console.log('Sign out successful, reloading page');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even on error
      window.location.reload();
    }
  };

  const refreshSession = async () => {
    if (isOfflineMode) return;

    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Refresh session error:', error);
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  };

  const refreshOnboardingStatus = async () => {
    if (isOfflineMode || !user) return;

    try {
      console.log('Refreshing onboarding status...');
      const onboardingComplete = await checkOnboardingStatus(user.id);
      setIsOnboardingComplete(onboardingComplete);
    } catch (error) {
      console.error('Error refreshing onboarding status:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    refreshSession,
    refreshOnboardingStatus,
    getUserDisplayName,
    isOnboardingComplete,
    setOnboardingComplete: setIsOnboardingComplete,
    isOfflineMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 