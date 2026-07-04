import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import StoredModelItem from "./StoredModelItem";
import ConfirmationDialog from "./ConfirmationDialog";
import toast from "react-hot-toast";
import { AVAILABLE_MODELS } from "../../config/constants";

export default function ManageModelsModal({
  isOpen,
  onClose,
  models, // Locally stored API keys
  onUpdateModel,
  onDeleteModel,
  onAddModel,
}) {
  const providers = AVAILABLE_MODELS;

  const [providerId, setProviderId] = useState("");
  const [modelId, setModelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  // Focus trap & escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (modelToDelete) {
          setModelToDelete(null);
        } else if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirmOpen, modelToDelete, onClose]);

  // Set default provider when data loads
  useEffect(() => {
    if (providers.length > 0 && !providerId) {
      setProviderId(providers[0].id);
    }
  }, [providers, providerId]);

  // Set default model when provider changes
  useEffect(() => {
    if (providerId) {
      const selectedProvider = providers.find((p) => p.id === providerId);
      if (selectedProvider && selectedProvider.models.length > 0) {
        // Find recommended model or fallback to first
        const recommended = selectedProvider.models.find((m) => m.recommended);
        setModelId(
          recommended ? recommended.id : selectedProvider.models[0].id,
        );
      }
    }
  }, [providerId, providers]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (providers.length > 0) {
        setProviderId(providers[0].id);
      }
      setApiKey("");
      setShowKey(false);
      setIsConfirmOpen(false);
      setModelToDelete(null);
    }
  }, [isOpen, providers]);

  const handleDeleteClick = (id) => {
    setModelToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (modelToDelete) {
      onDeleteModel(modelToDelete);
      toast.success("API Key deleted successfully", {
        style: {
          background: "var(--color-bg-card)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border-default)",
        },
      });
      setModelToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModelToDelete(null);
  };

  const handleSaveClick = () => {
    if (!providerId || !modelId || !apiKey.trim()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const selectedProvider = providers.find((p) => p.id === providerId);
    const selectedModel = selectedProvider?.models.find(
      (m) => m.id === modelId,
    );

    // We store provider name and model name along with the key for easy display in UI
    onAddModel(
      selectedProvider?.name || providerId,
      selectedModel?.label || modelId,
      apiKey.trim(),
    );
    setIsConfirmOpen(false);
    onClose();
  };

  const handleCancelSave = () => {
    setIsConfirmOpen(false);
  };

  const isFormValid = providerId && modelId && apiKey.trim();

  const selectedProviderData = providers.find((p) => p.id === providerId);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                if (!isConfirmOpen && !modelToDelete) onClose();
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-bg-canvas rounded-xl shadow-2xl border border-border-default overflow-hidden flex flex-col max-h-[85vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="manage-models-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-default">
                <div>
                  <h2
                    id="manage-models-title"
                    className="text-lg font-semibold text-text-primary"
                  >
                    Manage AI Models
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Manage locally stored API keys.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-4 flex flex-col gap-6">
                {/* List of Models */}
                <div>
                  {models.length === 0 ? (
                    <div className="text-center py-6 text-sm text-text-secondary bg-bg-subtle rounded-lg border border-dashed border-border-default">
                      No models stored yet.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {models.map((m) => (
                        <StoredModelItem
                          key={m.id}
                          model={m}
                          onUpdate={onUpdateModel}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border-default/60" />

                {/* Add New Model Form */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <FiPlus className="text-accent" /> Add New Model
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Provider
                      </label>
                      <select
                        value={providerId}
                        onChange={(e) => setProviderId(e.target.value)}
                        className="w-full bg-bg-surface border border-border-default text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none transition-colors"
                      >
                        {providers.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            style={{
                              backgroundColor: "#1C2128",
                              color: "#f0f6fc",
                            }}
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Model Name
                      </label>
                      <select
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        className="w-full bg-bg-surface border border-border-default text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none transition-colors"
                      >
                        {selectedProviderData?.models.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            style={{
                              backgroundColor: "#1C2128",
                              color: "#f0f6fc",
                            }}
                          >
                            {m.label} {m.recommended && "(Recommended)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Paste API key here"
                          className="w-full bg-bg-surface border border-border-default text-text-primary text-sm rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors placeholder:text-text-secondary/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                        >
                          {showKey ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={!isFormValid}
                  className="mt-2 w-full flex items-center justify-center py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save Model
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <ConfirmationDialog
        isOpen={!!modelToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete API Key?"
        message={
          <p>
            Are you sure you want to delete this API key? You will need to
            re-enter it to use this model again.
          </p>
        }
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
}
