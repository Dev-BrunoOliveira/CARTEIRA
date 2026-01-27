import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import {
  BrainCircuit,
  Wallet,
  Plus,
  Trash2,
  LogOut,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

// Inicialização segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        alert("Cadastro realizado! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setTransactions(data);
  };

  const addTransaction = async () => {
    if (!name.trim() || !value || !session?.user?.id) return;

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          name: name.trim(),
          value: parseFloat(value),
          type,
          user_id: session.user.id,
        },
      ])
      .select();

    if (!error && data) {
      setTransactions([...transactions, data[0]]);
      setName("");
      setValue("");
    }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  // --- LÓGICA DE DADOS ---
  const filteredTransactions = transactions.filter((t) => {
    const date = t.created_at ? new Date(t.created_at) : new Date();
    return date.getMonth() === selectedMonth;
  });

  const getMonthlyData = () => {
    const chartMap: any = {};
    months.forEach(
      (m) =>
        (chartMap[m.substring(0, 3)] = {
          name: m.substring(0, 3),
          Ganhos: 0,
          Gastos: 0,
        }),
    );
    transactions.forEach((t) => {
      const date = t.created_at ? new Date(t.created_at) : new Date();
      const mName = months[date.getMonth()].substring(0, 3);
      if (t.type === "income") chartMap[mName].Ganhos += t.value || 0;
      else chartMap[mName].Gastos += t.value || 0;
    });
    return Object.values(chartMap);
  };

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + (b.value || 0), 0);
  const expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + (b.value || 0), 0);
  const balance = income - expense;

  const getAISuggestion = () => {
    if (filteredTransactions.length === 0) return "Lance dados para análise.";
    const reserveGoal = expense * 6;
    if (balance <= 0)
      return "⚠️ Atenção: Você gastou mais do que ganhou. Corte custos variáveis.";
    if (balance < reserveGoal) {
      return `💰 Reserva: Você tem R$ ${balance.toFixed(2)} sobrando. Guarde no Tesouro SELIC. Faltam R$ ${(reserveGoal - balance).toFixed(2)} para sua segurança total.`;
    }
    return "🚀 Reserva OK! Diversifique em CDBs de longo prazo ou Fundos Imobiliários.";
  };

  // TELA DE LOGIN / CADASTRO (RESTAURADA)
  if (!session) {
    return (
      <div className="welcome-wrapper">
        <div className="welcome-image">
          <div className="welcome-overlay">
            <h1>Descubra e controle sua vida financeira</h1>
            <p>Gerencie seus ganhos e gastos em um só lugar!</p>
          </div>
        </div>
        <div className="welcome-auth-section">
          <div className="auth-card">
            <div className="auth-header">
              <Wallet size={40} color="#4f46e5" />
              <h2 className="brand-name">Controle Financeiro</h2>
              <h3 className="welcome-text">
                {isSignUp ? "Crie sua conta grátis" : "Bem-vindo(a) de volta!"}
              </h3>
            </div>

            <form className="auth-form-simulated" onSubmit={handleAuth}>
              {isSignUp && (
                <div className="input-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Bruno Oliveira"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn-login-main"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Processando..."
                  : isSignUp
                    ? "Criar Conta"
                    : "Entrar"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OU</span>
            </div>

            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({ provider: "google" })
              }
              className="btn-google-auth"
              type="button"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="G"
                width="20"
              />
              <span>Continuar com o Google</span>
            </button>

            <p className="auth-footer-text">
              {isSignUp ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
              <span
                className="link-text"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Fazer Login" : "Crie uma conta"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>
            <Wallet size={28} /> Controle Financeiro{" "}
          </h1>
        </div>
        <div className="balance-box">
          <span>SALDO EM {months[selectedMonth]?.toUpperCase()}</span>
          <h2 style={{ color: balance >= 0 ? "#2ecc71" : "#e74c3c" }}>
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div className="user-menu">
          <small>
            Olá,{" "}
            {session?.user?.user_metadata?.full_name?.split(" ")[0] ||
              "Usuário"}
          </small>
          <button
            onClick={() => supabase.auth.signOut()}
            className="logout-button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="grid-layout">
        <div className="left-column">
          <section className="card">
            <h3>Nova Movimentação</h3>
            <div className="form-group">
              <input
                placeholder="Descrição"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor R$"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <button className="btn-add" onClick={addTransaction}>
                Lançar
              </button>
            </div>
          </section>

          <section className="card">
            <div
              className="card-header-filter"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3>Histórico</h3>
              <div
                className="filter-select"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Filter size={16} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((m, index) => (
                    <option key={m} value={index}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="history-list">
              {[...filteredTransactions].reverse().map((t) => (
                <li key={t.id} className="history-item">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>{t.name}</strong>
                    <small>
                      {t.created_at
                        ? new Date(t.created_at).toLocaleDateString()
                        : "Data pendente"}
                    </small>
                  </div>
                  <div className="history-actions">
                    <span
                      className={
                        t.type === "income" ? "income-text" : "expense-text"
                      }
                    >
                      R$ {(t.value || 0).toFixed(2)}
                    </span>
                    <Trash2
                      size={18}
                      color="#bbb"
                      onClick={() => deleteTransaction(t.id)}
                      style={{ cursor: "pointer", marginLeft: "10px" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="right-column">
          <div className="ai-box">
            <div className="ai-title">
              <BrainCircuit size={20} /> IA Insight
            </div>
            <p className="ai-text">{getAISuggestion()}</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: "15px", textAlign: "center" }}>
              Comparativo Anual
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getMonthlyData()}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="Ganhos" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
