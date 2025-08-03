import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Link, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNavigation = (value: string) => {
    const key = value.trim();
    if (key === "1") {
      navigate("/cli");
    } else if (key === "2") {
      navigate("/portfolio");
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Keep the original direct key press navigation
      if (event.key === "1" || event.key === "2") {
        handleNavigation(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    inputRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigation(input);
    setInput("");
  };

  return (
    <div
      className="bg-black text-green-400 min-h-screen flex items-center justify-center font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <TypeAnimation
          sequence={[
            "Welcome to Akshay's Portfolio...",
            1000,
            "Choose your view:",
            500,
          ]}
          wrapper="h1"
          speed={50}
          className="text-2xl md:text-4xl mb-8"
        />

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <Link
            to="/cli"
            className="hover:bg-green-900 border border-green-400 p-4 rounded transition-colors"
          >
            <span className="text-green-400">1)</span> CLI Hacker Terminal
          </Link>
          <Link
            to="/portfolio"
            className="hover:bg-green-900 border border-green-400 p-4 rounded transition-colors"
          >
            <span className="text-green-400">2)</span> Modern Developer Portfolio
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex items-center justify-center">
            <span className="text-green-400 mr-2 text-xl">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-b-2 border-green-400 text-green-400 focus:outline-none w-24 text-center text-xl"
              autoFocus
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}