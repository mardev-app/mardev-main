import { Github, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="py-16 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MarDev
            </h3>
            <p className="text-muted-foreground">
              Building the future, one project at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="https://chat.mardev.app" className="text-muted-foreground hover:text-primary transition-colors">
                  MarChat
                </a>
              </li>
              <li>
                <a href="https://os.mardev.app" className="text-muted-foreground hover:text-primary transition-colors">
                  MarOS
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Connect</h4>
            <div className="flex space-x-4">
              <a 
                href="mailto:hello@mardev.app" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all hover:scale-105"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://github.com/mardev" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all hover:scale-105"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://twitter.com/mardev" 
                className="p-2 bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all hover:scale-105"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MarDev Team • Built with React, TypeScript, and passion.
            </p>
            <p className="text-sm text-muted-foreground">
              Crafted with ❤️ for the developer community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};