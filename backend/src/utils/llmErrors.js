export class LLMError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "LLMError";
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = {
  INVALID_PROVIDER: "INVALID_PROVIDER",
  INVALID_MODEL: "INVALID_MODEL",
  INVALID_API_KEY: "INVALID_API_KEY",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  NETWORK_ERROR: "NETWORK_ERROR",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Masks an API key in error messages.
 */
export function maskString(str) {
  if (!str) return str;
  return str.length > 8
    ? `${str.slice(0, 4)}***${str.slice(-4)}`
    : "***";
}

/**
 * Normalizes SDK errors into standard LLMErrors.
 */
export function normalizeProviderError(error, providerName) {
  let message = error.message || "An unknown error occurred.";
  
  // Ensure we don't accidentally leak keys in the message
  message = message.replace(/(sk-[a-zA-Z0-9_-]+)/g, maskString("$1"));
  message = message.replace(/(AIza[0-9A-Za-z-_]+)/g, maskString("$1"));

  if (error instanceof LLMError) {
    return error;
  }

  // Anthropic / OpenAI common error structures
  const status = error.status || error.statusCode || error.response?.status;
  const code = error.error?.code || error.code;

  if (status === 401 || code === "invalid_api_key" || message.toLowerCase().includes("api key") || message.toLowerCase().includes("authentication") || message.toLowerCase().includes("unauthorized")) {
    return new LLMError(ErrorCodes.INVALID_API_KEY, `Authentication failed with ${providerName}. The API key is invalid.`);
  }

  if (status === 429 || code === "rate_limit_exceeded" || message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many requests")) {
    return new LLMError(ErrorCodes.RATE_LIMIT_EXCEEDED, `${providerName} rate limit exceeded.`);
  }

  if (status === 402 || status === 403 || message.toLowerCase().includes("quota") || message.toLowerCase().includes("billing")) {
    return new LLMError(ErrorCodes.QUOTA_EXCEEDED, `${providerName} quota exceeded or billing issue.`);
  }

  if (status === 404 || code === "model_not_found" || message.toLowerCase().includes("model not found")) {
    return new LLMError(ErrorCodes.INVALID_MODEL, `The selected model is not supported or does not exist on ${providerName}.`);
  }

  if (error.name === "AbortError" || error.code === "ECONNABORTED" || message.toLowerCase().includes("timeout")) {
    return new LLMError(ErrorCodes.REQUEST_TIMEOUT, `Request to ${providerName} timed out.`);
  }

  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || message.toLowerCase().includes("network")) {
    return new LLMError(ErrorCodes.NETWORK_ERROR, `Network error communicating with ${providerName}.`);
  }

  return new LLMError(ErrorCodes.PROVIDER_ERROR, `${providerName} error: ${message}`);
}
