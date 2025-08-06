import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AuthStatus } from './components/AuthStatus';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingForm } from './components/OnboardingForm';
import { Settings } from './components/Settings';
import AuthCallback from './pages/auth/callback';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="w-screen h-screen bg-gradient-background">
            <AuthStatus />
            
            <Routes>
              <Route path="/" element={
                <div className="w-full h-full">
                  <Hero />
                  <ProjectsSection />
                  <Footer />
                </div>
              } />
              
              <Route path="/onboarding" element={<OnboardingForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="w-screen h-screen bg-gradient-background">
                    <div className="container mx-auto py-8">
                      <Settings />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <div className="w-screen h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-white mb-4">Chat App</h1>
                      <p className="text-white/70">Chat functionality coming soon!</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={
                <div className="w-screen h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                    <p className="text-white/70">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
