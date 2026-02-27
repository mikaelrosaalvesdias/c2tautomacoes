import { useState } from "react";
import { Search, ChevronDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import { useAPI } from "@/hooks/useAPI";

interface CancelItem {
  Id: number;
  empresa: string;
  email: string;
  acao: string;
  lang: string;
  motivo_cancelamento?: string;
  created_at: string;
}

export default function Cancelamentos() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("somente");

  const { data: cancelamentosData, loading, error } = useAPI<CancelItem>("/cancelamentos", { limit: 200 });

  const filtered = cancelamentosData.filter(
    (item) =>
      !searchTerm ||
      item.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPI counts from real data
  const solicitados = cancelamentosData.length;
  const confirmados = cancelamentosData.filter((i) => !i.acao?.toLowerCase().includes("erro")).length;
  const erros = cancelamentosData.filter((i) => i.acao?.toLowerCase().includes("erro")).length;

  const getEmpresaColor = (empresa: string) => {
    const colors: Record<string, string> = {
      "C2 Tech": "#00FF00",
      "Acme Corp": "#FFD700",
      "Globex": "#8A2BE2",
    };
    return colors[empresa] || "#FFD700";
  };

  const getAcaoColor = (acao: string) => {
    const lower = acao?.toLowerCase() ?? "";
    if (lower.includes("erro")) return "#FF4444";
    if (lower.includes("confirm") || lower.includes("renov")) return "#00FF00";
    return "#FF4444";
  };

  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: "#1A1A1A" }}>
      <Sidebar currentPage="cancelamentos" onNavigate={navigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="border-b px-8 py-4" style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}>
          <h2 className="text-3xl font-bold">Cancelamentos</h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {/* FILTERS */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar cancelamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}
              />
            </div>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Filtrar por Status <ChevronDown size={16} className="inline ml-2" />
            </button>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Filtrar por Empresa <ChevronDown size={16} className="inline ml-2" />
            </button>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Período <ChevronDown size={16} className="inline ml-2" />
            </button>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Filtros
            </button>
          </div>

          {/* STATUS CARDS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl border-2" style={{ borderColor: "#FFD700", backgroundColor: "#1A1A1A" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Solicitados</p>
                  <p className="text-4xl font-bold">{loading ? "..." : solicitados}</p>
                  <p className="text-gray-500 text-xs mt-2">cancelamentos recentes</p>
                </div>
                <Clock size={40} style={{ color: "#FFD700" }} />
              </div>
            </div>

            <div className="p-6 rounded-2xl border-2" style={{ borderColor: "#00FF00", backgroundColor: "#1A1A1A" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Confirmados</p>
                  <p className="text-4xl font-bold">{loading ? "..." : confirmados}</p>
                  <p className="text-gray-500 text-xs mt-2">processados com sucesso</p>
                </div>
                <CheckCircle size={40} style={{ color: "#00FF00" }} />
              </div>
            </div>

            <div className="p-6 rounded-2xl border-2" style={{ borderColor: "#FF4444", backgroundColor: "#1A1A1A" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Erro</p>
                  <p className="text-4xl font-bold">{loading ? "..." : erros}</p>
                  <p className="text-gray-500 text-xs mt-2">falhas no processamento</p>
                </div>
                <AlertCircle size={40} style={{ color: "#FF4444" }} />
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-6 mb-8 border-b" style={{ borderColor: "#2C2C2C" }}>
            <button
              onClick={() => setActiveTab("somente")}
              className={`pb-4 px-2 transition-colors ${activeTab === "somente" ? "border-b-2" : ""}`}
              style={{ borderColor: activeTab === "somente" ? "#8A2BE2" : "transparent", color: activeTab === "somente" ? "#8A2BE2" : "#666" }}
            >
              Somente cancelamento
            </button>
            <button
              onClick={() => setActiveTab("todos")}
              className={`pb-4 px-2 transition-colors ${activeTab === "todos" ? "border-b-2" : ""}`}
              style={{ borderColor: activeTab === "todos" ? "#8A2BE2" : "transparent", color: activeTab === "todos" ? "#8A2BE2" : "#666" }}
            >
              Todos os pedidos
            </button>
            <button
              onClick={() => setActiveTab("renovacoes")}
              className={`pb-4 px-2 transition-colors ${activeTab === "renovacoes" ? "border-b-2" : ""}`}
              style={{ borderColor: activeTab === "renovacoes" ? "#8A2BE2" : "transparent", color: activeTab === "renovacoes" ? "#8A2BE2" : "#666" }}
            >
              Renovações
            </button>
          </div>

          {loading && <div className="text-center py-8 text-gray-400">Carregando dados...</div>}
          {error && <div className="text-center py-8 text-red-400">Erro ao carregar: {error}</div>}

          {!loading && !error && (
            <>
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhum cancelamento encontrado</td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.Id} className="border-t hover:bg-gray-900 transition-colors" style={{ borderColor: "#2C2C2C" }}>
                          <td className="px-6 py-4 text-gray-300">
                            {item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "-"}
                          </td>
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
                          <td className="px-6 py-4 text-gray-300 text-sm">{item.motivo_cancelamento ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION UI */}
              <div className="flex items-center justify-end gap-2 mt-6">
                <span className="text-gray-400 text-sm">{filtered.length} registros</span>
                <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>←</button>
                <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>→</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
