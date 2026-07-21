import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import RepositoryOverviewCard from "../components/planning/RepositoryOverviewCard";
import RepositorySummaryCard from "../components/planning/RepositorySummaryCard";
import ArchitectureCard from "../components/planning/ArchitectureCard";
import FolderOrganizationCard from "../components/planning/FolderOrganizationCard";
import TechnologyStackCard from "../components/planning/TechnologyStackCard";
import RepositoryStatsCard from "../components/planning/RepositoryStatsCard";
import AnalysisPlanCard from "../components/planning/AnalysisPlanCard";
import AnalysisInfoDialog from "../components/planning/AnalysisInfoDialog";
import SummaryBar from "../components/planning/SummaryBar";
import toast from "react-hot-toast";

export default function Planning() {
  const location = useLocation();
  const navigate = useNavigate();

  const { planning, sessionId, repoUrl } = location.state || {};

  const [selectedAgents, setSelectedAgents] = useState(new Set());
  const [infoDialogAgent, setInfoDialogAgent] = useState(null);

  // Initialize selected agents based on 'selectedByDefault'
  useEffect(() => {
    if (planning && planning.recommendedAnalyses) {
      const defaults = new Set();
      planning.recommendedAnalyses.forEach((agent) => {
        if (agent.selectedByDefault) {
          defaults.add(agent.agentId);
        }
      });
      setSelectedAgents(defaults);
    }
  }, [planning]);

  if (!planning || !sessionId) {
    return <Navigate to="/" replace />;
  }

  const handleToggleAgent = (agentId) => {
    const newSet = new Set(selectedAgents);
    if (newSet.has(agentId)) {
      newSet.delete(agentId);
    } else {
      newSet.add(agentId);
    }
    setSelectedAgents(newSet);
  };

  const handleRunAnalysis = () => {
    if (selectedAgents.size === 0) return;
    toast(
      "Dashboard implementation pending. Moving to dashboard with selected agents soon!",
      {
        icon: "🚧",
      },
    );
    // navigate("/dashboard", { state: { sessionId, repoUrl, selectedAgents: Array.from(selectedAgents) } });
  };

  // Calculate dynamic totals
  let totalTokens = 0;
  let totalTimeSeconds = 0;

  planning.recommendedAnalyses?.forEach((agent) => {
    if (selectedAgents.has(agent.agentId)) {
      totalTokens += agent.estimatedTokens || 0;

      const duration = agent.estimatedDuration || "";
      if (duration.includes("min")) {
        totalTimeSeconds += parseInt(duration) * 60;
      } else if (duration.includes("sec")) {
        totalTimeSeconds += parseInt(duration);
      }
    }
  });

  const totalTimeStr =
    totalTimeSeconds >= 60
      ? `${Math.ceil(totalTimeSeconds / 60)} min`
      : `${totalTimeSeconds} sec`;

  return (
    <main className="relative min-h-screen pb-32 overflow-x-hidden text-text-primary">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            AI Analysis{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-400">
              Plan
            </span>
          </h1>
          <p className="text-text-secondary">
            Review the repository architecture and select the specialized agents
            you want to execute.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Overviews */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <RepositoryOverviewCard planning={planning} />
            <RepositorySummaryCard planning={planning} />
            <ArchitectureCard planning={planning} />
            <FolderOrganizationCard planning={planning} />
          </div>

          {/* Right Column: Stats & Tech */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TechnologyStackCard planning={planning} />
            <RepositoryStatsCard planning={planning} />
          </div>
        </div>

        {/* Analysis Plan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-text-primary">
              Recommended Analyses
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setSelectedAgents(
                    new Set(planning.recommendedAnalyses.map((a) => a.agentId)),
                  )
                }
                className="text-sm px-4 py-2 rounded-lg bg-bg-surface border border-border-default hover:border-accent/50 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedAgents(new Set())}
                className="text-sm px-4 py-2 rounded-lg bg-bg-surface border border-border-default hover:border-danger/50 hover:text-danger transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planning.recommendedAnalyses?.map((analysis, i) => (
              <motion.div
                key={analysis.agentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              >
                <AnalysisPlanCard
                  analysis={analysis}
                  isSelected={selectedAgents.has(analysis.agentId)}
                  onToggle={() => handleToggleAgent(analysis.agentId)}
                  onInfoClick={() => setInfoDialogAgent(analysis)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <SummaryBar
        selectedCount={selectedAgents.size}
        totalTimeStr={totalTimeStr}
        totalTokens={totalTokens}
        onRunClick={handleRunAnalysis}
      />

      <AnalysisInfoDialog
        isOpen={!!infoDialogAgent}
        onClose={() => setInfoDialogAgent(null)}
        analysis={infoDialogAgent}
      />
    </main>
  );
}
