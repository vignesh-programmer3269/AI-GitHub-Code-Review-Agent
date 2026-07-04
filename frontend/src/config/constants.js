export const config = {
  host: import.meta.env.VITE_HOST || "localhost",
  port: import.meta.env.VITE_PORT || 3000,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  env: import.meta.env.VITE_ENV || "development",
};

export const AVAILABLE_MODELS = [
  {
    id: "anthropic",
    name: "Claude",
    logo: "anthropic",
    models: [
      {
        id: "claude-opus-4.8",
        label: "Claude Opus 4.8",
        recommended: false,
      },
      {
        id: "claude-sonnet-5",
        label: "Claude Sonnet 5",
        recommended: true,
      },
      {
        id: "claude-haiku-4.5",
        label: "Claude Haiku 4.5",
        recommended: false,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "openai",
    models: [
      {
        id: "gpt-5.5",
        label: "GPT-5.5",
        recommended: true,
      },
      {
        id: "gpt-5.5-pro",
        label: "GPT-5.5 Pro",
        recommended: false,
      },
      {
        id: "gpt-5.4-mini",
        label: "GPT-5.4 Mini",
        recommended: false,
      },
      {
        id: "gpt-5.4-nano",
        label: "GPT-5.4 Nano",
        recommended: false,
      },
      {
        id: "gpt-oss-120b",
        label: "GPT OSS 120B",
        recommended: false,
      },
      {
        id: "gpt-oss-20b",
        label: "GPT OSS 20B",
        recommended: false,
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    logo: "gemini",
    models: [
      {
        id: "gemini-3.5-flash",
        label: "Gemini 3.5 Flash",
        recommended: false,
      },
      {
        id: "gemini-3.1-pro-preview",
        label: "Gemini 3.1 Pro Preview",
        recommended: false,
      },
      {
        id: "gemini-3.1-flash-lite",
        label: "Gemini 3.1 Flash Lite",
        recommended: false,
      },
      {
        id: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        recommended: true,
      },
      {
        id: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        recommended: false,
      },
      {
        id: "gemini-2.5-flash-lite",
        label: "Gemini 2.5 Flash Lite",
        recommended: false,
      },
    ],
  },
];
