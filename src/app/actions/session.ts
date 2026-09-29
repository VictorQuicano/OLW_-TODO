"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isPetId } from "@/domain/users/pets";
import { createSession, destroySession, requireUser } from "@/lib/auth/session";
import { findUserByPin } from "@/lib/auth/users";
import { profileRepository } from "@/lib/storage";

const pinSchema = z.string().regex(/^\d{4,8}$/);

export async function loginAction(_prev: { error: string; at: number } | null, formData: FormData) {
  const pin = pinSchema.safeParse(formData.get("pin"));
  const user = pin.success ? findUserByPin(pin.data) : null;
  if (!user) return { error: "Ese PIN no es de aquí. Prueba otra vez.", at: Date.now() };
  await createSession(user.key);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function choosePetAction(pet: string) {
  const user = await requireUser();
  if (!isPetId(pet)) return { error: "Esa mascota no existe" };
  await profileRepository.setPet(user.key, pet);
  revalidatePath("/", "layout");
  redirect("/");
}
