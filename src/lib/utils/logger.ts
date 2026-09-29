/** Tiny structured logger; swap for Sentry or similar only if it becomes necessary. */
export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(`[olw] ${message}`, context ?? "");
  },
};
