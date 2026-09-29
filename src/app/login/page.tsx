import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PinForm } from "./PinForm";

export const metadata = { title: "Entrar · Our Little World" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <p className="text-meta text-muted">Solo para dos</p>
      <h1 className="mt-2 font-display text-h1 text-ink">Our Little World</h1>
      <p className="mt-3 text-muted">Pon tu PIN para entrar a nuestro mundito.</p>
      <PinForm />
    </main>
  );
}
