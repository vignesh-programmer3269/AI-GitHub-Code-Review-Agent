import { motion } from "framer-motion";
import { FiCpu } from "react-icons/fi";

export default function TechnologyStackCard({ planning }) {
  const { technologyStack } = planning;
  
  if (!technologyStack) return null;

  const categories = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "frameworks", label: "Frameworks" },
    { key: "libraries", label: "Libraries" },
    { key: "runtime", label: "Runtime" },
    { key: "packageManager", label: "Package Manager" },
    { key: "buildTool", label: "Build Tool" },
    { key: "deployment", label: "Deployment" },
    { key: "ciCd", label: "CI/CD" },
    { key: "containerization", label: "Containerization" },
  ];

  const activeCategories = categories.filter(
    (c) => technologyStack[c.key] && technologyStack[c.key].length > 0
  );

  return (
    <motion.div
      className="p-6 rounded-2xl bg-bg-card border border-border-default shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
        <FiCpu className="w-5 h-5 text-accent" />
        Technology Stack
      </h3>
      
      <div className="space-y-6">
        {activeCategories.length === 0 ? (
          <p className="text-text-secondary text-sm">No specific technologies identified.</p>
        ) : (
          activeCategories.map((category) => (
            <div key={category.key}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                {category.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {technologyStack[category.key].map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-bg-surface border border-border-default text-sm text-text-primary shadow-sm hover:border-accent/50 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
