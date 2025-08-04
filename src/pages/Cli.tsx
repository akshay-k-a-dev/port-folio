import { useState, useEffect, useRef } from "react";
import portfolioData from "@/data/portfolio.json";
import { Link } from "react-router";
import { TypeAnimation } from "react-type-animation";
import MatrixRain from "@/components/MatrixRain";
import { Loader2, Smartphone, Keyboard, Terminal, Zap } from "lucide-react";

const HELP_MESSAGE = `🚀 Akshay's Interactive Terminal - Help Menu 🚀

[Core Commands]
  about     - Display information about me
  projects  - List my projects
  skills    - List my technical skills
  contact   - Show my contact information
  clear     - Clear the terminal screen
  exit      - Return to the main selection screen

[File System Simulation]
  ls [path] - List files and directories
  cd [dir]  - Change directory
  pwd       - Print working directory
  cat [file]- Display file contents
  mkdir [dir]- Create a directory (simulated)
  cp [s] [d] - Copy a file (simulated)
  mv [s] [d] - Move a file (simulated)
  grep      - Search text patterns (simulated)
  man [cmd] - Show manual for a command

[Fun & Easter Eggs]
  matrix    - Toggle the matrix rain effect
  sl        - Choo choo! An animated train
  cowsay    - Make a cow say something
  fortune   - Get a random fortune cookie
  neofetch  - Display system info with ASCII art
  history   - Show your command history

[System & Info]
  whoami    - Who are you?
  uptime    - Show portfolio uptime
  ps        - Show running processes (simulated)
  date      - Show current date and time
  help      - Show this help message

[Restricted]
  rm, sudo  - These commands are disabled for safety!`;

const ANIMATED_TRAIN = [
  `                                 (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O
                            (@@@)
                        (    )
                      (@@@@)
                   (   )

                ====        ________                ___________
            _D _|  |_______/        \\__I_I_____===__|_________|
             |(_)---  |   H\\________/ |   |        =|___ ___|      _________________
             /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A
            |      |  |   H  |__--------------------| [___] |   =|                        |
            | ________|___H__/__|_____/[][]~\\_______|       |   -|                        |
            |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_
          __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
           |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
            \\_/      \\O=====O=====O=====O_/      \\_/               \\_/   \\_/    \\_/   \\_/`,
  
  `                                                      (@@) (  ) (@)  ( )  @@    O     @     O     @      O
                                                 (@@@@)
                                             (    )
                                           (@@@@)
                                        (   )

                                     ====        ________                ___________
                                 _D _|  |_______/        \\__I_I_____===__|_________|
                                  |(_)---  |   H\\________/ |   |        =|___ ___|      _________________
                                  /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A
                                 |      |  |   H  |__--------------------| [___] |   =|                        |
                                 | ________|___H__/__|_____/[][]~\\_______|       |   -|                        |
                                 |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_
                               __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
                                |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
                                 \\_/      \\O=====O=====O=====O_/      \\_/               \\_/   \\_/    \\_/   \\_/`,
];

const COW_ASCII = `
 _____________________
< Moo! Welcome to CLI >
 ---------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;

const FAKE_FILES = [
  "resume.pdf",
  "projects/",
  "skills.txt",
  "contact.json",
  "README.md",
  "portfolio.js",
  ".hidden_secrets",
  ".bashrc",
  ".vimrc",
];

const FORTUNES = [
  "The best way to predict the future is to invent it. - Alan Kay",
  "Code is like humor. When you have to explain it, it's bad. - Cory House",
  "First, solve the problem. Then, write the code. - John Johnson",
  "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
  "In order to be irreplaceable, one must always be different. - Coco Chanel",
  "Java is to JavaScript what car is to Carpet. - Chris Heilmann",
  "Knowledge is power. - Francis Bacon",
  "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code. - Dan Salomon",
];

const FAKE_PROCESSES = [
  "  PID TTY          TIME CMD",
  " 1337 pts/0    00:00:01 portfolio",
  " 1338 pts/0    00:00:00 node",
  " 1339 pts/0    00:00:02 react-dev",
  " 1340 pts/0    00:00:00 vite",
  " 1341 pts/0    00:00:01 typescript",
  " 1342 pts/0    00:00:00 bash",
];

export default function Cli() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { type: "command" | "output" | "error" | "success"; text: string; raw?: boolean }[]
  >([]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [currentDir, setCurrentDir] = useState("/home/akshay");
  const [isTrainAnimating, setIsTrainAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Command suggestions
  const availableCommands = ['help', 'about', 'projects', 'skills', 'contact', 'clear', 'ls', 'cd', 'pwd', 'mkdir', 'cat', 'grep', 'man', 'matrix', 'sl', 'cowsay', 'fortune', 'whoami', 'uptime', 'ps', 'date', 'exit', 'neofetch', 'history'];

  useEffect(() => {
    if (input) {
      const suggestions = availableCommands.filter(cmd => 
        cmd.toLowerCase().startsWith(input.toLowerCase())
      ).slice(0, 3);
      setCommandSuggestions(suggestions);
    } else {
      setCommandSuggestions([]);
    }
  }, [input]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    setHistory([
      {
        type: "success",
        text: `🚀 Welcome to Akshay's Interactive Terminal! 🚀
System initialized successfully...
Type 'help' for available commands or 'fortune' for wisdom!`,
      },
    ]);
  }, []);

  const animateTrain = async () => {
    setIsTrainAnimating(true);
    
    for (let i = 0; i < ANIMATED_TRAIN.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHistory(prev => [
        ...prev.slice(0, -1),
        { type: "output", text: ANIMATED_TRAIN[i], raw: true }
      ]);
    }
    
    setTimeout(() => {
      setHistory(prev => [
        ...prev,
        { type: "success", text: "🚂 CHOO CHOO! The train has departed! 🚂" }
      ]);
      setIsTrainAnimating(false);
    }, 1000);
  };

  const handleCommand = async (commandStr: string) => {
    const [command, ...args] = commandStr.toLowerCase().trim().split(" ");
    let output = "";
    let type: "output" | "error" | "success" = "output";
    let raw = false;

    const newHistory = [
      ...history,
      { type: "command" as const, text: `${currentDir.split('/').pop()}@portfolio:${currentDir}$ ${commandStr}` },
    ];

    switch (command) {
      case "about":
        output = `📋 ABOUT AKSHAY 📋\n\n${portfolioData.about}`;
        type = "success";
        break;
      case "projects":
        output = `🚀 MY AWESOME PROJECTS 🚀\n\n` +
          portfolioData.projects
            .map(
              (p, i) =>
                `[${i + 1}] ${p.name}\n    📝 ${p.desc}\n    🔗 ${p.url}\n    🛠️  Tech: ${p.tech.join(", ")}\n`,
            )
            .join("\n");
        type = "success";
        break;
      case "contact":
        output = `📞 GET IN TOUCH 📞\n\n📧 Email: ${portfolioData.contact.email}\n🐙 Github: ${portfolioData.contact.github}\n💼 LinkedIn: ${portfolioData.contact.linkedin}`;
        type = "success";
        break;
      case "skills":
        output = `🛠️ MY TECHNICAL SKILLS 🛠️\n\n• ${portfolioData.skills.join("\n• ")}`;
        type = "success";
        break;
      case "clear":
        setHistory([]);
        return;
      case "ls":
        if (args.includes("-l")) {
          output = `total 42
drwxr-xr-x 2 akshay akshay 4096 Dec 15 10:30 📁 projects/
-rw-r--r-- 1 akshay akshay 2048 Dec 15 10:30 📄 resume.pdf
-rw-r--r-- 1 akshay akshay  512 Dec 15 11:45 📝 skills.txt
-rw-r--r-- 1 akshay akshay  256 Dec 15 08:20 📋 contact.json
-rw-r--r-- 1 akshay akshay 1024 Dec 15 12:00 📖 README.md
-rw-r--r-- 1 akshay akshay 3072 Dec 15 14:30 ⚡ portfolio.js
-rw------- 1 akshay akshay   42 Dec 15 00:00 🔒 .hidden_secrets
-rw-r--r-- 1 akshay akshay  128 Dec 15 09:00 ⚙️  .bashrc
-rw-r--r-- 1 akshay akshay   64 Dec 15 09:00 📝 .vimrc`;
          raw = true;
          type = "success";
        } else {
          output = `📁 projects/     📄 resume.pdf      📝 skills.txt
📋 contact.json  📖 README.md       ⚡ portfolio.js
🔒 .hidden_secrets  ⚙️ .bashrc     📝 .vimrc`;
          type = "success";
        }
        break;
      case "cd":
        const targetDir = args[0] || "~";
        if (targetDir === "~" || targetDir === "/home/akshay") {
          setCurrentDir("/home/akshay");
          output = "🏠 Welcome home!";
          type = "success";
        } else if (targetDir === "projects" || targetDir === "projects/") {
          setCurrentDir("/home/akshay/projects");
          output = "📁 Entered projects directory";
          type = "success";
        } else if (targetDir === ".." && currentDir !== "/home/akshay") {
          setCurrentDir("/home/akshay");
          output = "⬆️ Moved up one directory";
          type = "success";
        } else {
          output = `❌ cd: ${targetDir}: No such file or directory`;
          type = "error";
        }
        break;
      case "pwd":
        output = `📍 Current location: ${currentDir}`;
        type = "success";
        break;
      case "mkdir":
        const dirName = args[0];
        if (!dirName) {
          output = "❌ mkdir: missing operand";
          type = "error";
        } else {
          output = `✅ mkdir: created directory '${dirName}' 📁`;
          type = "success";
        }
        break;
      case "rm":
        if (args.includes("-rf") || args.includes("-r")) {
          output = `🚨🚨🚨 DANGER WILL ROBINSON! 🚨🚨🚨
💥 rm -rf DETECTED! SHIELDS UP! 💥
🛡️ This command has been BLOCKED! 🛡️
🤖 I'm not letting you nuke my portfolio! 
😅 Nice try though, you sneaky hacker!
🔒 Security level: MAXIMUM PARANOIA`;
          type = "error";
        } else {
          output = `🚫 rm: operation not permitted
🎭 This is a demo portfolio, not a real filesystem!
💡 Try 'help' for commands that actually work!`;
          type = "error";
        }
        break;
      case "sudo":
        output = `🔐🔐🔐 SUDO DETECTED! 🔐🔐🔐
👑 Trying to become root, eh?
🚫 ACCESS DENIED! 🚫
🤡 You think I'd give you admin rights?
😂 This portfolio has trust issues!
🎪 Welcome to the circus of broken dreams!
💀 sudo: akshay is not in the sudoers file. This incident will be reported.`;
        type = "error";
        break;
      case "cp":
        const [source, dest] = args;
        if (!source || !dest) {
          output = "❌ cp: missing file operand";
          type = "error";
        } else {
          output = `✅ cp: copied '${source}' to '${dest}' 📋`;
          type = "success";
        }
        break;
      case "mv":
        const [mvSource, mvDest] = args;
        if (!mvSource || !mvDest) {
          output = "❌ mv: missing file operand";
          type = "error";
        } else {
          output = `✅ mv: moved '${mvSource}' to '${mvDest}' 🚚`;
          type = "success";
        }
        break;
      case "cat":
        const fileName = args[0];
        if (!fileName) {
          output = "❌ cat: missing file operand";
          type = "error";
        } else if (fileName === "resume.pdf") {
          output = "❌ cat: resume.pdf: cannot display binary file\n💡 Hint: This is a PDF! Try downloading it instead! 📄";
          type = "error";
        } else if (fileName === "skills.txt") {
          output = `🛠️ MY TECHNICAL SKILLS 🛠️\n\n${portfolioData?.skills.join("\n• ") ?? "Skills not found."}`;
          type = "success";
        } else if (fileName === "contact.json") {
          output = `📋 CONTACT INFORMATION 📋\n\n${JSON.stringify(portfolioData?.contact, null, 2) ?? "{}"}`;
          type = "success";
        } else if (fileName === "README.md") {
          output = `📖 PORTFOLIO README 📖

# 🚀 Akshay's Interactive Portfolio

Welcome to my multi-dimensional portfolio experience!

## 🎯 Available Views:
- 🖥️ CLI Terminal (you are here!)
- 💼 Modern Portfolio

## 🎮 Pro Tips:
- Type 'help' for all available commands
- Try 'fortune' for random wisdom
- Use 'sl' for a fun surprise!
- 'matrix' toggles the Matrix effect

## 🔥 Easter Eggs:
Hidden throughout the terminal... can you find them all?

---
Built with ❤️ and lots of ☕`;
          type = "success";
        } else if (fileName === ".hidden_secrets") {
          output = `🤫🤫🤫 SECRET UNLOCKED! 🤫🤫🤫
🎉 CONGRATULATIONS! You found the hidden file! 🎉
🏆 Achievement Unlocked: "Curious Explorer"
✨ Here's your reward: I absolutely LOVE building cool, interactive stuff!
🚀 Fun fact: This entire terminal is built in React!
🎨 Another secret: The Matrix effect is pure Canvas magic!
🤓 You're clearly a fellow developer with great taste!`;
          type = "success";
        } else if (fileName === ".bashrc") {
          output = `# 🐚 Akshay's Enhanced .bashrc 🐚
# Setting a fancy prompt
export PS1="🔥 \\[\\033[01;32m\\]\\u@portfolio\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]$ "

# Aliases for the modern developer
alias ll='ls -alF'
alias la='ls -A'
alias please='sudo' # For polite people
alias shrug='echo "¯\\_(ツ)_/¯"'
alias gtfo='exit'

# Function to greet the user
welcome() {
  echo "🚀 Welcome to the terminal, master! 🚀"
}

# Make life colorful
export CLICOLOR=1
export LSCOLORS=GxFxCxDxBxegedabagaced

# Run on startup
fortune | cowsay`;
          type = "success";
        } else if (fileName === ".vimrc") {
          output = `""""""""""""""""""""""""""""""""""""""
" Akshay's Legendary .vimrc         "
" (Guaranteed to confuse everyone) "
""""""""""""""""""""""""""""""""""""""
set nocompatible " Be modern
syntax on        " Make it pretty

" The ultimate question: how to exit?
" Here are some hints... or are they traps?
nnoremap <leader>q :q!<CR> "The easy way out"
nnoremap :q :echo "Not that easy!"<CR>
inoremap <esc> <esc>:echo "You are trapped forever!"<CR>

" Remap 'leader' key to spacebar
let mapleader = " "

" Super-powered save command
nnoremap <leader>w :w !sudo tee % > /dev/null<CR>

" Move lines up and down with ease
nnoremap <A-j> :m .+1<CR>==
nnoremap <A-k> :m .-2<CR>==

" Turn search highlighting on/off with a toggle
nnoremap <leader>/ :set hlsearch!<CR>

set number " Show line numbers, like a pro
set relativenumber " ...and relative numbers, for extra confusion
set mouse=a " Enable mouse support, because why not?`;
          type = "success";
        } else {
          output = `❌ cat: ${fileName}: No such file or directory`;
          type = "error";
        }
        break;
      case "grep":
        const pattern = args[0];
        const grepFile = args[1];
        if (!pattern) {
          output = "❌ grep: missing pattern";
          type = "error";
        } else if (!grepFile) {
          output = "❌ grep: missing file operand";
          type = "error";
        } else {
          output = `🔍 grep: searching for '${pattern}' in ${grepFile}...
📝 Match found on line 42: "The answer to everything is ${pattern}"
✅ Search completed successfully!`;
          type = "success";
        }
        break;
      case "man":
        const manCommand = args[0];
        if (!manCommand) {
          output = "❌ man: missing command";
          type = "error";
        } else {
          output = `📚 MANUAL PAGE FOR ${manCommand.toUpperCase()} 📚

NAME
    ${manCommand} - interactive portfolio command

DESCRIPTION
    This is Akshay's demo portfolio terminal.
    Commands are simulated for demonstration purposes.
    
EXAMPLES
    Try different commands and explore!
    
SEE ALSO
    help(1), about(1), projects(1)
    
AUTHOR
    Built with ❤️ by Akshay
    
💡 Type 'help' to see all available portfolio commands.`;
          type = "success";
        }
        break;
      case "cowsay":
        const message = args.join(" ") || "Hello from the CLI!";
        output = COW_ASCII.replace("Moo! Welcome to CLI", message);
        raw = true;
        type = "success";
        break;
      case "fortune":
        output = `🔮 FORTUNE COOKIE 🔮\n\n"${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}"`;
        type = "success";
        break;
      case "whoami":
        output = `🤔 WHO AM I? 🤔
👤 You are: A curious visitor
🌟 Status: Exploring Akshay's portfolio
🎯 Mission: Discover awesome projects
🔥 Level: Hacker (for using the CLI!)`;
        type = "success";
        break;
      case "uptime":
        const uptime = Math.floor(Math.random() * 100) + 1;
        output = `⏰ SYSTEM UPTIME ⏰
🚀 Portfolio has been running for: ${uptime} minutes
💪 Load average: 0.42, 0.69, 1.33
🔋 Status: Running smoothly!`;
        type = "success";
        break;
      case "ps":
        output = FAKE_PROCESSES.join("\n");
        raw = true;
        type = "success";
        break;
      case "matrix":
        setIsMatrixActive(!isMatrixActive);
        output = `🔴💊 ${!isMatrixActive ? "ENTERING" : "EXITING"} THE MATRIX 💊🔴
${!isMatrixActive ? "🌊 Reality is dissolving..." : "👁️ Welcome back to reality"}
Matrix effect ${!isMatrixActive ? "ACTIVATED" : "DEACTIVATED"}!`;
        type = "success";
        break;
      case "sl":
        if (isTrainAnimating) {
          output = "🚂 Train is already running! Please wait...";
          type = "error";
        } else {
          setHistory([...newHistory, { type: "output", text: ANIMATED_TRAIN[0], raw: true }]);
          animateTrain();
          return;
        }
        break;
      case "date":
        const now = new Date();
        output = `📅 ${now.toDateString()} ⏰ ${now.toLocaleTimeString()}
🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
📊 Unix timestamp: ${Math.floor(now.getTime() / 1000)}`;
        type = "success";
        break;
      case "history":
        output = "📜 COMMAND HISTORY 📜\n\n" + history.filter(h => h.type === 'command').map((h, i) => `${i + 1}: ${h.text.split('$ ')[1]}`).join('\n');
        type = "success";
        break;
      case "neofetch":
        output = `
    'c.          akshay@portfolio
  ,xNMM.          ------------------
.OMMMMo           OS: Interactive Web Terminal
OMMM0,            Host: Browser (probably Chrome/Firefox)
,MMMM'            Kernel: JavaScript (V8/SpiderMonkey)
.MMMM.            Uptime: ${Math.floor(Math.random() * 100) + 1} minutes
 :MMM'            Packages: 42 (npm)
  .MMM.           Shell: zsh (simulated)
   ,MMM.          Resolution: Your screen size
    :MMM.         Terminal: This React Component
     .MMM.        CPU: Your CPU (working hard!)
      ,MMM.       GPU: Your GPU (rendering these pixels!)
       .MMM.      Memory: A few MBs of your RAM
        .MMM.
         ,MMM.
          .MMM.
           ,MMM.
            :MMM:
             :MMM:
              :MMM:
`;
        raw = true;
        type = "success";
        break;
      case "exit":
        output = "👋 Goodbye! Redirecting to main menu...";
        type = "success";
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        break;
      case "":
        setHistory(newHistory);
        return;
      default:
        output = `❌ Command not found: ${command}
💡 Did you mean one of these?
   • help (show all commands)
   • about (learn about me)
   • projects (see my work)
   
🎯 Type 'help' for the full command list!`;
        type = "error";
    }

    setHistory([...newHistory, { type, text: output, raw }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  return (
    <div
      className="bg-black text-green-400 min-h-screen font-mono relative overflow-hidden flex flex-col"
      style={{
        cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 0V24M0 12H24' stroke='%2300ff00' stroke-width='1'/%3E%3Ccircle cx='12' cy='12' r='4' fill='%2300ff00' fill-opacity='0.3'%3E%3Canimate attributeName='r' values='2;5;2' dur='1.5s' repeatCount='indefinite' /%3E%3Canimate attributeName='fill-opacity' values='0.2;0.6;0.2' dur='1.5s' repeatCount='indefinite' /%3E%3C/circle%3E%3C/svg%3E\"), auto"
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {isMatrixActive && <MatrixRain />}
      
      {/* Enhanced Terminal Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-600 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="text-gray-300 text-sm flex items-center gap-2">
          {isMobile && <Smartphone className="w-4 h-4" />}
          <Terminal className="w-4 h-4" />
          akshay@portfolio: ~
        </div>
        <Link to="/" className="text-blue-400 hover:underline text-sm flex items-center gap-1">
          <Zap className="w-3 h-3" />
          [Switch View]
        </Link>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 z-10 relative"
      >
        {history.map((item, index) => (
          <div key={index} className="mb-1">
            {item.type === "command" ? (
              <p className="text-white font-bold break-all">{item.text}</p>
            ) : item.raw ? (
              <pre className={`whitespace-pre-wrap text-xs md:text-sm overflow-x-auto ${
                item.type === "error" ? "text-red-400" : 
                item.type === "success" ? "text-green-400" : "text-green-300"
              }`}>{item.text}</pre>
            ) : (
              <TypeAnimation
                sequence={[item.text]}
                wrapper="div"
                speed={90}
                cursor={false}
                className={`whitespace-pre-wrap break-words ${
                  item.type === "error" ? "text-red-400" : 
                  item.type === "success" ? "text-green-400" : "text-green-300"
                }`}
              />
            )}
          </div>
        ))}
        
        {/* Current input line */}
        <form onSubmit={handleSubmit} className="flex items-start mt-2 flex-wrap">
          <span className="text-white font-bold mr-2 flex-shrink-0 text-sm md:text-base">
            {currentDir.split('/').pop()}@portfolio:{currentDir}$
          </span>
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none text-green-400 focus:outline-none w-full text-sm md:text-base"
              autoFocus
              disabled={isTrainAnimating}
              placeholder={isMobile ? "Tap to type command..." : ""}
            />
          </div>
          {isTrainAnimating && (
            <span className="text-yellow-400 ml-2 animate-pulse">🚂</span>
          )}
        </form>

        {/* Command Suggestions */}
        {commandSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {commandSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 bg-green-900/30 border border-green-500/50 rounded text-green-300 text-xs hover:bg-green-800/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}