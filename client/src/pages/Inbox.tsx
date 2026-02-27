import { useState } from "react";
import { Search, ChevronDown, Mail } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";

export default function Inbox() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const inboxData = [
    { id: 1, empresa: "C2 Tech", etiqueta: "suporte", remetente: "john.doe@example.com", assunto: "Problema com a integração da API", data: "10/24/2023 10:15 AM" },
    { id: 2, empresa: "Acme Corp", etiqueta: "commercial", remetente: "sarah.smith@acme.com", assunto: "Proposta de renovação de contrato", data: "10/24/2023 09:30 AM" },
    { id: 3, empresa: "Globex", etiqueta: "urgente", remetente: "mike.jones@globex.com", assunto: "ERRO CRÍTICO: Falha no servidor principal", data: "10/24/2023 08:45 AM" },
    { id: 4, empresa: "C2 Tech", etiqueta: "suporte", remetente: "jane.l@c2tech.com", assunto: "Revisão do ticket #4523", data: "10/23/2023 04:50 PM" },
    { id: 5, empresa: "Acme Corp", etiqueta: "urgente", remetente: "robert.brown@acme.com", assunto: "Atraso no pagamento da fatura", data: "10/23/2023 02:10 PM" },
    { id: 6, empresa: "Globex", etiqueta: "commercial", remetente: "lisa.wong@globex.com", assunto: "Agendamento de reunião de parceria", data: "10/23/2023 11:25 AM" },
  ];

  const getEmpresaColor = (empresa: string) => {
    const colors: Record<string, string> = {
      "C2 Tech": "#00FF00",
      "Acme Corp": "#FFD700",
      "Globex": "#8A2BE2",
    };
    return colors[empresa] || "#00FF00";
  };

  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: "#1A1A1A" }}>
      <Sidebar currentPage="inbox" onNavigate={navigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="border-b px-8 py-4" style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}>
          <h2 className="text-3xl font-bold">Inbox</h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {/* FILTERS */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por assunto ou remetente"
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
              Etiqueta <ChevronDown size={16} className="inline ml-2" />
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
                  <th className="px-6 py-3 text-left text-gray-400">Etiqueta</th>
                  <th className="px-6 py-3 text-left text-gray-400">Remetente</th>
                  <th className="px-6 py-3 text-left text-gray-400">Assunto</th>
                  <th className="px-6 py-3 text-left text-gray-400">Data</th>
                </tr>
              </thead>
              <tbody>
                {inboxData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-900 transition-colors"
                    style={{ borderColor: "#2C2C2C", backgroundColor: idx === 4 ? "rgba(0, 255, 0, 0.05)" : "transparent" }}
                  >
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getEmpresaColor(item.empresa) }}>
                        {item.empresa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm border" style={{ borderColor: "#00FF00", color: "#00FF00" }}>
                        {item.etiqueta}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.remetente}</td>
                    <td className="px-6 py-4">{item.assunto}</td>
                    <td className="px-6 py-4 text-gray-400">{item.data}</td>
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
