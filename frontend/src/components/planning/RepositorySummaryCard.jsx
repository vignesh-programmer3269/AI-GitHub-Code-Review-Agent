import { motion } from "framer-motion";
import { FiFileText } from "react-icons/fi";

export default function RepositorySummaryCard({ planning }) {
  const { repositorySummary } = planning;

  // Split into paragraphs assuming newlines separate them
  const paragraphs = repositorySummary 
    ? repositorySummary.split("\\n").filter(p => p.trim() !== "")
    : ["No summary provided."];

  return (
    <motion.div
      className="p-6 rounded-2xl bg-bg-card border border-border-default shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <FiFileText className="w-5 h-5 text-accent" />
        Repository Summary
      </h3>
      <div className="space-y-4 text-text-secondary leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </motion.div>
  );
}
