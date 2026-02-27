import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";

export default function Emails() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const emailsData = [
    { id: 1, empresa: "C2 Tech", remetente: "john.doe@example.com", destinatario: "client.one@business.com", acao: "enviar proposta" },
    { id: 2, empresa: "Acme Corp", remetente: "sarah.smith@acme.com", destinatario: "prospect.two@venture.com", acao: "follow-up" },
    { id: 3, empresa: "Globex", remetente: "mike.jones@globex.com", destinatario: "finance@partner.org", acao: "cobrança" },
    { id: 4, empresa: "C2 Tech", remetente: "jane.l@c2tech.com", destinatario: "new.user@startup.io", acao: "boas-vindas" },
    { id: 5, empresa: "Acme Corp", remetente: "robert.brown@acme.com", destinatario: "lead.three@market.net", acao: "follow-up" },
    { id: 6, empresa: "Globex", remetente: "lisa.wong@globex.com", destinatario: "info@agency.com", acao: "enviar proposta" },
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
      "enviar proposta": "#FFD700",
      "follow-up": "#00FF00",
      "cobrança": "#8A2BE2",
      "boas-vindas": "#00FF00",
    };
    return colors[acao] || "#00FF00";
  };

  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: "#1A1A1A" }}>
      <Sidebar currentPage="emails" onNavigate={navigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="border-b px-8 py-4" style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}>
          <h2 className="text-3xl font-bold">Emails</h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {/* FILTERS */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por e-mail ou empresa"
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
              Ação <ChevronDown size={16} className="inline ml-2" />
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
                  <th className="px-6 py-3 text-left text-gray-400">Empresa</th>
                  <th className="px-6 py-3 text-left text-gray-400">Remetente</th>
                  <th className="px-6 py-3 text-left text-gray-400">Destinatário</th>
                  <th className="px-6 py-3 text-left text-gray-400">Ação</th>
                </tr>
              </thead>
              <tbody>
                {emailsData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-900 transition-colors"
                    style={{ borderColor: "#2C2C2C", backgroundColor: idx === 3 ? "rgba(0, 255, 0, 0.05)" : "transparent" }}
                  >
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getEmpresaColor(item.empresa) }}>
                        {item.empresa}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.remetente}</td>
                    <td className="px-6 py-4 text-gray-300">{item.destinatario}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getAcaoColor(item.acao) }}>
                        {item.acao}
                      </span>
                    </td>
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
