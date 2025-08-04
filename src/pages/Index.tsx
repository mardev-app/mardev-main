import { AuthStatus } from '@/components/AuthStatus';
import { Hero } from '@/components/Hero';
import { ProjectsSection } from '@/components/ProjectsSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background font-inter">
      <AuthStatus />
      <Hero />
      <ProjectsSection />
      <Footer />
    </div>
  );
};

export default Index;
