"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setError("Usuário ou senha inválidos.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #0d1a0d 0%, #0a0a0f 60%)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#1e2e1e] bg-[#0f130f] p-8 shadow-2xl"
        style={{ boxShadow: "0 0 40px 0 rgba(163,230,53,0.08), 0 0 0 1px rgba(163,230,53,0.10)" }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            C2Tech
          </h1>
          <div className="mx-auto mt-1 h-0.5 w-12 rounded-full bg-neon" />
          <p className="mt-3 text-sm text-muted-foreground">Painel de Automações</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email ou Usuário"
            autoComplete="username"
            required
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#555]"
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              required
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#555] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

          {error ? (
            <p className="text-center text-sm text-red-400">{error}</p>
          ) : null}

          <Button type="submit" className="mt-2 w-full h-11 text-base" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        <a href="/privacy" className="hover:text-muted-foreground">Política de Privacidade</a>
        {" · "}
        <a href="/terms" className="hover:text-muted-foreground">Termos de Uso</a>
        {" · "}
        © {new Date().getFullYear()} C2Tech. Todos os direitos reservados.
      </p>
    </div>
  );
}
