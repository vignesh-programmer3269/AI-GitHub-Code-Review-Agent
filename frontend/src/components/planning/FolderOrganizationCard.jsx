import { motion } from "framer-motion";
import { FiFolder } from "react-icons/fi";

export default function FolderOrganizationCard({ planning }) {
  const { folderOrganization } = planning;

  const paragraphs = folderOrganization 
    ? folderOrganization.split("\\n").filter(p => p.trim() !== "")
    : ["No folder organization summary provided."];

  return (
    <motion.div
      className="p-6 rounded-2xl bg-bg-card border border-border-default shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <FiFolder className="w-5 h-5 text-accent" />
        Folder Organization
      </h3>
      <div className="space-y-4 text-text-secondary leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </motion.div>
  );
}
