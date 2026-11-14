import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { User, UserKey } from "@/domain/users/user.types";

interface ConfiguredUser extends User {
  pin: string;
}

function configured(): ConfiguredUser[] {
  const users: ConfiguredUser[] = [
    { key: "a", name: process.env.USER_A_NAME ?? "", pin: process.env.USER_A_PIN ?? "" },
    { key: "b", name: process.env.USER_B_NAME ?? "", pin: process.env.USER_B_PIN ?? "" },
  ];
  for (const u of users) {
    if (!u.name || !u.pin) throw new Error(`USER_${u.key.toUpperCase()}_NAME / _PIN are not set`);
  }
  return users;
}

export function getUser(key: UserKey): User {
  const { name } = configured().find((u) => u.key === key)!;
  return { key, name };
}

export function getUsers(): Record<UserKey, User> {
  return { a: getUser("a"), b: getUser("b") };
}

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Constant-time lookup: always compares against both PINs. */
export function findUserByPin(pin: string): User | null {
  let match: User | null = null;
  for (const u of configured()) {
    if (timingSafeEqual(digest(pin), digest(u.pin))) match = { key: u.key, name: u.name };
  }
  return match;
}
