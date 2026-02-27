"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  user: string;
  onNavigate?: () => void;
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/acoes", label: "Ações" },
  { href: "/cancelamentos", label: "Cancelamentos" },
  { href: "/emails", label: "Emails" }
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SidebarNav({ user, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Painel C2Tech</h2>
        <p className="mt-1 text-xs text-slate-500">Conectado como {user}</p>
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
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
