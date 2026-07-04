import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ProviderLogo from "../ProviderLogo/ProviderLogo";
import { useClickOutside } from "../../hooks/useClickOutside";

export default function StoredModelItem({ model, onUpdate, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(model.apiKey);
  const [showKey, setShowKey] = useState(false);
  
  const menuRef = useRef(null);
  
  useClickOutside(menuRef, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  // Handle escape to close menu or cancel edit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        if (isEditing) {
          setIsEditing(false);
          setEditKey(model.apiKey);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, model.apiKey]);

  const handleUpdate = () => {
    if (editKey.trim() && editKey !== model.apiKey) {
      onUpdate(model.id, editKey.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditKey(model.apiKey);
    setIsEditing(false);
  };

  // Mask key logic (e.g. ************abcd)
  const maskedKey = 
    model.apiKey.length > 4 
      ? "*".repeat(12) + model.apiKey.slice(-4)
      : "*".repeat(8);

  return (
    <div className="flex flex-col py-3 border-b border-border-default/50 last:border-0 group">
      <div className="flex items-center justify-between">
        
        {/* Left side: Logo & Info */}
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="w-8 h-8 rounded bg-bg-surface border border-border-default flex items-center justify-center shrink-0">
            <ProviderLogo provider={model.provider} className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">
              {model.name}
            </span>
            
            {/* Inline Editor for API Key */}
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex-1 max-w-[200px]">
                  <input
                    type={showKey ? "text" : "password"}
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    className="w-full bg-bg-surface border border-accent rounded px-2 py-1 text-xs text-text-primary focus:outline-none pr-8"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showKey ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  onClick={handleUpdate}
                  className="p-1 rounded text-success hover:bg-success/10 transition-colors"
                  title="Save"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 rounded text-text-secondary hover:bg-bg-surface transition-colors"
                  title="Cancel"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-text-secondary font-mono truncate">
                {maskedKey}
              </span>
            )}
          </div>
        </div>

        {/* Right side: 3-dot menu */}
        <div className="relative ml-2 shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Options"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 w-40 bg-bg-canvas rounded-lg shadow-lg border border-border-default py-1 z-10"
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-subtle flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Update API Key
                </button>
                <button
                  onClick={() => {
                    onDelete(model.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Model
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
