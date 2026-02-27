import { BarChart3, Mail, Zap, X, Send, Users, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (path: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/" },
    { id: "inbox", label: "Inbox", icon: Mail, path: "/inbox" },
    { id: "acoes", label: "Ações", icon: Zap, path: "/acoes" },
    { id: "cancelamentos", label: "Cancelamentos", icon: X, path: "/cancelamentos" },
    { id: "emails", label: "Emails", icon: Send, path: "/emails" },
  ];

  return (
    <div className="w-64 border-r" style={{ borderColor: "#2C2C2C", backgroundColor: "#1A1A1A" }}>
      <div className="p-6 space-y-8 h-full flex flex-col">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-sm font-mono tracking-wider" style={{ color: "#00FF00" }}>
            automacoes_c2tech
          </h1>
          <div className="h-1 w-16" style={{ backgroundColor: "#00FF00" }} />
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "text-black font-semibold" : "text-gray-400 hover:text-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "#00FF00",
                        color: "#000000",
                      }
                    : {}
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="space-y-2 border-t pt-4" style={{ borderColor: "#2C2C2C" }}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
            <span>Configurações</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
