import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Settings, Mail, Zap, X, Send, BarChart3, PieChart, ChevronDown, Eye, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

/**
 * Design: Exato do Mockup C2Tech com Filtros Interativos
 * - Sidebar esquerda com navegação
 * - Header superior com pesquisa e filtros
 * - 4 cartões de métricas com cores específicas
 * - 2 gráficos interativos (line chart e donut chart)
 * - Filtro por empresa que atualiza dados em tempo real
 */

// Dados por empresa
const companiesData = {
  empresa1: {
    name: "Empresa A",
    color: "#00FF00",
    metrics: { emails: 342, acoes: 87, cancelamentos: 12, enviados: 156 },
    lineData: [
      { day: "1", value: 100 },
      { day: "2", value: 150 },
      { day: "3", value: 120 },
      { day: "4", value: 180 },
      { day: "5", value: 160 },
      { day: "6", value: 200 },
      { day: "7", value: 190 },
      { day: "8", value: 220 },
      { day: "9", value: 210 },
      { day: "10", value: 250 },
    ],
  },
  empresa2: {
    name: "Empresa B",
    color: "#FFD700",
    metrics: { emails: 215, acoes: 54, cancelamentos: 8, enviados: 98 },
    lineData: [
      { day: "1", value: 60 },
      { day: "2", value: 90 },
      { day: "3", value: 75 },
      { day: "4", value: 110 },
      { day: "5", value: 95 },
      { day: "6", value: 130 },
      { day: "7", value: 120 },
      { day: "8", value: 145 },
      { day: "9", value: 135 },
      { day: "10", value: 160 },
    ],
  },
  empresa3: {
    name: "Empresa C",
    color: "#8A2BE2",
    metrics: { emails: 180, acoes: 42, cancelamentos: 5, enviados: 76 },
    lineData: [
      { day: "1", value: 50 },
      { day: "2", value: 70 },
      { day: "3", value: 60 },
      { day: "4", value: 85 },
      { day: "5", value: 75 },
      { day: "6", value: 100 },
      { day: "7", value: 90 },
      { day: "8", value: 110 },
      { day: "9", value: 105 },
      { day: "10", value: 130 },
    ],
  },
};

// Dados do donut (distribuição)
const donutChartData = [
  { id: "empresa1", name: "43%", value: 43 },
  { id: "empresa2", name: "25%", value: 25 },
  { id: "empresa3", name: "15%", value: 15 },
  { id: "other1", name: "13%", value: 13 },
  { id: "other2", name: "4%", value: 4 },
  { id: "other3", name: "2%", value: 2 },
];

const donutColors = ["#00FF00", "#FFD700", "#8A2BE2", "#FF6B35", "#4A90E2", "#7B68EE"];

export default function Home() {
  const [, navigate] = useLocation();
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Dados filtrados
  const currentData = selectedCompany ? companiesData[selectedCompany as keyof typeof companiesData] : null;
  const metrics = currentData?.metrics || { emails: 342, acoes: 87, cancelamentos: 12, enviados: 156 };
  const lineData = currentData?.lineData || companiesData.empresa1.lineData;
  const companyName = currentData?.name || "Todas as Empresas";

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompany(selectedCompany === companyId ? null : companyId);
  };

  const clearFilter = () => {
    setSelectedCompany(null);
  };

  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: "#1A1A1A" }}>
      {/* SIDEBAR */}
      <div className="w-64 border-r" style={{ borderColor: "#2C2C2C", backgroundColor: "#1A1A1A" }}>
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-wider">
              <span style={{ color: "#00FF00" }}>C2</span>
              <span className="text-white">Tech</span>
            </h1>
            <div className="h-1 w-24" style={{ backgroundColor: "#00FF00" }} />
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/" },
              { id: "inbox", label: "Inbox", icon: Mail, path: "/inbox" },
              { id: "acoes", label: "Ações", icon: Zap, path: "/acoes" },
              { id: "cancelamentos", label: "Cancelamentos", icon: X, path: "/cancelamentos" },
              { id: "emails", label: "Emails", icon: Send, path: "/emails" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white"
                  style={{
                    backgroundColor: "#00FF00",
                    color: "#000000",
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div
          className="border-b px-8 py-4 flex items-center justify-between"
          style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}
        >
          <h2 className="text-3xl font-bold">Dashboard</h2>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm text-white"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2C2C2C",
                }}
              />
            </div>

            {/* Filters */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2C2C2C",
              }}
            >
              Filtrar por Data <ChevronDown size={16} />
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2C2C2C",
              }}
            >
              Status <ChevronDown size={16} />
            </button>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <Bell size={20} className="cursor-pointer hover:text-gray-300" />
              <div
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: "#00FF00" }}
              >
                <span className="text-sm font-bold">JD</span>
              </div>
              <Settings size={20} className="cursor-pointer hover:text-gray-300" />
            </div>
          </div>
        </div>

        {/* FILTER BADGE */}
        {selectedCompany && (
          <div
            className="px-8 py-3 flex items-center gap-3 border-b"
            style={{ borderColor: "#2C2C2C", backgroundColor: "#1A1A1A" }}
          >
            <span className="text-sm text-gray-400">Filtro por Empresa:</span>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: companiesData[selectedCompany as keyof typeof companiesData]?.color,
                color: "#000000",
              }}
            >
              {companiesData[selectedCompany as keyof typeof companiesData]?.name}
              <button
                onClick={clearFilter}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* METRIC CARDS */}
          <div className="grid grid-cols-4 gap-6">
            {/* Card 1: Emails Recebidos - Verde */}
            <div
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#00FF00",
                boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Emails Recebidos:</p>
                  <p className="text-5xl font-bold">{metrics.emails}</p>
                </div>
                <Mail size={40} style={{ color: "#00FF00" }} />
              </div>
            </div>

            {/* Card 2: Ações Criadas - Amarelo */}
            <div
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#FFD700",
                boxShadow: "0 0 20px rgba(255, 215, 0, 0.2)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Ações Criadas:</p>
                  <p className="text-5xl font-bold">{metrics.acoes}</p>
                </div>
                <Zap size={40} style={{ color: "#FFD700" }} />
              </div>
            </div>

            {/* Card 3: Cancelamentos - Roxo */}
            <div
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#8A2BE2",
                boxShadow: "0 0 20px rgba(138, 43, 226, 0.2)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Cancelamentos:</p>
                  <p className="text-5xl font-bold">{metrics.cancelamentos}</p>
                </div>
                <X size={40} style={{ color: "#8A2BE2" }} />
              </div>
            </div>

            {/* Card 4: Emails Enviados - Verde */}
            <div
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#00FF00",
                boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Emails Enviados:</p>
                  <p className="text-5xl font-bold">{metrics.enviados}</p>
                </div>
                <Send size={40} style={{ color: "#00FF00" }} />
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-6">
            {/* Line Chart */}
            <div
              className="p-6 rounded-2xl border-2"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#00FF00",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Gráfico de Ações por Dia {selectedCompany ? `- ${companyName}` : ""}</h3>
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                  <Minus size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                  <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Última 30 dias <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                  <XAxis stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C2C2C",
                      border: "2px solid #00FF00",
                      borderRadius: "8px",
                      color: "#00FF00",
                      boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
                    }}
                    cursor={{ stroke: "#00FF00", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00FF00"
                    dot={{ fill: "#00FF00", r: 5, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: "#00FF00", stroke: "#FFFFFF", strokeWidth: 2 }}
                    strokeWidth={3}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div
              className="p-6 rounded-2xl border-2"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: "#00FF00",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Distribuição por Empresa</h3>
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                  <Minus size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                  <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Última 30 dias <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2C2C2C",
                        border: "2px solid #00FF00",
                        borderRadius: "8px",
                        color: "#00FF00",
                        boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
                      }}
                    />
                    <Pie
                      data={donutChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      onClick={(entry) => {
                        if (entry.id) {
                          handleCompanyClick(entry.id);
                        }
                      }}
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={donutColors[index]}
                          style={{
                            filter: hoveredLegend === entry.id ? `drop-shadow(0 0 10px ${donutColors[index]})` : "drop-shadow(0 0 5px rgba(0, 255, 0, 0.3))",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            opacity: selectedCompany && selectedCompany !== entry.id ? 0.3 : 1,
                          }}
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <p className="text-3xl font-bold">250</p>
                  <p className="text-gray-400 text-sm">Total</p>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
                {[
                  { id: "empresa1", label: "43%", color: "#00FF00", name: "Empresa A" },
                  { id: "empresa2", label: "25%", color: "#FFD700", name: "Empresa B" },
                  { id: "empresa3", label: "15%", color: "#8A2BE2", name: "Empresa C" },
                  { id: "other1", label: "13%", color: "#FF6B35", name: "Outras" },
                  { id: "other2", label: "4%", color: "#4A90E2", name: "Outras" },
                  { id: "other3", label: "2%", color: "#7B68EE", name: "Outras" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-2 rounded hover:bg-gray-900"
                    onMouseEnter={() => setHoveredLegend(item.id)}
                    onMouseLeave={() => setHoveredLegend(null)}
                    onClick={() => {
                      if (item.id.startsWith("empresa")) {
                        handleCompanyClick(item.id);
                      }
                    }}
                    title={item.id.startsWith("empresa") ? `Clique para filtrar por ${item.name}` : ""}
                  >
                    <div
                      className="w-3 h-3 rounded-full transition-all hover:scale-150"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: hoveredLegend === item.id ? `0 0 10px ${item.color}` : "none",
                        opacity: selectedCompany && selectedCompany !== item.id ? 0.3 : 1,
                      }}
                    />
                    <span className="text-gray-400 hover:text-white transition-colors">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
