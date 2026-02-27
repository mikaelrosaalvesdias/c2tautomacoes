import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#1A1A1A",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
      }}
    >
      {/* Card com glow roxo */}
      <div
        className="w-full max-w-md p-8 rounded-3xl border-2"
        style={{
          backgroundColor: "#2C2C2C",
          borderColor: "#8A2BE2",
          boxShadow: "0 0 40px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.1)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span style={{ color: "#FFFFFF" }}>C2</span>
            <span style={{ color: "#FFFFFF" }}>Tech</span>
          </h1>
          <p className="text-gray-400 text-lg">Painel de Automações</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email ou Usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #8A2BE2",
              }}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#8A2BE2",
                border: "1px solid #8A2BE2",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-black text-lg transition-all hover:shadow-lg hover:shadow-green-500/50"
            style={{
              backgroundColor: "#00FF00",
              color: "#000000",
            }}
          >
            Entrar
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-6">
          <a href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm">
            Esqueceu a senha?
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: "#8A2BE2" }}>
          <p className="text-gray-500 text-xs">© 2024 C2Tech. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
