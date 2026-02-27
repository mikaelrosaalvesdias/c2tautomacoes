"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      size={compact ? "sm" : "md"}
      className={compact ? "" : "w-full"}
    >
      Sair
    </Button>
  );
}
