import { ProjectCard } from './ProjectCard';

const projects = [
  {
    title: 'MarChat',
    description: 'Revolutionary communication platform for modern teams. Experience seamless meetings, instant messaging, and collaborative workflows all in one place.',
    url: 'https://chat.mardev.app',
  },
  {
    title: 'MarOS',
    description: 'Lightning-fast operating system built for developers and power users. Experience unparalleled performance and intuitive design.',
    url: 'https://os.mardev.app',
  },
  {
    title: 'MarMail',
    description: 'Next-generation email client with AI-powered features, smart organization, and privacy-first design principles.',
    isComingSoon: true,
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the innovative solutions we're building to shape the future of technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              url={project.url}
              isComingSoon={project.isComingSoon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};