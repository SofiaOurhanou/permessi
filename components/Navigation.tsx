"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSession,
  readStoredUser,
  type StoredUser,
} from "@/lib/client-auth";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setUser(readStoredUser());
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const hideNav = pathname === "/login" || pathname === "/register";
  if (hideNav) return null;

  function logout() {
    clearSession();
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="border-b-4 border-brut-ink bg-brut-hot text-white shadow-[0_6px_0_0_#0a0a0a]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-black uppercase tracking-widest text-white underline decoration-4 decoration-brut-acid underline-offset-4 hover:bg-brut-acid hover:text-brut-ink hover:no-underline"
        >
          Permessi.exe
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {!user ? (
            <>
              <Link
                className={navLinkClass(pathname === "/login")}
                href="/login"
              >
                Entra qui
              </Link>
              <Link
                className={navLinkClass(pathname === "/register")}
                href="/register"
              >
                Nuovo NPC
              </Link>
              <Link
                className={navLinkClass(pathname === "/api-docs")}
                href="/api-docs"
              >
                Spaghetti API
              </Link>
            </>
          ) : (
            <>
              {user.ruolo === "DIPENDENTE" && (
                <Link
                  className={navLinkClass(pathname === "/dashboard/dipendente")}
                  href="/dashboard/dipendente"
                >
                  La mia lore
                </Link>
              )}
              {user.ruolo === "RESPONSABILE" && (
                <>
                  <Link
                    className={navLinkClass(
                      pathname === "/dashboard/responsabile",
                    )}
                    href="/dashboard/responsabile"
                  >
                    Sì/no vibes
                  </Link>
                  <Link
                    className={navLinkClass(pathname === "/statistiche")}
                    href="/statistiche"
                  >
                    Numeri cursed
                  </Link>
                </>
              )}
              <Link
                className={navLinkClass(pathname === "/api-docs")}
                href="/api-docs"
              >
                Spaghetti API
              </Link>
              <button
                type="button"
                onClick={logout}
                className="border-4 border-brut-ink bg-brut-bad px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0_0_#0a0a0a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                Logout lore
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function navLinkClass(active: boolean) {
  const base =
    "border-4 border-brut-ink px-2 py-1 font-mono text-xs font-black uppercase tracking-wide shadow-[3px_3px_0_0_#0a0a0a] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none";
  return active
    ? `${base} bg-brut-acid text-brut-ink`
    : `${base} bg-white/20 text-white hover:bg-brut-acid hover:text-brut-ink`;
}
