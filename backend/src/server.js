import app from "./app.js";
import { config } from "./config/index.js";

// Use Express's built‑in listen (which creates an HTTP server internally)
const server = app.listen(config.port, () => {
  const address = server.address();
  const port = typeof address === "string" ? address : address?.port;
  console.log(
    `🚀 Backend listening on http://${config.host}:${port} (env: ${config.env})`,
  );
});
