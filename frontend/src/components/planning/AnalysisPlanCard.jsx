import { motion } from "framer-motion";
import { FiInfo, FiClock, FiDatabase, FiCheck } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function AnalysisPlanCard({ analysis, isSelected, onToggle, onInfoClick }) {
  const { agentName, priority, description, estimatedDuration, estimatedTokens } = analysis;

  let priorityColor = "bg-bg-surface text-text-secondary border-border-default";
  if (priority === "Critical") priorityColor = "bg-danger/10 text-danger border-danger/20";
  else if (priority === "High") priorityColor = "bg-warning/10 text-warning border-warning/20";
  else if (priority === "Medium") priorityColor = "bg-accent/10 text-accent border-accent/20";
  else if (priority === "Low") priorityColor = "bg-success/10 text-success border-success/20";

  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 group cursor-pointer",
        isSelected 
          ? "bg-accent/5 border-accent shadow-sm" 
          : "bg-bg-card border-border-default hover:border-text-secondary/30"
      )}
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className={cn(
        "w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
        isSelected 
          ? "bg-accent border-accent text-white" 
          : "border-text-secondary/40 text-transparent"
      )}>
        <FiCheck className="w-4 h-4" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h4 className={cn(
              "font-bold transition-colors",
              isSelected ? "text-accent" : "text-text-primary"
            )}>
              {agentName}
            </h4>
            <span className={cn("px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border", priorityColor)}>
              {priority}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
            className="p-1.5 rounded-md text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-text-secondary mb-3 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 opacity-70" />
            <span>~{estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiDatabase className="w-3.5 h-3.5 opacity-70" />
            <span>~{estimatedTokens?.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
