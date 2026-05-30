import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import { Wallet, Trash2, LogOut, Plus, BrainCircuit, Eye, EyeOff } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const ESSENCIAIS = [
  "Salario",
  "Taxa Cartorial",
  "Feira Domingo",
  "Açougue",
  "Feira",
  "Condominio",
  "Faculdade",
  "Aluguel",
  "Luz",
  "FAM",
  "TIM",
  "Carregador",
  "Mercado",
  "Enel",
  "ENEL",
  "Claro",
  "CLARO",
  "VIVO",
  "Vivo",
  "Tim",
  "Claro",
  "Academia",
  "Vale Transporte",
  "VT",
  "Netflix",
  "Spotify",
  "Disney+",
  "Prime Video",
  "HBO Max",
  "CLOUDDY",
  "Apple",
  "Cartão da Larissa",
  "Nubank",
  "Condução",
  "Bomboniere",
  "VT + ALIMENTAÇÃO",
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");

  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );

  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Estado de controle de privacidade (Alternador global de exibição dos nomes dos gastos)
  const [showPrivateNames, setShowPrivateNames] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingInitial(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setTransactions(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        alert("Verifique seu e-mail!");
      } else {
        await supabase.auth.signInWithPassword({ email, password });
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const addTransaction = async () => {
    if (!name.trim() || !value || !session?.user?.id) return;

    const targetDate = new Date(transactionDate + "T12:00:00").toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          name: name.trim(),
          value: parseFloat(value),
          type,
          user_id: session.user.id,
          created_at: targetDate,
        },
      ])
      .select();

    if (!error && data) {
      setTransactions([...transactions, data[0]]);
      setName("");
      setValue("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
    }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  const filteredTransactions = transactions.filter((t) => {
    const dateObj = new Date(t.created_at);
    return dateObj.getMonth() === selectedMonth;
  });

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + (b.value || 0), 0);
  const expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + (b.value || 0), 0);
  const balance = income - expense;

  const nonEssentialExpenses = filteredTransactions.filter(
    (t) => t.type === "expense" && !ESSENCIAIS.includes(t.name),
  );
  const totalNonEssential = nonEssentialExpenses.reduce(
    (a, b) => a + (b.value || 0),
    0,
  );

  const biggestWaste =
    nonEssentialExpenses.length > 0
      ? nonEssentialExpenses.sort((a, b) => b.value - a.value)[0]
      : null;

  const getMonthlyData = () => {
    const chartMap: any = {};
    months.forEach((m) => (chartMap[m] = { name: m, Ganhos: 0, Gastos: 0 }));
    transactions.forEach((t) => {
      const mName = months[new Date(t.created_at).getMonth()];
      if (t.type === "income") chartMap[mName].Ganhos += t.value || 0;
      else chartMap[mName].Gastos += t.value || 0;
    });
    return Object.values(chartMap);
  };

  // Mapeia e ordena os gastos não essenciais dinamicamente (Maior -> Menor)
  const getPieData = () => {
    if (nonEssentialExpenses.length === 0) return [];

    const groupedWastes: { [key: string]: number } = {};
    
    nonEssentialExpenses.forEach((t) => {
      const name = t.name;
      groupedWastes[name] = (groupedWastes[name] || 0) + (t.value || 0);
    });

    return Object.keys(groupedWastes)
      .map((name, index) => ({
        id: `gasto-${index}`,
        name: name,
        value: parseFloat(groupedWastes[name].toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getDynamicColor = (index: number, total: number) => {
    const baseColors = [
      "#f43f5e", "#ec4899", "#d946ef", "#8b5cf6", 
      "#f97316", "#eab308", "#ef4444", "#a855f7"
    ];
    if (index < baseColors.length) return baseColors[index];
    
    const hue = (index * (360 / (total || 1))) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.04 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const generateAiAnalysis = async () => {
    if (filteredTransactions.length === 0) {
      alert("Nenhuma transação encontrada neste mês para analisar.");
      return;
    }

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!geminiKey) {
      setAiInsights("Erro de Ambiente: A chave VITE_GEMINI_API_KEY não foi encontrada.");
      return;
    }

    setLoadingAi(true);
    try {
      const dadosFinanceiros = filteredTransactions.map((t) => ({
        nome: t.name,
        valor: t.value,
        tipo: t.type === "income" ? "Ganho" : "Gasto",
        tipoGasto: ESSENCIAIS.includes(t.name) ? "Essencial" : "Supérfluo",
      }));

      const promptText = `
        Atue como um analista financeiro de elite. Analise os seguintes dados do mês de ${months[selectedMonth]}:
        ${JSON.stringify(dadosFinanceiros, null, 2)}
        
        Resuma em um parágrafo curto e direto quais são os principais gargalos e dê um conselho prático focado em economia.
        Em seguida, monte uma tabela em formato Markdown com os 3 maiores gastos encontrados.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        },
      );

      const resData = await response.json();

      if (resData.candidates && resData.candidates[0]?.content?.parts?.[0]?.text) {
        setAiInsights(resData.candidates[0].content.parts[0].text);
      } else if (resData.error) {
        setAiInsights(`Erro retornado pelo Google: ${resData.error.message}`);
      } else {
        setAiInsights("Nota: Erro de parse na resposta. Verifique o console da aplicação.");
      }
    } catch (error: any) {
      setAiInsights("Erro de conexão com o servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (loadingInitial)
    return <div className="loading-screen">Carregando...</div>;

  if (!session) {
    return (
      <div className="auth-fullscreen">
        <div className="auth-side-banner">
          <div className="auth-overlay-info">
            <h1>Domine suas finanças.</h1>
            <p>Organização inteligente para seu dinheiro.</p>
          </div>
        </div>
        <div className="auth-side-form">
          <div className="auth-card-box">
            <div className="auth-logo">
              <Wallet size={42} /> <span>Gestão Financeira</span>
            </div>
            <form onSubmit={handleAuth} className="auth-main-form">
              {isSignUp && (
                <div className="auth-input">
                  <span>Nome</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="auth-input">
                <span>E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-input">
                <span>Senha</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="auth-btn-submit" type="submit">
                {isSignUp ? "Cadastrar" : "Entrar"}
              </button>
            </form>
            <div className="auth-divider">
              <span>OU</span>
            </div>
            <button
              className="auth-btn-google"
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="G"
              />{" "}
              Entrar com Google
            </button>
            <p className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Já tem conta? Entrar" : "Criar conta"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pieData = getPieData();

  return (
    <div className="app-main-layout">
      <header className="app-top-nav">
        <div className="app-logo-brand">
          <Wallet /> Gestão Financeira{" "}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="app-logout-icon"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="app-summary-grid">
        <div className="app-stat-card income-card">
          <div>
            <small>Ganhos</small>
            <strong>R$ {income.toLocaleString()}</strong>
          </div>
        </div>
        <div className="app-stat-card expense-card">
          <div>
            <small>Gastos</small>
            <strong>R$ {expense.toLocaleString()}</strong>
          </div>
        </div>
        <div className="app-stat-card balance-card">
          <div>
            <small>Saldo Disponível</small>
            <strong>R$ {balance.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="app-content-columns">
        <div className="app-col-primary">
          <section className="app-glass-section waste-alert">
            <div className="section-title-row">
              <h3>Análise de Gastos</h3>
              <span className="waste-badge">
                R$ {totalNonEssential.toLocaleString()} não essenciais
              </span>
            </div>
            <p>
              {biggestWaste
                ? `⚠️ Seu maior gasto supérfluo é "${biggestWaste.name}" (R$ ${biggestWaste.value.toFixed(2)}).`
                : "✅ Ótimo! Seus gastos estão focados no essencial."}
            </p>
          </section>

          <section className="app-glass-section ai-section">
            <div className="section-title-row">
              <h3>
                <BrainCircuit size={20} color="#8b5cf6" /> Consultoria IA
              </h3>
              <button
                className="app-btn-ai"
                onClick={generateAiAnalysis}
                disabled={loadingAi}
              >
                {loadingAi ? "Analisando..." : "Analisar Mês"}
              </button>
            </div>
            {aiInsights && (
              <div className="ai-response-container">
                <div style={{ whiteSpace: "pre-line", fontSize: "14px", marginTop: "15px", color: "#475569" }}>
                  {aiInsights}
                </div>
              </div>
            )}
          </section>

          <section className="app-glass-section">
            <h3>Novo Lançamento</h3>
            <div className="app-quick-form">
              <input
                placeholder="Descrição"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <button className="app-btn-add" onClick={addTransaction}>
                <Plus size={18} />
              </button>
            </div>
          </section>

          <section className="app-glass-section">
            <div className="section-title-row">
              <h3>Histórico</h3>
              <select
                className="app-month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="app-history-container">
              {[...filteredTransactions].reverse().map((t) => (
                <div key={t.id} className="app-history-row">
                  <div className="history-info-group">
                    <strong>{t.name}</strong>
                    <div className="history-spacer"></div>
                    <span className={t.type === "income" ? "val-plus" : "val-minus"}>
                      R$ {t.value.toFixed(2)}
                    </span>
                    <button
                      className="btn-delete-row"
                      onClick={() => deleteTransaction(t.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="app-col-side">
          <section className="app-glass-section chart-section">
            <h3>Comparativo Mensal</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="Ganhos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* SEÇÃO DA PIZZA REVISADA COM FUNÇÃO DE PRIVACIDADE E LISTA DE ALTERNANTES DOS GASTOS */}
          <section className="app-glass-section chart-section">
            <div className="section-title-row" style={{ marginBottom: "10px" }}>
              <h3>Maiores Supérfluos</h3>
              <button 
                className="btn-privacy-toggle"
                onClick={() => setShowPrivateNames(!showPrivateNames)}
                title={showPrivateNames ? "Ocultar nomes reais" : "Mostrar nomes reais"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#8b5cf6",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                {showPrivateNames ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPrivateNames ? "Mascarar" : "Revelar"}
              </button>
            </div>
            
            <div style={{ width: "100%", height: 180 }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={75}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDynamicColor(index, pieData.length)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        `R$ ${value.toLocaleString()}`, 
                        showPrivateNames ? name : "Gasto Oculto"
                      ]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "14px" }}>
                  Nenhum gasto supérfluo registrado.
                </div>
              )}
            </div>

            {/* LISTA DE ALTERNANTES CONFIGURADA PARA PROTEGER PRIVACIDADE (MAIOR PARA O MENOR) */}
            {pieData.length > 0 && (
              <div className="custom-alternating-legend">
                {pieData.map((item, index) => (
                  <div key={item.id} className="legend-alternant-item">
                    <span 
                      className="legend-color-badge" 
                      style={{ backgroundColor: getDynamicColor(index, pieData.length) }}
                    />
                    <div className="legend-text-group">
                      <span className="legend-item-name">
                        {showPrivateNames ? item.name : `Gasto #${index + 1}`}
                      </span>
                      <span className="legend-item-value">
                        R$ {item.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}