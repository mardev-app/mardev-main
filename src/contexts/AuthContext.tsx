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

  // Test Supabase connection with better error handling
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing Supabase connection...');
      
      // Try a simple query that should work if Supabase is available
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .limit(1);
      
      if (error) {
        // Only consider it a connection failure for specific error types
        if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.message?.includes('fetch')) {
          console.error('Supabase connection test failed:', error);
          return false;
        }
        // For other errors (like table not found), consider it connected
        console.log('Supabase connected but table query failed:', error);
        return true;
      }
      
      console.log('Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth system...');
        
        // First try to get the session directly
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          // Don't go offline immediately, try connection test
        }

        // Test Supabase connection
        const isConnected = await testSupabaseConnection();
        
        if (!isConnected) {
          console.log('Supabase not available, switching to offline mode');
          setIsOfflineMode(true);
          setLoading(false);
          return;
        }

        // If connected, proceed with normal auth
        console.log('Supabase connected, proceeding with normal auth');
        setIsOfflineMode(false);
        
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
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        // Only go offline for network/connection errors
        if (error instanceof TypeError || error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
            setIsOfflineMode(true);
          }
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

    // Add timeout to prevent infinite loading, but make it longer
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization timeout, but continuing in online mode');
      setLoading(false);
    }, 10000); // 10 second timeout, but don't force offline mode

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    if (isOfflineMode) return false;
    
    try {
      console.log('Checking onboarding status for user:', userId);
      
      // First check user metadata for quick access
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User metadata onboarding_complete:', user?.user_metadata?.onboarding_complete);
      
      if (user?.user_metadata?.onboarding_complete) {
        console.log('Onboarding complete found in user metadata');
        return true;
      }

      // Then check the database
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
      return isComplete;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  const signIn = async (provider: 'google' | 'github' | 'discord') => {
    if (isOfflineMode) {
      alert('Authentication is currently unavailable. Please try again later.');
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
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      // Reload the page after successful sign out
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
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