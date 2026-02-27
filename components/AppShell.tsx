"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/SidebarNav";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  user: string;
  role?: string;
  children: React.ReactNode;
  title?: string;
};

function getTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/inbox")) return "Inbox";
  if (pathname.startsWith("/acoes")) return "Ações";
  if (pathname.startsWith("/cancelamentos")) return "Cancelamentos";
  if (pathname.startsWith("/emails")) return "Emails";
  if (pathname.startsWith("/configuracoes/usuarios")) return "Usuários";
  if (pathname.startsWith("/configuracoes")) return "Configurações";
  return "Painel";
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AppShell({ user, role, children, title }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentTitle = useMemo(() => title || getTitle(pathname), [pathname, title]);

  return (
    <div className="noise-bg min-h-screen bg-[#050507] text-foreground">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border/40 bg-[#090d16]/80 backdrop-blur-xl lg:block">
          <SidebarNav user={user} role={role} />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border/40 bg-[#0b0f19]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-secondary/40 hover:text-foreground lg:hidden"
                  onClick={() => setOpen(true)}
                >
                  <MenuIcon />
                </Button>
                <p className="font-display text-sm font-600 tracking-wide text-foreground">{currentTitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">{user}</span>
                <LogoutButton compact />
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border/40 bg-[#090d16]/95 shadow-xl backdrop-blur-xl transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav user={user} role={role} onNavigate={() => setOpen(false)} />
      </aside>
    </div>
  );
}

export default AppShell;
