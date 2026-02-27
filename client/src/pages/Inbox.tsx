import { useState } from "react";
import { useState } from "react";
import { Search, ChevronDown, Mail } from "lucide-react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import { useAPI } from "@/hooks/useAPI";

interface InboxItem {
  Id: number;
  empresa: string;
  remetente: string;
  destinatario: string;
  assunto: string;
  etiqueta: string;
  data: string;
  created_at?: string;
}

export default function Inbox() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: allItems, loading, error } = useAPI<InboxItem>("/inbox", { limit: 200 });

  // Get unique tags for filter pills
  const uniqueTags = Array.from(new Set(allItems.map(item => item.etiqueta).filter(Boolean)));

  const inboxData = allItems.filter(
    (item) =>
      (!searchTerm ||
        item.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remetente?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedTag || item.etiqueta === selectedTag)
  );

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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}
              />
            </div>
            <button className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", border: "1px solid #00FF00", color: "#00FF00" }}>
              Empresa <ChevronDown size={16} className="inline ml-2" />
            </button>
            {/* Tag Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTag === tag
                      ? "font-semibold text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: selectedTag === tag ? "#00FF00" : "transparent",
                    border: selectedTag === tag ? "1px solid #00FF00" : "1px solid #2C2C2C",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-8 text-gray-400">Carregando dados...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-400">Erro ao carregar: {error}</div>
          )}

          {!loading && !error && (
            <>
              {/* TABLE */}
              <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#00FF00", backgroundColor: "#1A1A1A" }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: "#2C2C2C" }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-400">Empresa</th>
                      <th className="px-6 py-3 text-left text-gray-400">Remetente</th>
                      <th className="px-6 py-3 text-left text-gray-400">Assunto</th>
                      <th className="px-6 py-3 text-left text-gray-400">Etiqueta</th>
                      <th className="px-6 py-3 text-left text-gray-400">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboxData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          <Mail size={32} className="inline mb-2 opacity-30" />
                          <br />Nenhum email encontrado
                        </td>
                      </tr>
                    ) : (
                      inboxData.map((item, idx) => (
                        <tr
                          key={item.Id}
                          className="border-t hover:bg-gray-900 transition-colors"
                          style={{ borderColor: "#2C2C2C", backgroundColor: idx === 3 ? "rgba(0, 255, 0, 0.05)" : "transparent" }}
                        >
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: getEmpresaColor(item.empresa) }}>
                              {item.empresa}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{item.remetente}</td>
                          <td className="px-6 py-4 text-gray-300">{item.assunto}</td>
                          <td className="px-6 py-4 text-gray-300">{item.etiqueta}</td>
                          <td className="px-6 py-4 text-gray-300 text-sm">
                            {item.data || item.created_at
                              ? new Date(item.data || item.created_at!).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION UI */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
                  Anterior
                </button>
                <button className="px-4 py-2 rounded-lg font-bold" style={{ backgroundColor: "#00FF00", color: "#000000" }}>
                  1
                </button>
                <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white" style={{ border: "1px solid #2C2C2C" }}>
                  Próximo
                </button>
              </div>
              <div className="text-center text-gray-400 text-sm mt-4">{inboxData.length} registros</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
