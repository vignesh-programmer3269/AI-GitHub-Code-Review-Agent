import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSettings, FiChevronRight } from "react-icons/fi";
import { cn } from "../../utils/cn";
import ProviderLogo from "../ProviderLogo/ProviderLogo";
import { useClickOutside } from "../../hooks/useClickOutside";
import { AVAILABLE_MODELS } from "../../config/constants";

const ModelSelector = forwardRef(
  (
    { providerKeys, selectedModelId, onSelect, onOpenManage, hasError },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeProviderId, setActiveProviderId] = useState(null); 
    const [lockedProviderId, setLockedProviderId] = useState(null);
    const [submenuStyles, setSubmenuStyles] = useState({});
    const containerRef = useRef(null);

    useClickOutside(containerRef, () => {
      if (isOpen) {
        setIsOpen(false);
        setActiveProviderId(null);
        setLockedProviderId(null);
      }
    });

    useImperativeHandle(ref, () => ({
      openDropdown: () => setIsOpen(true),
    }));

    // Find the currently selected model across all providers
    let selectedModel = null;
    let selectedProvider = null;
    for (const p of AVAILABLE_MODELS) {
      const m = p.models.find(model => model.id === selectedModelId);
      if (m) {
        selectedModel = m;
        selectedProvider = p;
        break;
      }
    }

    const handleModelClick = (provider, model) => {
      setIsOpen(false);
      setActiveProviderId(null);
      setLockedProviderId(null);

      // Check if provider key exists
      const hasKey = providerKeys.some(pk => pk.providerId === provider.id);
      if (hasKey) {
        onSelect(model.id);
      } else {
        onOpenManage(provider.id);
      }
    };

    const handleMouseEnter = (id) => {
      if (!lockedProviderId) {
        setActiveProviderId(id);
      }
    };

    const handleMouseLeave = () => {
      if (!lockedProviderId) {
        setActiveProviderId(null);
      }
    };

    const handleProviderClick = (id) => {
      if (lockedProviderId === id) {
        setLockedProviderId(null);
        setActiveProviderId(null);
      } else {
        setLockedProviderId(id);
        setActiveProviderId(id);
      }
    };

    const handleSubmenuRef = (providerId, el) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        // If the submenu is overflowing the bottom of the window
        if (rect.bottom > window.innerHeight - 20) {
          setSubmenuStyles(prev => {
            if (prev[providerId]?.bottom === '-40px') return prev;
            return { ...prev, [providerId]: { top: 'auto', bottom: '-40px' } };
          });
        } else {
          setSubmenuStyles(prev => {
            if (prev[providerId]?.top === '0') return prev;
            return { ...prev, [providerId]: { top: '0', bottom: 'auto' } };
          });
        }
      }
    };

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
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {selectedModel ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <ProviderLogo
                provider={selectedProvider.id}
                className="w-4 h-4 shrink-0"
              />
              <span className="text-sm font-medium text-text-primary truncate">
                {selectedModel.label}
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
              className="absolute z-[60] top-[calc(100%+8px)] right-0 w-56 bg-bg-canvas border border-border-default rounded-xl shadow-lg flex flex-col"
              role="menu"
            >
              <div className="p-1 flex flex-col gap-0.5">
                {AVAILABLE_MODELS.map((provider) => (
                  <div
                    key={provider.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(provider.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      aria-haspopup="true"
                      onClick={() => handleProviderClick(provider.id)}
                      aria-expanded={activeProviderId === provider.id}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                        activeProviderId === provider.id
                          ? "bg-bg-subtle text-text-primary"
                          : "text-text-primary hover:bg-bg-subtle"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ProviderLogo provider={provider.id} className="w-4 h-4 shrink-0" />
                        <span>{provider.name}</span>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-text-secondary" />
                    </button>

                    {/* Nested Submenu */}
                    <AnimatePresence>
                      {activeProviderId === provider.id && (
                        <motion.div
                          ref={(el) => handleSubmenuRef(provider.id, el)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          style={submenuStyles[provider.id] || { top: '0' }}
                          className="absolute right-full mr-1 w-56 bg-bg-canvas border border-border-default rounded-xl shadow-xl overflow-hidden py-1 z-50"
                          role="menu"
                        >
                          <div className="px-3 py-1.5 border-b border-border-default/50 mb-1">
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                              {provider.name} Models
                            </span>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {provider.models.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                role="menuitem"
                                onClick={() => handleModelClick(provider, model)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors",
                                  model.id === selectedModelId
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-text-primary hover:bg-bg-subtle"
                                )}
                              >
                                <span className="truncate pr-2">{model.label}</span>
                                {model.recommended && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent font-semibold">
                                    PRO
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-default p-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenManage(null); // Open manage without pre-selecting a specific provider
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
                >
                  <FiSettings className="w-4 h-4" />
                  Manage Keys
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
