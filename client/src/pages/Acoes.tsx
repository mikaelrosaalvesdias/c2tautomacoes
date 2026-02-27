import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";

export default function Acoes() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const acoesData = [
    { id: 1, created_at: "10/26/2023 11:30 AM", empresa: "C2 Tech", email: "john.doe@example.com", acao: "cancelar", lang: "PT-BR", motivo: "Cliente solicitou cancelamento direto" },
    { id: 2, created_at: "10/26/2023 10:45 AM", empresa: "Acme Corp", email: "sarah.smith@acme.com", acao: "renovar", lang: "EN", motivo: "Processo de renovação anual iniciado" },
    { id: 3, created_at: "10/26/2023 09:15 AM", empresa: "Globex", email: "mike.jones@globex.com", acao: "atualizar", lang: "ES", motivo: "Atualização de plano para nível superior" },
    { id: 4, created_at: "10/25/2023 05:20 PM", empresa: "C2 Tech", email: "jane.l@c2tech.com", acao: "cancelar", lang: "PT-BR", motivo: "Inatividade prolongada da conta" },
    { id: 5, created_at: "10/25/2023 03:40 PM", empresa: "Acme Corp", email: "robert.brown@acme.com", acao: "renovar", lang: "EN", motivo: "Renovação automática aprovada" },
    { id: 6, created_at: "10/25/2023 12:55 PM", empresa: "Globex", email: "lisa.wong@globex.com", acao: "atualizar", lang: "ES", motivo: "Correção de dados cadastrais" },
  ];

  const getEmpresaColor = (empresa: string) => {
    const colors: Record<string, string> = {
      "C2 Tech": "#00FF00",
      "Acme Corp": "#FFD700",
      "Globex": "#8A2BE2",
    };
    return colors[empresa] || "#00FF00";
  };

  const getAcaoColor = (acao: string) => {
    const colors: Record<string, string> = {
      "cancelar": "#FF4444",
      "renovar": "#00FF00",
      "atualizar": "#FFD700",
    };
    return colors[acao] || "#00FF00";
  };

  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: "#1A1A1A" }}>
      <Sidebar currentPage="acoes" onNavigate={navigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="border-b px-8 py-4" style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}>
          <h2 className="text-3xl font-bold">Ações</h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {/* FILTERS */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por ação ou empresa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}
              />
            </div>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Empresa <ChevronDown size={16} className="inline ml-2" />
            </button>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Período <ChevronDown size={16} className="inline ml-2" />
            </button>
          </div>

          {/* TABLE */}
          <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#00FF00", backgroundColor: "#1A1A1A" }}>
            <table className="w-full">
              <thead style={{ backgroundColor: "#2C2C2C" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-gray-400">created_at</th>
                  <th className="px-6 py-3 text-left text-gray-400">empresa</th>
                  <th className="px-6 py-3 text-left text-gray-400">email</th>
                  <th className="px-6 py-3 text-left text-gray-400">ação</th>
                  <th className="px-6 py-3 text-left text-gray-400">lang</th>
                  <th className="px-6 py-3 text-left text-gray-400">motivo_cancelamento</th>
                </tr>
              </thead>
              <tbody>
                {acoesData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-900 transition-colors"
                    style={{ borderColor: "#2C2C2C", backgroundColor: idx === 3 ? "rgba(0, 255, 0, 0.05)" : "transparent" }}
                  >
                    <td className="px-6 py-4 text-gray-300">{item.created_at}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getEmpresaColor(item.empresa) }}>
                        {item.empresa}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getAcaoColor(item.acao) }}>
                        {item.acao}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.lang}</td>
                    <td className="px-6 py-4 text-gray-300">{item.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
              Anterior
            </button>
            <button className="px-4 py-2 rounded-lg font-bold" style={{ backgroundColor: "#00FF00", color: "#000000" }}>
              1
            </button>
            <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
              2
            </button>
            <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
              3
            </button>
            <span className="text-gray-400">...</span>
            <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
              Próximo
            </button>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">Página 1 de 10</div>
        </div>
      </div>
    </div>
  );
}
