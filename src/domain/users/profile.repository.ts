import type { PetId } from "./pets";
import type { Profile, UserKey } from "./user.types";

export interface ProfileRepository {
  getAll(): Promise<Profile[]>;
  setPet(userKey: UserKey, pet: PetId): Promise<void>;
}
