import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User, UserKey } from "@/domain/users/user.types";
import { getUser } from "./users";

export const SESSION_COOKIE = "olw_session";
const MAX_AGE_S = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

async function hmac(data: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

async function verify(token: string): Promise<UserKey | null> {
  const [key, expires, sig] = token.split(".");
  if ((key !== "a" && key !== "b") || !expires || !sig) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  const expected = await hmac(`${key}.${expires}`);
  // Both are base64url of a SHA-256 → same length; compare without early exit.
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? key : null;
}

export async function createSession(key: UserKey): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = `${key}.${expires}`;
  (await cookies()).set(SESSION_COOKIE, `${payload}.${await hmac(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Memoized per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const key = token ? await verify(token) : null;
  return key ? getUser(key) : null;
});

/** Use at every server boundary (pages, actions). Redirects to /login when signed out. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
