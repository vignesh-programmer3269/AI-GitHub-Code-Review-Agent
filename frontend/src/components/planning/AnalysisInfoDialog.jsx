import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiInfo } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function AnalysisInfoDialog({ isOpen, onClose, analysis }) {
  if (!analysis) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl bg-bg-card border border-border-default shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 text-accent">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FiInfo className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  {analysis.agentName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                aria-label="Close dialog"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Purpose
                </h4>
                <p className="text-sm text-text-primary leading-relaxed">
                  {analysis.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-default/50">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Priority
                  </h4>
                  <span className="text-sm font-medium text-text-primary">
                    {analysis.priority}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Default Selection
                  </h4>
                  <span className={cn(
                    "text-sm font-medium",
                    analysis.selectedByDefault ? "text-success" : "text-text-secondary"
                  )}>
                    {analysis.selectedByDefault ? "Recommended" : "Optional"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-bg-surface hover:bg-bg-surface border border-border-default text-text-primary font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
