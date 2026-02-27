import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Settings, Mail, Zap, X, Send, BarChart3, ChevronDown, Eye, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { useAPI } from "@/hooks/useAPI";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AcaoItem  { Id: number; empresa: string; acao: string; created_at: string; }
interface InboxItem { Id: number; empresa: string; created_at: string; }
interface EmailItem { Id: number; empresa: string; created_at: string; }

const COLORS = ["#00FF00", "#FFD700", "#8A2BE2", "#FF6B35", "#4A90E2", "#7B68EE"];

// ── Build 10-day line data for a set of records ───────────────────────────────
function buildLineData(records: { created_at: string }[], days = 10) {
  const now = Date.now();
  const map: Record<string, number> = {};
  for (let i = 1; i <= days; i++) map[String(i)] = 0;
  const threshold = now - days * 86_400_000;
  for (const r of records) {
    const t = new Date(r.created_at).getTime();
    if (!isNaN(t) && t >= threshold) {
      const idx = days - Math.floor((now - t) / 86_400_000);
      if (idx >= 1 && idx <= days) map[String(idx)]++;
    }
  }
  return Object.entries(map).map(([day, value]) => ({ day, value }));
}

export default function Home() {
  const [, navigate] = useLocation();
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // ── Fetch real data ─────────────────────────────────────────────────────────
  const { data: inboxRaw,  loading: l1 } = useAPI<InboxItem>("/inbox",  { limit: 500 });
  const { data: acoesRaw,  loading: l2 } = useAPI<AcaoItem>("/acoes",  { limit: 500 });
  const { data: emailsRaw, loading: l3 } = useAPI<EmailItem>("/emails", { limit: 500 });
  const loading = l1 || l2 || l3;

  // ── Compute companies + donut from real data ────────────────────────────────
  const { companiesData, donutChartData, totalRecords, defaultMetrics, defaultLineData } = useMemo(() => {
    const empresaSet = new Set<string>();
    [...inboxRaw, ...acoesRaw, ...emailsRaw].forEach((r) => { if (r.empresa) empresaSet.add(r.empresa); });
    const empresas = [...empresaSet];

    const companiesData: Record<string, {
      name: string; color: string;
      metrics: { emails: number; acoes: number; cancelamentos: number; enviados: number };
      lineData: { day: string; value: number }[];
    }> = {};

    const donutChartData: { id: string; name: string; value: number }[] = [];
    let grandTotal = 0;

    empresas.forEach((empresa, i) => {
      const compInbox  = inboxRaw.filter((r) => r.empresa === empresa);
      const compAcoes  = acoesRaw.filter((r) => r.empresa === empresa);
      const compEmails = emailsRaw.filter((r) => r.empresa === empresa);
      const total = compInbox.length + compAcoes.length + compEmails.length;
      grandTotal += total;

      companiesData[empresa] = {
        name: empresa,
        color: COLORS[i % COLORS.length],
        metrics: {
          emails: compInbox.length,
          acoes: compAcoes.length,
          cancelamentos: compAcoes.filter((r) => r.acao?.toLowerCase().includes("cancel")).length,
          enviados: compEmails.length,
        },
        lineData: buildLineData(compAcoes),
      };
      donutChartData.push({ id: empresa, name: String(Math.round((total / Math.max(grandTotal, 1)) * 100)) + "%", value: total });
    });

    // Recalculate percentages with final grandTotal
    donutChartData.forEach((d) => {
      const empresa = d.id;
      const compTotal = (inboxRaw.filter(r => r.empresa === empresa).length +
                        acoesRaw.filter(r => r.empresa === empresa).length +
                        emailsRaw.filter(r => r.empresa === empresa).length);
      d.name = String(Math.round((compTotal / Math.max(grandTotal, 1)) * 100)) + "%";
    });

    const defaultMetrics = {
      emails: inboxRaw.length,
      acoes: acoesRaw.length,
      cancelamentos: acoesRaw.filter((r) => r.acao?.toLowerCase().includes("cancel")).length,
      enviados: emailsRaw.length,
    };

    return {
      companiesData,
      donutChartData,
      totalRecords: grandTotal,
      defaultMetrics,
      defaultLineData: buildLineData(acoesRaw),
    };
  }, [inboxRaw, acoesRaw, emailsRaw]);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const currentData = selectedCompany ? companiesData[selectedCompany] : null;
  const metrics  = currentData?.metrics  ?? defaultMetrics;
  const lineData = currentData?.lineData ?? defaultLineData;

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompany(selectedCompany === companyId ? null : companyId);
  };
  const clearFilter = () => setSelectedCompany(null);

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
              { id: "dashboard",      label: "Dashboard",      icon: BarChart3, path: "/" },
              { id: "inbox",          label: "Inbox",          icon: Mail,      path: "/inbox" },
              { id: "acoes",          label: "Ações",          icon: Zap,       path: "/acoes" },
              { id: "cancelamentos",  label: "Cancelamentos",  icon: X,         path: "/cancelamentos" },
              { id: "emails",         label: "Emails",         icon: Send,      path: "/emails" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white"
                  style={{ backgroundColor: "#00FF00", color: "#000000" }}
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
        <div className="border-b px-8 py-4 flex items-center justify-between" style={{ borderColor: "#2C2C2C", backgroundColor: "#2C2C2C" }}>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}
              />
            </div>
            <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity" style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}>
              Filtrar por Data <ChevronDown size={16} />
            </button>
            <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity" style={{ backgroundColor: "#1A1A1A", border: "1px solid #2C2C2C" }}>
              Status <ChevronDown size={16} />
            </button>
            <div className="flex items-center gap-4">
              <Bell size={20} className="cursor-pointer hover:text-gray-300 hover:opacity-80 transition-opacity" onClick={() => {}} />
              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style={{ borderColor: "#00FF00" }} onClick={() => {}}}>
                <span className="text-sm font-bold">JD</span>
              </div>
              <Settings size={20} className="cursor-pointer hover:text-gray-300 hover:opacity-80 transition-opacity" onClick={() => {}} />
            </div>
          </div>
        </div>

        {/* FILTER BADGE */}
        {selectedCompany && (
          <div className="px-8 py-3 flex items-center gap-3 border-b" style={{ borderColor: "#2C2C2C", backgroundColor: "#1A1A1A" }}>
            <span className="text-sm text-gray-400">Filtro por Empresa:</span>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: companiesData[selectedCompany]?.color, color: "#000000" }}
            >
              {companiesData[selectedCompany]?.name}
              <button onClick={clearFilter} className="ml-2 hover:opacity-70 transition-opacity">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8 space-y-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Carregando dados...</div>
          ) : (
            <>
              {/* METRIC CARDS */}
              <div className="grid grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105" style={{ backgroundColor: "#1A1A1A", borderColor: "#00FF00", boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Emails Recebidos:</p>
                      <p className="text-5xl font-bold">{metrics.emails}</p>
                    </div>
                    <Mail size={40} style={{ color: "#00FF00" }} />
                  </div>
                </div>
                <div className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105" style={{ backgroundColor: "#1A1A1A", borderColor: "#FFD700", boxShadow: "0 0 20px rgba(255, 215, 0, 0.2)" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Ações Criadas:</p>
                      <p className="text-5xl font-bold">{metrics.acoes}</p>
                    </div>
                    <Zap size={40} style={{ color: "#FFD700" }} />
                  </div>
                </div>
                <div className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105" style={{ backgroundColor: "#1A1A1A", borderColor: "#8A2BE2", boxShadow: "0 0 20px rgba(138, 43, 226, 0.2)" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Cancelamentos:</p>
                      <p className="text-5xl font-bold">{metrics.cancelamentos}</p>
                    </div>
                    <X size={40} style={{ color: "#8A2BE2" }} />
                  </div>
                </div>
                <div className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg cursor-pointer hover:scale-105" style={{ backgroundColor: "#1A1A1A", borderColor: "#00FF00", boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)" }}>
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
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: "#1A1A1A", borderColor: "#00FF00" }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Gráfico de Ações por Dia {selectedCompany ? `- ${companiesData[selectedCompany]?.name}` : ""}</h3>
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
                      <Tooltip contentStyle={{ backgroundColor: "#2C2C2C", border: "2px solid #00FF00", borderRadius: "8px", color: "#00FF00", boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)" }} cursor={{ stroke: "#00FF00", strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="value" stroke="#00FF00" dot={{ fill: "#00FF00", r: 5, strokeWidth: 2 }} activeDot={{ r: 8, fill: "#00FF00", stroke: "#FFFFFF", strokeWidth: 2 }} strokeWidth={3} isAnimationActive={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut Chart */}
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: "#1A1A1A", borderColor: "#00FF00" }}>
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
                        <Tooltip contentStyle={{ backgroundColor: "#2C2C2C", border: "2px solid #00FF00", borderRadius: "8px", color: "#00FF00", boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)" }} />
                        <Pie
                          data={donutChartData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={100}
                          paddingAngle={2} dataKey="value"
                          animationBegin={0} animationDuration={800} animationEasing="ease-out"
                          onClick={(entry) => { if (entry.id) handleCompanyClick(entry.id); }}
                        >
                          {donutChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              style={{
                                filter: hoveredLegend === entry.id ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})` : "drop-shadow(0 0 5px rgba(0, 255, 0, 0.3))",
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
                      <p className="text-3xl font-bold">{totalRecords}</p>
                      <p className="text-gray-400 text-sm">Total</p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
                    {donutChartData.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-2 rounded hover:bg-gray-900"
                        onMouseEnter={() => setHoveredLegend(item.id)}
                        onMouseLeave={() => setHoveredLegend(null)}
                        onClick={() => handleCompanyClick(item.id)}
                        title={`Clique para filtrar por ${item.id}`}
                      >
                        <div
                          className="w-3 h-3 rounded-full transition-all hover:scale-150"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            boxShadow: hoveredLegend === item.id ? `0 0 10px ${COLORS[index % COLORS.length]}` : "none",
                            opacity: selectedCompany && selectedCompany !== item.id ? 0.3 : 1,
                          }}
                        />
                        <span className="text-gray-400 hover:text-white transition-colors">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
