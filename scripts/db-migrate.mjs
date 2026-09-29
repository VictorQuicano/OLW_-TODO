// Applies pending SQL migrations from src/lib/storage/migrations in filename order.
// Usage: pnpm db:migrate  (reads .env.local; in CI/Vercel the env vars come from the platform)
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
const dir = join(import.meta.dirname, "..", "src", "lib", "storage", "migrations");

await db.execute(`CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
)`);

const applied = new Set((await db.execute("SELECT name FROM _migrations")).rows.map((r) => r.name));
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const sql = await readFile(join(dir, file), "utf8");
  // One statement per `;` at end of line — keep migrations free of inline semicolons.
  const statements = sql.split(/;\s*$/m).map((s) => s.trim()).filter(Boolean);
  await db.batch(
    [...statements, { sql: "INSERT INTO _migrations (name) VALUES (?)", args: [file] }],
    "write",
  );
  console.log(`applied ${file}`);
}

console.log(`database ready (${url.startsWith("file:") ? url : "remote"})`);
db.close();
