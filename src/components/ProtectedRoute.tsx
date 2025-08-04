import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, fallback, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, loading, isOnboardingComplete } = useAuth();

  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If onboarding is required and not complete, redirect to onboarding
  if (requireOnboarding && !isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}; 