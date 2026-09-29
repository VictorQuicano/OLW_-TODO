import { PetPicker } from "@/components/pets/PetPicker";
import { requireUser } from "@/lib/auth/session";
import { profileRepository } from "@/lib/storage";

export const metadata = { title: "Elige tu mascota · Our Little World" };

export default async function ChoosePetPage() {
  const user = await requireUser();
  const current = (await profileRepository.getAll()).find((p) => p.userKey === user.key)?.pet;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8 md:pt-16">
      <p className="text-meta text-muted">{current ? "¿Te cambias de look?" : `Hola, ${user.name}`}</p>
      <h1 className="mt-1 font-display text-h1 text-ink">¿Quién te acompaña en el mundito?</h1>
      <PetPicker initial={current} />
    </main>
  );
}
