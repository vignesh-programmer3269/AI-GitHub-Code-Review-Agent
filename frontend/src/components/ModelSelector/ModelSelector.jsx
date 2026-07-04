import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSettings } from "react-icons/fi";
import { cn } from "../../utils/cn";
import ProviderLogo from "../ProviderLogo/ProviderLogo";
import { useClickOutside } from "../../hooks/useClickOutside";

const ModelSelector = forwardRef(
  (
    { models, selectedModelId, onSelect, onOpenManage, hasError },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useClickOutside(containerRef, () => {
      if (isOpen) setIsOpen(false);
    });

    useImperativeHandle(ref, () => ({
      openDropdown: () => setIsOpen(true),
    }));

    const selectedModel = models.find((m) => m.id === selectedModelId);

    return (
      <div className="relative w-full h-full" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-full flex items-center justify-between px-4 rounded-xl bg-bg-surface border transition-all duration-300 shadow-sm outline-none",
            hasError
              ? "border-danger focus:ring-2 focus:ring-danger/20"
              : "border-border-default hover:border-text-secondary/50 focus:ring-2 focus:ring-accent/20 focus:border-accent"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selectedModel ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <ProviderLogo
                provider={selectedModel.provider}
                className="w-4 h-4 shrink-0"
              />
              <span className="text-sm font-medium text-text-primary truncate">
                {selectedModel.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-text-secondary">Select Model</span>
          )}
          
          <FiChevronDown
            className={cn(
              "w-4 h-4 text-text-secondary transition-transform duration-200 shrink-0 ml-2",
              isOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 top-[calc(100%+8px)] right-0 w-64 bg-bg-canvas border border-border-default rounded-xl shadow-lg overflow-hidden flex flex-col"
              role="listbox"
            >
              <div className="max-h-60 overflow-y-auto p-1 flex flex-col gap-0.5">
                {models.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-center text-text-secondary">
                    No models available.
                  </div>
                ) : (
                  models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      role="option"
                      aria-selected={model.id === selectedModelId}
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                        model.id === selectedModelId
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-text-primary hover:bg-bg-subtle"
                      )}
                    >
                      <ProviderLogo
                        provider={model.provider}
                        className={cn(
                          "w-4 h-4 shrink-0",
                          model.id === selectedModelId ? "text-accent" : ""
                        )}
                      />
                      <span className="truncate">{model.name}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-border-default p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenManage();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                >
                  <FiSettings className="w-4 h-4" />
                  Manage Models
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ModelSelector.displayName = "ModelSelector";
export default ModelSelector;
