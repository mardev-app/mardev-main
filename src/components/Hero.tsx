import { Button } from '@/components/ui/button';
import { ArrowDown, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/20 animate-pulse"></div>
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-primary-glow/40 rounded-full blur-2xl animate-pulse"></div>
      
      <div className="relative z-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              MarDev
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            A website for everything MarDev makes, all in one cool website - there apps, tools to even custom mailing protocols!
            Just a cool website for MarDev Projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            variant="default" 
            size="lg" 
            onClick={scrollToProjects}
            className="w-full sm:w-auto"
          >
            <ArrowDown className="w-5 h-5" />
            Explore Projects
          </Button>
          
          <Link to="/chat" className="w-full sm:w-auto">
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full"
            >
              <MessageCircle className="w-5 h-5" />
              Join Chat
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={scrollToContact}
            className="w-full sm:w-auto"
          >
            <Mail className="w-5 h-5" />
            Get in Touch
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="animate-bounce">
          <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />
        </div>
      </div>
    </section>
  );
};
