import { motion } from "framer-motion";
import { FiGithub, FiActivity, FiShield } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function RepositoryOverviewCard({ planning }) {
  const {
    repositoryName,
    repositoryOwner,
    repositoryType,
    complexity,
    repositoryHealth,
  } = planning;

  const score = repositoryHealth?.score || 0;

  let healthColor = "text-success";
  let healthBg = "bg-success";
  if (score < 50) {
    healthColor = "text-danger";
    healthBg = "bg-danger";
  } else if (score < 80) {
    healthColor = "text-warning";
    healthBg = "bg-warning";
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-bg-card border border-border-default shadow-sm flex flex-col gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <FiGithub className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              {repositoryOwner} / {repositoryName}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
              <span className="px-2.5 py-0.5 rounded-full bg-bg-surface border border-border-default font-medium">
                {repositoryType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-bg-surface border border-border-default font-medium">
                {complexity} Complexity
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface p-4 rounded-xl border border-border-default/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <FiActivity className="w-4 h-4" />
            Repository Health
          </h3>
          <span className={cn("text-lg font-bold", healthColor)}>
            {score}/100
          </span>
        </div>

        <div className="w-full bg-bg-card rounded-full h-2.5 mb-3 overflow-hidden">
          <motion.div
            className={cn("h-2.5 rounded-full", healthBg)}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          ></motion.div>
        </div>

        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <FiShield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{repositoryHealth?.reason}</p>
        </div>
      </div>
    </motion.div>
  );
}
