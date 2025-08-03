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

export default function Cli() {
  const portfolioData = useQuery(api.portfolio.get);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { type: "command" | "output"; text: string; raw?: boolean }[]
  >([]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
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
    const [command, ..._args] = commandStr.toLowerCase().trim().split(" ");
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
                `\nProject: ${p.name}\nDescription: ${p.desc}\nURL: ${p.url}\n`,
            )
            .join("") ?? "No projects found.";
        break;
      case "contact":
        output = `Email: ${portfolioData?.contact.email}\nGithub: ${portfolioData?.contact.github}\nLinkedIn: ${portfolioData?.contact.linkedin}`;
        break;
      case "clear":
        setHistory([]);
        return;
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
        // This will be handled by the Link component, but good to have.
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
          <span className="mr-2">&gt;</span>
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