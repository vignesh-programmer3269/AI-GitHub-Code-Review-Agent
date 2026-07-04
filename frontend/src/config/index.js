export const config = {
  host: import.meta.env.VITE_HOST || "localhost",
  port: import.meta.env.VITE_PORT || 3000,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  env: import.meta.env.VITE_ENV || "development",
};
