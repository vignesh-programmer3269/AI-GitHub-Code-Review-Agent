import { config } from "../config/index.js";

class SessionService {
  constructor() {
    this.sessions = new Map();
    this.startCleanupInterval();
  }

  create(sessionId, context) {
    this.sessions.set(sessionId, context);
  }

  read(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  update(sessionId, partialUpdate) {
    const context = this.read(sessionId);
    if (!context) return null;
    
    const updatedContext = { ...context, ...partialUpdate };
    this.sessions.set(sessionId, updatedContext);
    return updatedContext;
  }

  delete(sessionId) {
    return this.sessions.delete(sessionId);
  }

  has(sessionId) {
    return this.sessions.has(sessionId);
  }

  touch(sessionId) {
    const context = this.read(sessionId);
    if (context) {
      context.lastAccessedAt = new Date().toISOString();
    }
  }

  getAll() {
    return Array.from(this.sessions.entries());
  }

  cleanup() {
    const now = Date.now();
    const ttlMs = config.sessionTtlMinutes * 60 * 1000;
    
    for (const [sessionId, context] of this.sessions.entries()) {
      const lastAccessed = new Date(context.lastAccessedAt).getTime();
      if (now - lastAccessed > ttlMs) {
        this.sessions.delete(sessionId);
      }
    }
  }

  startCleanupInterval() {
    // Run cleanup every minute in the background
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
    // Ensure the interval doesn't block the Node.js event loop from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
}

export const sessionService = new SessionService();
