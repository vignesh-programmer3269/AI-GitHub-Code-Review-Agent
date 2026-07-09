import { useState, useEffect } from "react";

const PROVIDER_KEYS_STORAGE_KEY = "ai_reviewer_provider_keys";
const SELECTED_MODEL_KEY = "ai_reviewer_selected_model";

export function useModels() {
  const [providerKeys, setProviderKeys] = useState(() => {
    try {
      // Migrate from old storage format if needed, but for now we just use the new key or fallback
      const stored = localStorage.getItem(PROVIDER_KEYS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error parsing stored keys:", err);
      return [];
    }
  });
  
  const [selectedModelId, setSelectedModelId] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_MODEL_KEY) || null;
    } catch {
      return null;
    }
  });

  // Save changes to localStorage whenever keys array changes
  useEffect(() => {
    localStorage.setItem(PROVIDER_KEYS_STORAGE_KEY, JSON.stringify(providerKeys));
  }, [providerKeys]);

  useEffect(() => {
    if (selectedModelId) {
      localStorage.setItem(SELECTED_MODEL_KEY, selectedModelId);
    } else {
      localStorage.removeItem(SELECTED_MODEL_KEY);
    }
  }, [selectedModelId]);

  const addKey = (providerId, providerName, apiKey) => {
    // If provider already exists, this function shouldn't ideally be called (updateKey should be used),
    // but we can handle it safely by filtering out old one.
    const newProviderKey = {
      providerId,
      name: providerName,
      apiKey,
      createdAt: new Date().toISOString(),
    };
    setProviderKeys((prev) => [...prev.filter(p => p.providerId !== providerId), newProviderKey]);
  };

  const updateKey = (providerId, newApiKey) => {
    setProviderKeys((prev) =>
      prev.map((p) => (p.providerId === providerId ? { ...p, apiKey: newApiKey } : p))
    );
  };

  const deleteKey = (providerId) => {
    setProviderKeys((prev) => prev.filter((p) => p.providerId !== providerId));
  };

  const selectModel = (modelId) => {
    setSelectedModelId(modelId);
  };

  const getProviderKey = (providerId) => {
    return providerKeys.find((p) => p.providerId === providerId) || null;
  };

  return {
    providerKeys,
    selectedModelId,
    addKey,
    updateKey,
    deleteKey,
    selectModel,
    getProviderKey,
  };
}
