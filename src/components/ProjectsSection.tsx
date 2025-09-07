import { ProjectCard } from './ProjectCard';

const projects = [
  {
    title: 'MarChat',
    description: 'A basic chatting platform in the works.',
    url: 'https://chat.mardev.app',
  },
  {
    title: 'MarOS',
    description: 'A very early beta operating system in the works.',
    url: 'https://os.mardev.app',
    isComingSoon: true,
  },
  {
    title: 'MarMail',
    description: 'An email client with a custom mailing protocol with extra privacy and speed in mind',
    url: 'https://mail.mardev.app',
    isComingSoon: true,
  },
  {
    title: 'Mar-16',
    description: 'Coming soon.. a brand new 16-bit OS.',
    url: 'https://mardev.app/#',
    isComingSoon: true,
  },
  {
    title: 'MarDev AI',
    description: 'Coming soon.. an all new code AI with options from Deepseek to Claude.',
    url: 'https://ai.mardev.app',
    isComingSoon: true,
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-20 px-6 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-slideInFromTop">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent animate-pulse">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fadeIn animation-delay-200">
            Check out the projects we're building for fun!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="animate-slideInFromBottom"
              style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
            >
              <ProjectCard
                title={project.title}
                description={project.description}
                url={project.url}
                isComingSoon={project.isComingSoon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
