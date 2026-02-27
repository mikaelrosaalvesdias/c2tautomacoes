"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Settings, Menu } from "lucide-react";
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

export function AppShell({ user, role, children, title }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentTitle = useMemo(() => title || getTitle(pathname), [pathname, title]);

  return (
    <div className="noise-bg min-h-screen bg-background text-foreground">
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden border-r border-border/40 bg-[#0a0a0f] lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <SidebarNav user={user} role={role} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-border/40 bg-[#0a0a0f]/90 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
              {/* Left: hamburger + title */}
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
                  onClick={() => setOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="font-display text-sm font-600 text-foreground">{currentTitle}</span>
              </div>

              {/* Right: search + icons + logout */}
              <div className="flex items-center gap-1.5">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="h-8 w-44 rounded-md border border-border/60 bg-secondary/60 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-neon/40"
                  />
                </div>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Bell className="h-4.5 w-4.5" />
                </button>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon/20 text-neon text-xs font-700 border border-neon/30">
                  {user.charAt(0).toUpperCase()}
                </div>
                <LogoutButton compact />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn("fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border/40 bg-[#0a0a0f] shadow-xl transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav user={user} role={role} onNavigate={() => setOpen(false)} />
      </aside>
    </div>
  );
}

export default AppShell;
