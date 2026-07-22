import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiLoaderAlt } from "react-icons/bi";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { repoService } from "../services/api";
import { cn } from "../utils/cn";

const LOADING_MESSAGES = [
  "Connecting to GitHub...",
  "Validating repository...",
  "Retrieving repository information...",
  "Reading README...",
  "Scanning project structure...",
  "Detecting frameworks and technologies...",
  "Building repository context...",
  "Preparing AI analysis...",
  "Analyzing project architecture...",
  "Generating repository insights...",
  "Preparing your analysis results...",
];

// Display each message for 5 seconds.
const MESSAGE_INTERVAL_MS = 5000;

export default function LoadingAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const repoUrl = location.state?.repoUrl;

  const [messageIndex, setMessageIndex] = useState(0);
  const [minDisplayComplete, setMinDisplayComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // 1. Cycle through messages
  useEffect(() => {
    if (error || (analysisResult && minDisplayComplete)) return;

    // If the backend has already finished, speed through remaining messages
    // at 800ms per message so it's still readable but much faster.
    const currentInterval = analysisResult ? 800 : MESSAGE_INTERVAL_MS;

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev === LOADING_MESSAGES.length - 1) {
          setMinDisplayComplete(true);
          return prev; // Hold on the last message
        }
        return prev + 1;
      });
    }, currentInterval);

    return () => clearInterval(interval);
  }, [error, analysisResult, minDisplayComplete]);

  // 2. Perform Backend Request
  useEffect(() => {
    if (!repoUrl) {
      navigate("/");
      return;
    }

    let isMounted = true;

    const performAnalysis = async () => {
      try {
        const response = await repoService.analyze(repoUrl);
        if (isMounted) {
          setAnalysisResult(response);
        }
      } catch (err) {
        if (isMounted) {
          const errMsg =
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Failed to validate repository. Ensure it is public and exists.";
          setError(errMsg);
        }
      }
    };

    performAnalysis();

    return () => {
      isMounted = false;
    };
  }, [repoUrl, navigate]);

  // 3. Navigation effect when both conditions are met
  useEffect(() => {
    if (analysisResult && minDisplayComplete && !error) {
      navigate("/planning", {
        state: {
          repoUrl,
          sessionId: analysisResult.sessionId,
          planning: analysisResult.planning,
        },
      });
    }
  }, [analysisResult, minDisplayComplete, error, navigate, repoUrl]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6">
      {/* Error State */}
      {error && (
        <motion.div
          className="max-w-md w-full bg-bg-card border border-border-default rounded-2xl p-8 shadow-sm flex flex-col items-center text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-6">
            <FiAlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Analysis Failed
          </h2>
          <p className="text-text-secondary mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-surface border border-border-default hover:border-text-secondary/50 text-text-primary font-medium transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Return Home
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {!error && (
        <motion.div
          className="flex flex-col items-center max-w-md w-full text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated AI Loader */}
          <div className="relative mb-10 w-24 h-24 flex items-center justify-center">
            {/* Outer rotating dashed ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-accent/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner rotating solid ring */}
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-t-accent border-r-accent/30 border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Center icon */}
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <BiLoaderAlt className="w-6 h-6 animate-spin" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">
            AI Agent Analyzing
          </h2>

          <div className="h-8 relative w-full overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 text-accent font-medium text-lg"
              >
                {LOADING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-sm text-text-secondary max-w-xs mx-auto">
            Large repositories may take up to 2–3 minutes to analyze. Please do
            not close this window.
          </p>
        </motion.div>
      )}
    </div>
  );
}
