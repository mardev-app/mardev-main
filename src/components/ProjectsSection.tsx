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
            Check out the projects we're building for fun!
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
