import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import AnimatedBackground from "../components/AnimatedBackground";
import UrlInput from "../components/UrlInput";

const features = [
  "Code Review",
  "Security",
  "Performance",
  "Architecture",
  "Documentation",
  "Roadmap",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <AnimatedBackground />

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Hero Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI GitHub Code{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-400">
            Review Agent
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 font-sans leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Analyze any public GitHub repository using specialized AI agents for
          Code Review, Security, Performance, Architecture, Documentation, and
          Improvement Roadmap.
        </motion.p>

        {/* Main Input */}
        <div className="w-full mb-16">
          <UrlInput />
        </div>

        {/* Feature Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div
              key={feature}
              variants={itemVariants}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card/40 border border-border-default/50 backdrop-blur-md shadow-sm"
            >
              <FiCheck className="text-success h-4 w-4" />
              <span className="text-sm font-medium text-text-primary">
                {feature}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
