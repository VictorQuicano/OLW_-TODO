import type { PetId } from "./pets";

export type UserKey = "a" | "b";

export interface User {
  key: UserKey;
  name: string;
}

export interface Profile {
  userKey: UserKey;
  pet: PetId;
}

export function otherUser(key: UserKey): UserKey {
  return key === "a" ? "b" : "a";
}
