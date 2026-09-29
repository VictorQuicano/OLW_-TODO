import "server-only";
import { createItemService } from "@/domain/items/item.service";
import { tursoItemRepository } from "./turso-item.repository";
import { tursoProfileRepository } from "./turso-profile.repository";

// The only place that knows which storage provider backs the app.
export const itemService = createItemService(tursoItemRepository);
export const profileRepository = tursoProfileRepository;
