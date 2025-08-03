import { internalMutation } from "../_generated/server";

export const seedPortfolio = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingData = await ctx.db.query("portfolio").first();
    if (existingData) {
      console.log("Portfolio data already exists. Skipping seed.");
      return { status: "skipped" };
    }

    await ctx.db.insert("portfolio", {
      name: "Akshay",
      tagline:
        "Full-stack developer passionate about open-source and creative projects.",
      about:
        "I'm a software engineer with a passion for building beautiful and functional web applications. I have experience with the full stack, from crafting user interfaces with React and TypeScript to building scalable backends with Node.js and Convex. I'm always looking for new challenges and opportunities to learn.",
      skills: [
        "TypeScript",
        "React",
        "Node.js",
        "Convex",
        "TailwindCSS",
        "Figma",
        "Next.js",
        "Python",
      ],
      projects: [
        {
          name: "Project One",
          desc: "A very cool project that does amazing things. Built with the latest technologies to solve a real-world problem.",
          url: "https://github.com",
          tech: ["React", "Convex", "TailwindCSS"],
          image: "https://picsum.photos/seed/project1/400/300",
        },
        {
          name: "Project Two",
          desc: "Another awesome project that showcases my skills in backend development and system design.",
          url: "https://github.com",
          tech: ["Node.js", "TypeScript", "PostgreSQL"],
          image: "https://picsum.photos/seed/project2/400/300",
        },
        {
          name: "Project Three",
          desc: "A mobile app that helps you stay organized and productive. Available on both iOS and Android.",
          url: "https://github.com",
          tech: ["React Native", "Firebase"],
          image: "https://picsum.photos/seed/project3/400/300",
        },
      ],
      experience: [
        {
          year: "2023-Present",
          title: "Software Engineer",
          company: "Tech Giant Inc.",
          desc: "Working on the core infrastructure team, improving performance and reliability of the main product.",
        },
        {
          year: "2021-2023",
          title: "Junior Developer",
          company: "Startup Co.",
          desc: "Helped build the company's first product from scratch. Wore many hats and learned a ton.",
        },
      ],
      contact: {
        email: "akshay@example.com",
        github: "https://github.com",
        linkedin: "https://linkedin.com/in/",
      },
    });
    console.log("Portfolio data seeded.");
    return { status: "seeded" };
  },
});
