import "server-only";
import type { Row } from "@libsql/client";
import type { ItemRepository } from "@/domain/items/item.repository";
import type { DatePrecision, Item, ItemDetails, ItemStatus, ItemType } from "@/domain/items/item.types";
import type { UserKey } from "@/domain/users/user.types";
import { getDb } from "./db";

const COLUMNS = `id, type, title, description, image_url, status, date_value, date_precision,
  location, external_url, notes, details, completed_a, completed_b, created_by, created_at, updated_at`;

const opt = (v: unknown) => (v == null ? undefined : String(v));

function toItem(row: Row): Item {
  return {
    id: String(row.id),
    type: row.type as ItemType,
    title: String(row.title),
    description: opt(row.description),
    imageUrl: opt(row.image_url),
    status: row.status as ItemStatus,
    plannedDate:
      row.date_value == null
        ? undefined
        : { value: String(row.date_value), precision: row.date_precision as DatePrecision },
    location: opt(row.location),
    externalUrl: opt(row.external_url),
    notes: opt(row.notes),
    details: JSON.parse(String(row.details)) as ItemDetails,
    completion: { a: row.completed_a === 1, b: row.completed_b === 1 },
    createdBy: row.created_by as UserKey,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// Plans first (soonest date), then ideas, then completed; newest first within each group.
const ORDER = `ORDER BY CASE status WHEN 'planned' THEN 0 WHEN 'idea' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END,
  CASE WHEN status = 'planned' THEN date_value END ASC, created_at DESC`;

export const tursoItemRepository: ItemRepository = {
  async listByType(type) {
    const rs = await getDb().execute({
      sql: `SELECT ${COLUMNS} FROM items WHERE type = ? AND status != 'archived' ${ORDER}`,
      args: [type],
    });
    return rs.rows.map(toItem);
  },

  async listAll() {
    const rs = await getDb().execute(`SELECT ${COLUMNS} FROM items WHERE status != 'archived' ${ORDER}`);
    return rs.rows.map(toItem);
  },

  async countByType() {
    const rs = await getDb().execute(
      "SELECT type, count(*) AS n FROM items WHERE status != 'archived' GROUP BY type",
    );
    return Object.fromEntries(rs.rows.map((r) => [String(r.type), Number(r.n)]));
  },

  async getById(id) {
    const rs = await getDb().execute({ sql: `SELECT ${COLUMNS} FROM items WHERE id = ?`, args: [id] });
    return rs.rows[0] ? toItem(rs.rows[0]) : null;
  },

  async create(input) {
    const rs = await getDb().execute({
      sql: `INSERT INTO items (id, type, title, status, date_value, date_precision, location, external_url,
              notes, details, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING ${COLUMNS}`,
      args: [
        crypto.randomUUID(),
        input.type,
        input.title,
        input.status,
        input.plannedDate?.value ?? null,
        input.plannedDate?.precision ?? null,
        input.location ?? null,
        input.externalUrl ?? null,
        input.notes ?? null,
        JSON.stringify(input.details ?? {}),
        input.createdBy,
      ],
    });
    return toItem(rs.rows[0]);
  },

  async update(id, patch) {
    const sets: string[] = [];
    const args: (string | number | null)[] = [];
    if (patch.status) {
      sets.push("status = ?");
      args.push(patch.status);
    }
    if (patch.completion) {
      sets.push("completed_a = ?", "completed_b = ?");
      args.push(patch.completion.a ? 1 : 0, patch.completion.b ? 1 : 0);
    }
    if ("plannedDate" in patch) {
      sets.push("date_value = ?", "date_precision = ?");
      args.push(patch.plannedDate?.value ?? null, patch.plannedDate?.precision ?? null);
    }
    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')");
    const rs = await getDb().execute({
      sql: `UPDATE items SET ${sets.join(", ")} WHERE id = ? RETURNING ${COLUMNS}`,
      args: [...args, id],
    });
    if (!rs.rows[0]) throw new Error(`Item ${id} not found`);
    return toItem(rs.rows[0]);
  },
};
