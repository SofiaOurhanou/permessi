"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readStoredUser } from "@/lib/client-auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const u = readStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.ruolo === "RESPONSABILE") {
      router.replace("/dashboard/responsabile");
    } else {
      router.replace("/dashboard/dipendente");
    }
  }, [router]);

  return (
    <p className="px-4 py-16 text-center font-mono text-lg font-black uppercase tracking-[0.4em] text-brut-deep">
      Redirect in corso… non blinkare o perdi frame.
    </p>
  );
}
