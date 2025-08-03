import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "1") {
        navigate("/cli");
      } else if (event.key === "2") {
        navigate("/portfolio");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigate]);

  return (
    <div className="bg-black text-green-400 min-h-screen flex items-center justify-center font-mono">
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

        <div className="flex flex-col md:flex-row gap-4 justify-center">
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
      </motion.div>
    </div>
  );
}