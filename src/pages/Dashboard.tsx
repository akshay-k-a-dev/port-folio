// TODO: THIS IS THE DEFAULT DASHBOARD PAGE THAT THE USER WILL SEE AFTER AUTHENTICATION. ADD MAIN FUNCTIONALITY HERE.
// This is the entry point for users who have just signed in

import { motion } from "framer-motion";
import { Rocket, Code, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 flex items-center justify-center"
    >
      <div className="max-w-4xl mx-auto text-center px-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to the Portfolio
          </h1>
          
          <p className="text-xl text-white/70 mb-8">
            Choose your preferred view to explore the portfolio
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Link
            to="/cli"
            className="group p-8 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all hover:scale-105"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              <Code className="w-8 h-8 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">CLI Terminal</h3>
            <p className="text-green-300/70">Experience the hacker-style terminal interface</p>
          </Link>

          <Link
            to="/portfolio"
            className="group p-8 bg-gradient-to-br from-purple-900/30 to-blue-800/30 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-purple-400 mb-2">Modern Portfolio</h3>
            <p className="text-purple-300/70">Explore the sleek, interactive design</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all"
          >
            ← Back to Selection
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}