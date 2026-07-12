import { motion } from "framer-motion";
import {
  FiPieChart,
  FiFolder,
  FiFile,
  FiCode,
  FiHardDrive,
  FiGitBranch,
} from "react-icons/fi";

export default function RepositoryStatsCard({ planning }) {
  const { repositoryStats } = planning;

  if (!repositoryStats) return null;

  const { files, folders, languages, repositorySize, defaultBranch } =
    repositoryStats;

  const formatSize = (kb) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const statItems = [
    { icon: FiFile, label: "Files", value: files },
    { icon: FiFolder, label: "Folders", value: folders },
    { icon: FiHardDrive, label: "Size", value: formatSize(repositorySize) },
    { icon: FiGitBranch, label: "Default Branch", value: defaultBranch },
  ];

  return (
    <motion.div
      className="p-6 rounded-2xl bg-bg-card border border-border-default shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
        <FiPieChart className="w-5 h-5 text-accent" />
        Repository Statistics
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {statItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-bg-surface p-3 rounded-xl border border-border-default/50"
          >
            <div className="p-2 rounded-lg bg-bg-card text-text-secondary">
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{item.label}</p>
              <p className="text-sm font-semibold text-text-primary">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {languages && languages.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
            <FiCode className="w-4 h-4" />
            Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-bg-surface border border-border-default text-xs font-medium text-text-secondary"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
