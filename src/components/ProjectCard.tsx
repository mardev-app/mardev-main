import { ExternalLink, Clock } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  url?: string;
  isComingSoon?: boolean;
}

export const ProjectCard = ({ title, description, url, isComingSoon }: ProjectCardProps) => {
  const CardContent = () => (
    <div className="bg-gradient-glass backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-card hover:border-white/20 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        {isComingSoon ? (
          <Clock className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      
      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
      
      {isComingSoon && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
        </div>
      )}
    </div>
  );

  if (isComingSoon || !url) {
    return <CardContent />;
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block cursor-pointer"
    >
      <CardContent />
    </a>
  );
};