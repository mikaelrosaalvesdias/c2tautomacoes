"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  user: string;
  role?: string;
  onNavigate?: () => void;
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/acoes", label: "Ações" },
  { href: "/cancelamentos", label: "Cancelamentos" },
  { href: "/emails", label: "Emails" }
];

const adminLinks = [
  { href: "/configuracoes/usuarios", label: "Usuários" }
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SidebarNav({ user, role, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/30 p-5">
        <h2 className="font-display text-lg font-700 text-foreground">
          <span className="text-neon">C2</span>Tech
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Conectado como {user}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-500 transition-colors",
                active
                  ? "border border-neon/20 bg-neon/15 text-neon"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-xs font-600 uppercase tracking-wider text-muted-foreground/60">
                Configurações
              </p>
            </div>
            {adminLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-500 transition-colors",
                    active
                      ? "border border-neon/20 bg-neon/15 text-neon"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
