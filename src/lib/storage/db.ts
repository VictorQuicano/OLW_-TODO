import "server-only";
import { createClient, type Client } from "@libsql/client";

const globalForDb = globalThis as unknown as { __libsql?: Client };

/** Single libSQL client per server process (survives dev hot reloads). */
export function getDb(): Client {
  if (!globalForDb.__libsql) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    globalForDb.__libsql = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return globalForDb.__libsql;
}
