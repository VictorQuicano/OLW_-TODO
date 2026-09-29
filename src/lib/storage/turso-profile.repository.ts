import "server-only";
import type { ProfileRepository } from "@/domain/users/profile.repository";
import { isPetId } from "@/domain/users/pets";
import type { Profile, UserKey } from "@/domain/users/user.types";
import { getDb } from "./db";

export const tursoProfileRepository: ProfileRepository = {
  async getAll() {
    const rs = await getDb().execute("SELECT user_key, pet FROM profiles");
    return rs.rows.flatMap((r): Profile[] =>
      isPetId(r.pet) ? [{ userKey: r.user_key as UserKey, pet: r.pet }] : [],
    );
  },

  async setPet(userKey, pet) {
    await getDb().execute({
      sql: `INSERT INTO profiles (user_key, pet) VALUES (?, ?)
            ON CONFLICT (user_key) DO UPDATE SET pet = excluded.pet,
              updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
      args: [userKey, pet],
    });
  },
};
