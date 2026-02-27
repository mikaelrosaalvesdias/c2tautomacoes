import { AppShell } from "@/components/AppShell";
import { requirePageAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageAuth();

  return <AppShell user={session.user}>{children}</AppShell>;
}
