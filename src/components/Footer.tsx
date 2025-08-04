import { Github, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="py-16 px-6 border-t border-border/50 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-5 right-1/4 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-5 left-1/4 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse">
              MarDev
            </h3>
            <p className="text-muted-foreground">
              Building the future, one project at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 animate-fadeIn animation-delay-200">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#projects" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                  Projects
                </a>
              </li>
              <li>
                <a href="https://chat.mardev.app" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                  MarChat
                </a>
              </li>
              <li>
                <a href="https://os.mardev.app" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                  MarOS
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 animate-fadeIn animation-delay-400">
            <h4 className="text-lg font-semibold text-foreground">Connect</h4>
            <div className="flex space-x-4">
              <a 
                href="mailto:hello@mardev.app" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300 hover:scale-110 hover:rotate-3 transform"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-300" />
              </a>
              <a 
                href="https://github.com/mardev-app" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300 hover:scale-110 hover:rotate-3 transform"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-300" />
              </a>
              <a 
                href="https://twitter.com/mardev-app" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300 hover:scale-110 hover:rotate-3 transform"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/50 animate-fadeIn animation-delay-400">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MarDev Team • Built with React, TypeScript, and passion.
            </p>
            <p className="text-sm text-muted-foreground">
              Crafted with <span className="text-red-500 animate-pulse">❤️</span> for the developer community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};