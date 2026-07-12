import { motion } from "framer-motion";
import { FiPlay, FiClock, FiDatabase } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function SummaryBar({ selectedCount, totalTimeStr, totalTokens, onRunClick }) {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/80 backdrop-blur-xl border-t border-border-default/60 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left side stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-0.5">
              Selected Analyses
            </p>
            <p className="text-lg font-bold text-text-primary">
              {selectedCount} <span className="text-text-secondary text-sm font-normal">agents</span>
            </p>
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-border-default/50" />
          
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-0.5 flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5" /> Est. Time
            </p>
            <p className="text-lg font-bold text-text-primary">
              ~{totalTimeStr}
            </p>
          </div>

          <div className="hidden sm:block w-px h-8 bg-border-default/50" />

          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-0.5 flex items-center gap-1.5">
              <FiDatabase className="w-3.5 h-3.5" /> Est. Tokens
            </p>
            <p className="text-lg font-bold text-text-primary">
              ~{totalTokens.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Right side action */}
        <div>
          <button
            onClick={onRunClick}
            disabled={selectedCount === 0}
            className={cn(
              "flex items-center justify-center h-12 px-8 rounded-xl font-medium transition-all duration-300 shadow-md",
              selectedCount === 0
                ? "bg-bg-surface text-text-secondary border border-border-default cursor-not-allowed shadow-none"
                : "bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95"
            )}
          >
            <FiPlay className="w-4 h-4 mr-2" />
            Run Selected Analysis
          </button>
        </div>
      </div>
    </motion.div>
  );
}
