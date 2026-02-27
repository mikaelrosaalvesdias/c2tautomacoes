"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Zap, XCircle, Mail, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  user: string;
  role?: string;
  onNavigate?: () => void;
};

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/acoes", label: "Ações", icon: Zap },
  { href: "/cancelamentos", label: "Cancelamentos", icon: XCircle },
  { href: "/emails", label: "Emails", icon: Mail }
];

const adminLinks = [
  { href: "/configuracoes/usuarios", label: "Usuários", icon: Users }
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SidebarNav({ user, role, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-border/30 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10 border border-neon/30">
            <Zap className="h-4 w-4 text-neon" />
          </div>
          <div>
            <h2 className="font-display text-base font-700 leading-none text-foreground">
              <span className="text-neon">C2</span>Tech
            </h2>
            <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">automacoes_c2tech</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-500 transition-all",
                active
                  ? "bg-neon text-black font-600 shadow-[0_0_12px_rgba(124,252,0,0.25)]"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-5 pb-1.5">
              <p className="text-[10px] font-600 uppercase tracking-widest text-muted-foreground/50">
                Configurações
              </p>
            </div>
            {adminLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-500 transition-all",
                    active
                      ? "bg-neon text-black font-600"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neon/20 text-neon text-xs font-700">
            {user.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-xs text-muted-foreground">{user}</span>
        </div>
      </div>
    </div>
  );
}
