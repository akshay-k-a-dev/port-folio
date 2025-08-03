import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { TypeAnimation } from "react-type-animation";
import MatrixRain from "@/components/MatrixRain";
import { Loader2 } from "lucide-react";

const HELP_MESSAGE = `Available commands:
  help      - Show this help message
  about     - Display information about me
  projects  - List my projects
  contact   - Show my contact information
  clear     - Clear the terminal screen
  ls        - List files and directories
  cd        - Change directory
  pwd       - Print working directory
  mkdir     - Create directory
  rm        - Remove files (disabled for safety!)
  cp        - Copy files
  mv        - Move/rename files
  cat       - Display file contents
  grep      - Search text patterns
  man       - Show manual for commands
  matrix    - Toggle matrix rain effect
  sl        - Choo choo!
  date      - Show current date and time
  exit      - Return to the main selection screen`;

const TRAIN_ASCII = `
   ____
  |[]|_n__n_I_c
  |____|-'____'-|
  (o) (o) (o) (o)
`;

const FAKE_FILES = [
  "resume.pdf",
  "projects/",
  "skills.txt",
  "contact.json",
  "README.md",
  "portfolio.js",
  ".hidden_secrets",
];

export default function Cli() {
  const portfolioData = useQuery(api.portfolio.get);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { type: "command" | "output"; text: string; raw?: boolean }[]
  >([]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [currentDir, setCurrentDir] = useState("/home/akshay");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!portfolioData) return;
    setHistory([
      {
        type: "output",
        text: `Welcome to Akshay's CLI Portfolio!\nType 'help' for a list of commands.`,
      },
    ]);
  }, [portfolioData]);

  const handleCommand = (commandStr: string) => {
    const [command, ...args] = commandStr.toLowerCase().trim().split(" ");
    let output = "";
    let raw = false;

    const newHistory = [
      ...history,
      { type: "command" as const, text: `> ${commandStr}` },
    ];

    switch (command) {
      case "help":
        output = HELP_MESSAGE;
        break;
      case "about":
        output = portfolioData?.about ?? "About section not found.";
        break;
      case "projects":
        output =
          portfolioData?.projects
            .map(
              (p) =>
                `\nProject: ${p.name}\nDescription: ${p.desc}\nURL: ${p.url}\nTech: ${p.tech.join(", ")}\n`,
            )
            .join("") ?? "No projects found.";
        break;
      case "contact":
        output = `Email: ${portfolioData?.contact.email}\nGithub: ${portfolioData?.contact.github}\nLinkedIn: ${portfolioData?.contact.linkedin}`;
        break;
      case "clear":
        setHistory([]);
        return;
      case "ls":
        if (args.includes("-l")) {
          output = `total 7
-rw-r--r-- 1 akshay akshay 2048 Dec 15 10:30 resume.pdf
drwxr-xr-x 2 akshay akshay 4096 Dec 15 09:15 projects/
-rw-r--r-- 1 akshay akshay  512 Dec 15 11:45 skills.txt
-rw-r--r-- 1 akshay akshay  256 Dec 15 08:20 contact.json
-rw-r--r-- 1 akshay akshay 1024 Dec 15 12:00 README.md
-rw-r--r-- 1 akshay akshay 3072 Dec 15 14:30 portfolio.js
-rw------- 1 akshay akshay   42 Dec 15 00:00 .hidden_secrets`;
          raw = true;
        } else {
          output = FAKE_FILES.join("  ");
        }
        break;
      case "cd":
        const targetDir = args[0] || "~";
        if (targetDir === "~" || targetDir === "/home/akshay") {
          setCurrentDir("/home/akshay");
          output = "";
        } else if (targetDir === "projects" || targetDir === "projects/") {
          setCurrentDir("/home/akshay/projects");
          output = "";
        } else if (targetDir === ".." && currentDir !== "/home/akshay") {
          setCurrentDir("/home/akshay");
          output = "";
        } else {
          output = `cd: ${targetDir}: No such file or directory`;
        }
        break;
      case "pwd":
        output = currentDir;
        break;
      case "mkdir":
        const dirName = args[0];
        if (!dirName) {
          output = "mkdir: missing operand";
        } else {
          output = `mkdir: created directory '${dirName}'`;
        }
        break;
      case "rm":
        if (args.includes("-rf") || args.includes("-r")) {
          output = `🚨 WHOA THERE! 🚨
rm -rf is DISABLED for your safety!
This isn't your server to destroy! 😅
Try 'help' for safer commands.`;
        } else {
          output = `rm: operation not permitted
(This is a demo portfolio, not a real filesystem!)`;
        }
        break;
      case "sudo":
        output = `🔐 Nice try, hacker! 🔐
sudo is disabled in this demo environment.
You're not getting root access that easily! 😎
This portfolio has trust issues.`;
        break;
      case "cp":
        const [source, dest] = args;
        if (!source || !dest) {
          output = "cp: missing file operand";
        } else {
          output = `cp: copied '${source}' to '${dest}'`;
        }
        break;
      case "mv":
        const [mvSource, mvDest] = args;
        if (!mvSource || !mvDest) {
          output = "mv: missing file operand";
        } else {
          output = `mv: moved '${mvSource}' to '${mvDest}'`;
        }
        break;
      case "cat":
        const fileName = args[0];
        if (!fileName) {
          output = "cat: missing file operand";
        } else if (fileName === "resume.pdf") {
          output = "cat: resume.pdf: cannot display binary file";
        } else if (fileName === "skills.txt") {
          output = portfolioData?.skills.join("\n") ?? "Skills not found.";
        } else if (fileName === "contact.json") {
          output = JSON.stringify(portfolioData?.contact, null, 2) ?? "{}";
        } else if (fileName === "README.md") {
          output = `# Akshay's Portfolio

Welcome to my interactive portfolio!

## Available Views:
- CLI Terminal (you are here!)
- Modern Portfolio

Type 'help' for available commands.`;
        } else if (fileName === ".hidden_secrets") {
          output = `🤫 SECRET UNLOCKED! 🤫
You found the hidden file!
Here's a secret: I love building cool stuff! ✨`;
        } else {
          output = `cat: ${fileName}: No such file or directory`;
        }
        break;
      case "grep":
        const pattern = args[0];
        const grepFile = args[1];
        if (!pattern) {
          output = "grep: missing pattern";
        } else if (!grepFile) {
          output = "grep: missing file operand";
        } else {
          output = `grep: searching for '${pattern}' in ${grepFile}...
(This is a demo - no actual search performed)`;
        }
        break;
      case "man":
        const manCommand = args[0];
        if (!manCommand) {
          output = "man: missing command";
        } else {
          output = `Manual page for ${manCommand}:

NAME
    ${manCommand} - command line utility

DESCRIPTION
    This is a demo portfolio terminal.
    For real documentation, try the actual command!
    
    Type 'help' to see available portfolio commands.`;
        }
        break;
      case "matrix":
        setIsMatrixActive(!isMatrixActive);
        output = `Matrix effect ${!isMatrixActive ? "activated" : "deactivated"}.`;
        break;
      case "sl":
        output = TRAIN_ASCII;
        raw = true;
        break;
      case "date":
        output = new Date().toString();
        break;
      case "exit":
        output = "Redirecting...";
        window.location.href = "/";
        break;
      case "":
        setHistory(newHistory);
        return;
      default:
        output = `Command not found: ${command}. Type 'help' for a list of commands.`;
    }

    setHistory([...newHistory, { type: "output", text: output, raw }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div
      className="bg-black text-green-400 min-h-screen font-mono p-4 relative"
      onClick={() => inputRef.current?.focus()}
    >
      {isMatrixActive && <MatrixRain />}
      <div
        ref={terminalRef}
        className="w-full h-full overflow-y-auto z-10 relative"
      >
        <div className="mb-4">
          <Link to="/" className="text-blue-400 hover:underline">
            [Switch View]
          </Link>
        </div>
        {history.map((item, index) => (
          <div key={index}>
            {item.type === "command" ? (
              <p>{item.text}</p>
            ) : item.raw ? (
              <pre className="whitespace-pre-wrap">{item.text}</pre>
            ) : (
              <TypeAnimation
                sequence={[item.text]}
                wrapper="div"
                speed={80}
                cursor={false}
                className="whitespace-pre-wrap"
              />
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="mr-2">{currentDir} &gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent border-none text-green-400 focus:outline-none w-full"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}