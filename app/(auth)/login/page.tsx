import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSessionFromCookieStore } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSessionFromCookieStore();
  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <LoginForm />
    </main>
  );
}
