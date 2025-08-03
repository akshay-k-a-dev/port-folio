import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Mail, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function Portfolio() {
  const portfolioData = useQuery(api.portfolio.get);

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const { name, tagline, about, skills, projects, experience, contact } =
    portfolioData;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <nav className="p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        <Link to="/">
          <Button variant="outline">Switch View</Button>
        </Link>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center my-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            {name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">{tagline}</p>
        </motion.section>

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="my-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-8">About Me</h2>
          <p className="text-muted-foreground leading-relaxed">{about}</p>
        </motion.section>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-8">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium"
              >
                {skill}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="my-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-8">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.name}>
                <CardHeader>
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="rounded-t-lg"
                    />
                  )}
                  <CardTitle className="pt-4">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <div
                        key={tech}
                        className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">View Project</Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-8">Experience</h2>
          <div className="relative border-l-2 border-muted">
            {experience.map((exp, index) => (
              <div key={index} className="mb-8 ml-4">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-background"></div>
                <p className="text-sm text-muted-foreground">{exp.year}</p>
                <h3 className="text-lg font-semibold">{exp.title}</h3>
                <p className="text-md font-medium text-muted-foreground">
                  {exp.company}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{exp.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="my-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Get In Touch
          </h2>
          <p className="text-muted-foreground mb-8">
            Feel free to reach out for collaborations or just a friendly chat.
          </p>
          <div className="flex justify-center gap-4">
            <a href={`mailto:${contact.email}`}>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </a>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
            </a>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </motion.section>
      </main>
    </div>
  );
}