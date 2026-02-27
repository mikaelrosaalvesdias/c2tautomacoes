"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

type LoginState = "idle" | "loading" | "error";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        setLoginState("error");
        setErrorMessage("Preencha todos os campos.");
        triggerShake();
        return;
      }
      setLoginState("loading");
      setErrorMessage("");

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password })
        });

        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          setLoginState("error");
          setErrorMessage("Credenciais inválidas. Tente novamente.");
          triggerShake();
        }
      } catch {
        setLoginState("error");
        setErrorMessage("Erro de conexão. Tente novamente.");
        triggerShake();
      }
    },
    [email, password, router]
  );

  return (
    <div className="noise-bg relative min-h-screen overflow-hidden bg-background">
      {/* Background orbs */}
      <div
        className="animate-float-slow animate-pulse-glow pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.27 295 / 0.4), transparent 70%)" }}
      />
      <div
        className="animate-float-slow pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, oklch(0.85 0.25 131 / 0.3), transparent 70%)", animationDelay: "-7s" }}
      />
      <div
        className="animate-float-slow pointer-events-none absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.17 85 / 0.4), transparent 70%)", animationDelay: "-13s" }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Left branding panel — desktop only */}
        <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16">
          <div className="animate-fade-in-up">
            <div className="mb-2">
              <h1 className="font-display text-4xl font-800 tracking-tight text-foreground">
                <span className="text-neon">C2</span>Tech
              </h1>
              <div
                className="animate-neon-line mt-1 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, #7CFC00, oklch(0.55 0.27 295))", maxWidth: "80px" }}
              />
            </div>
            <p className="mt-4 max-w-md text-lg text-muted-foreground leading-relaxed">
              Painel de automações inteligentes para gestão de suporte, ações e comunicação comercial.
            </p>
          </div>

          <div className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.2s" }}>
            <FeatureItem
              icon={<Zap className="h-5 w-5 text-neon" />}
              title="Automação Inteligente"
              description="Processe ações de suporte e cancelamento automaticamente com regras configuráveis."
            />
            <FeatureItem
              icon={<BarChart3 className="h-5 w-5 text-gold" />}
              title="Visão 360° do Cliente"
              description="Acompanhe toda a jornada do cliente em um único painel unificado."
            />
            <FeatureItem
              icon={<Shield className="h-5 w-5 text-violet" />}
              title="Controle Total"
              description="Gerencie inbox, emails comerciais e cancelamentos com rastreabilidade completa."
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-muted-foreground/60">
              © {new Date().getFullYear()} C2Tech. Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[45%] lg:px-12">
          <div
            className={`animate-fade-in-up w-full max-w-md ${shakeCard ? "animate-shake" : ""}`}
            style={{ animationDelay: "0.15s" }}
          >
            {/* Mobile logo */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="font-display text-3xl font-800 tracking-tight text-foreground">
                <span className="text-neon">C2</span>Tech
              </h1>
              <div
                className="animate-neon-line mx-auto mt-1 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, #7CFC00, oklch(0.55 0.27 295))", maxWidth: "120px" }}
              />
              <p className="mt-3 text-sm text-muted-foreground">Painel de Automações</p>
            </div>

            {/* Login card */}
            <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
              {/* Purple/green glow behind card */}
              <div
                className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl opacity-40 blur-2xl"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.27 295 / 0.3), transparent 50%, oklch(0.85 0.25 131 / 0.15))" }}
              />
              {/* Top accent line */}
              <div
                className="absolute top-0 right-0 left-0 h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.25 131 / 0.5), oklch(0.55 0.27 295 / 0.5), transparent)" }}
              />

              <CardContent className="p-8 sm:p-10">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-700 text-foreground">Acessar painel</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>
                </div>

                {loginState === "error" && (
                  <Alert className="mb-6 border-destructive/30 bg-destructive/10">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <AlertDescription className="text-sm text-destructive">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-500 text-muted-foreground">
                      Email ou Usuário
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (loginState === "error") setLoginState("idle"); }}
                      disabled={loginState === "loading"}
                      className="h-12 border-border/60 bg-input/80 px-4 placeholder:text-muted-foreground/50 focus-visible:border-neon/50 focus-visible:ring-neon/20"
                      autoComplete="username"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-500 text-muted-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (loginState === "error") setLoginState("idle"); }}
                        disabled={loginState === "loading"}
                        className="h-12 border-border/60 bg-input/80 pr-12 pl-4 placeholder:text-muted-foreground/50 focus-visible:border-neon/50 focus-visible:ring-neon/20"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(v) => setRememberMe(v === true)}
                        disabled={loginState === "loading"}
                      />
                      <Label htmlFor="remember" className="font-400 text-muted-foreground select-none cursor-pointer">
                        Lembrar-me
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gold/80 transition-colors hover:text-gold hover:underline underline-offset-4"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loginState === "loading"}
                    className="h-12 w-full font-display text-base font-600 tracking-wide bg-neon text-black hover:bg-neon/90 hover:shadow-[0_0_24px_rgba(124,252,0,0.35)] transition-all duration-300 disabled:opacity-60"
                  >
                    {loginState === "loading" ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Autenticando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-xs text-muted-foreground/50">
              <a href="/privacy" className="hover:text-muted-foreground">Política de Privacidade</a>
              {" · "}
              <a href="/terms" className="hover:text-muted-foreground">Termos de Uso</a>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground/40 lg:hidden">
              © {new Date().getFullYear()} C2Tech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-secondary/60">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-sm font-600 text-foreground">{title}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
