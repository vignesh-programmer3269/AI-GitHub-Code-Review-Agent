import { useState, useEffect } from "react";

const MODELS_STORAGE_KEY = "ai_reviewer_models";
const SELECTED_MODEL_KEY = "ai_reviewer_selected_model";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useModels() {
  const [models, setModels] = useState(() => {
    try {
      const stored = localStorage.getItem(MODELS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error parsing stored models:", err);
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

  // Save changes to localStorage whenever models array changes
  useEffect(() => {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    if (selectedModelId) {
      localStorage.setItem(SELECTED_MODEL_KEY, selectedModelId);
    } else {
      localStorage.removeItem(SELECTED_MODEL_KEY);
    }
  }, [selectedModelId]);

  const addModel = (provider, modelName, apiKey) => {
    const newModel = {
      id: generateId(),
      provider,
      name: modelName,
      apiKey,
      createdAt: new Date().toISOString(),
    };
    setModels((prev) => [...prev, newModel]);
    setSelectedModelId(newModel.id);
  };

  const updateModelKey = (id, newApiKey) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, apiKey: newApiKey } : m))
    );
  };

  const deleteModel = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModelId === id) {
      setSelectedModelId(null);
    }
  };

  const selectModel = (id) => {
    setSelectedModelId(id);
  };

  const getSelectedModel = () => {
    return models.find((m) => m.id === selectedModelId) || null;
  };

  return {
    models,
    selectedModelId,
    addModel,
    updateModelKey,
    deleteModel,
    selectModel,
    getSelectedModel,
  };
}
