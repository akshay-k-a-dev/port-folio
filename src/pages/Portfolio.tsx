import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code, 
  Sparkles, 
  Briefcase,
  ArrowRight,
  Download,
  ChevronDown,
  Calendar,
  Star,
  Heart,
  Zap,
  Rocket,
  Coffee,
  Loader2
} from "lucide-react";

export default function Portfolio() {
  const portfolioData = useQuery(api.portfolio.get);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Enhanced scroll progress tracking
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setScrollProgress(latest);
      
      // Update active section based on scroll
      if (latest < 0.2) setActiveSection("hero");
      else if (latest < 0.4) setActiveSection("about");
      else if (latest < 0.6) setActiveSection("skills");
      else if (latest < 0.8) setActiveSection("projects");
      else setActiveSection("contact");
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Mouse tracking for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-4 text-white"
        >
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="text-2xl font-bold">Loading Portfolio...</span>
        </motion.div>
      </div>
    );
  }

  // Custom cursor variants
  const cursorVariants = {
    default: {
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      height: 16,
      width: 16,
      backgroundColor: "rgba(168, 85, 247, 0.7)",
      mixBlendMode: "screen" as const
    },
    link: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(255, 255, 255, 1)",
      mixBlendMode: "difference" as const
    },
  };

  const linkEnter = () => setCursorVariant("link");
  const linkLeave = () => setCursorVariant("default");

  const toggleProjectLike = (projectName: string) => {
    setLikedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-x-hidden cursor-none">
      <motion.div
        className="fixed top-0 left-0 rounded-full z-[9999] pointer-events-none"
        variants={cursorVariants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 origin-left"
        style={{ scaleX: scrollProgress }}
      />
      
      <div className="fixed inset-0 z-0">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"
          style={{ y: backgroundY }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
          }}
        />
        
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)],
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [null, Math.random() * 0.8 + 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute border border-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 0,
            }}
            animate={{
              rotate: 360,
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            onMouseEnter={linkEnter} onMouseLeave={linkLeave}
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            {portfolioData?.name}
          </motion.div>
          <div className="flex items-center gap-6">
            {["About", "Skills", "Projects", "Experience", "Contact"].map((item) => (
              <motion.a
                onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ scale: 1.1, y: -2 }}
                className={`transition-all duration-300 ${
                  activeSection === item.toLowerCase() 
                    ? 'text-blue-400 font-semibold' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item}
                {activeSection === item.toLowerCase() && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                  />
                )}
              </motion.a>
            ))}
            <Link
              to="/"
              onMouseEnter={linkEnter} onMouseLeave={linkLeave}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Switch View
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      <section id="hero" className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6"
              style={{ y: textY }}
            >
              <motion.span
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                {portfolioData?.name}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-3xl text-white/80 mb-8 font-light"
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {portfolioData?.tagline}
              </motion.span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <motion.button
                onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  y: -5
                }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold flex items-center gap-2 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <Download className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10">Download Resume</span>
              </motion.button>
              
              <motion.button
                onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 border border-white/30 rounded-full text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="relative z-10"
                >
                  <Mail className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10">Get In Touch</span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center gap-6"
            >
              {[
                { icon: Github, href: portfolioData?.contact.github, label: "GitHub", color: "from-gray-500 to-gray-700" },
                { icon: Linkedin, href: portfolioData?.contact.linkedin, label: "LinkedIn", color: "from-blue-500 to-blue-700" },
                { icon: Mail, href: `mailto:${portfolioData?.contact.email}`, label: "Email", color: "from-red-500 to-red-700" },
              ].map(({ icon: Icon, href, label, color }) => (
                <motion.a
                  onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`group p-3 bg-gradient-to-r ${color} rounded-full backdrop-blur-sm transition-all relative overflow-hidden`}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <Icon className="w-6 h-6 relative z-10" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-white/60"
            >
              <span className="text-sm">Scroll to explore</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="projects" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
              whileInView={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              Featured Projects
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"
              whileInView={{ scaleX: [0, 1] }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioData?.projects.map((project, index) => (
              <motion.div
                onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                key={project.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, rotateY: 5 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => toggleProjectLike(project.name)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full transition-colors ${
                          likedProjects.has(project.name) 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-white/10 text-white/60 hover:text-red-400'
                        }`}
                      >
                        <motion.div
                          animate={likedProjects.has(project.name) ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className={`w-5 h-5 ${likedProjects.has(project.name) ? 'fill-current' : ''}`} />
                        </motion.div>
                      </motion.button>

                      <motion.a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>

                  <motion.h3 
                    className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {project.name}
                  </motion.h3>
                  
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {project.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: techIndex * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20 hover:border-blue-400/50 transition-colors"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors"
                  >
                    View Project 
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="ml-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
          >
            <p className="text-xl leading-relaxed text-white/80">
              {portfolioData.about}
            </p>
          </motion.div>
        </div>
      </section>

      <section id="skills" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skills & Technologies
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, index) => (
              <motion.div
                onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                key={skill}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Code className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {skill}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full" />
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

            {portfolioData.experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex items-start gap-8 mb-12"
              >
                <motion.div
                  onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                  whileHover={{ scale: 1.2 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </motion.div>

                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{exp.year}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{exp.title}</h3>
                  <h4 className="text-xl text-purple-400 mb-4">{exp.company}</h4>
                  <p className="text-white/70 leading-relaxed">{exp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Let's Work Together
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full mb-8" />
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Ready to bring your ideas to life? Let's create something amazing together!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Mail, label: "Email", value: portfolioData.contact.email, href: `mailto:${portfolioData.contact.email}` },
                { icon: Github, label: "GitHub", value: "View Profile", href: portfolioData.contact.github },
                { icon: Linkedin, label: "LinkedIn", value: "Connect", href: portfolioData.contact.linkedin },
              ].map(({ icon: Icon, label, value, href }) => (
                <motion.a
                  onMouseEnter={linkEnter} onMouseLeave={linkLeave}
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="font-semibold text-white mb-1">{label}</h3>
                    <p className="text-white/70 group-hover:text-white transition-colors">{value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="text-white/60">Built with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-red-400 fill-current" />
            </motion.div>
            <span className="text-white/60">and lots of</span>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coffee className="w-5 h-5 text-yellow-600" />
            </motion.div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/60"
          >
            © 2024 {portfolioData?.name}. 
            <motion.span
              whileHover={{ color: "#3b82f6" }}
              className="cursor-pointer transition-colors"
            >
              {" "}Ready to launch! 🚀
            </motion.span>
          </motion.p>
        </div>
      </footer>
    </div>
  );
}