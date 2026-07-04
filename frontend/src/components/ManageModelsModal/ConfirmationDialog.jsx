import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useEffect } from "react";

export default function ConfirmationDialog({ 
  isOpen, 
  onConfirm, 
  onCancel,
  title = "Store API Key Locally?",
  message = null,
  confirmText = "Save",
  isDanger = false
}) {
  // Focus trap and ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm bg-bg-canvas rounded-xl shadow-2xl border border-border-default overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-danger/10' : 'bg-accent/10'}`}>
                  {isDanger ? (
                    <FiTrash2 className="w-5 h-5 text-danger" />
                  ) : (
                    <FiAlertTriangle className="w-5 h-5 text-accent" />
                  )}
                </div>
                <h2 id="confirm-dialog-title" className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              </div>
              
              <div className="text-sm text-text-secondary space-y-3">
                {message ? (
                  message
                ) : (
                  <>
                    <p>
                      Your API key will only be stored in your browser's LocalStorage.
                    </p>
                    <p>
                      This application uses your key only to communicate with the selected LLM provider during repository analysis.
                    </p>
                    <p className="font-medium text-text-primary">
                      Your API key is never stored, logged, or persisted on our backend.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-bg-subtle border-t border-border-default">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-default transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${
                  isDanger ? 'bg-danger hover:bg-red-700' : 'bg-accent hover:bg-accent-hover'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
