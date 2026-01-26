import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import { BrainCircuit, Wallet, Plus, Trash2, LogOut } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Inicialização do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  // Estados do formulário de Login/Cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // --- CONTROLE DE SESSÃO ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTransactions();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTransactions();
      else setTransactions([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- AUTENTICAÇÃO POR E-MAIL ---
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
        alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
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

  // --- AUTENTICAÇÃO GOOGLE ---
  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert("Erro: Verifique se o Google está ativo no Supabase!");
  };

  // --- OPERAÇÕES DO BANCO DE DADOS ---
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  const addTransaction = async () => {
    if (!name.trim() || !value || !session) return;

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
      setTransactions([data[0], ...transactions]);
      setName("");
      setValue("");
    }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  // --- CÁLCULOS ---
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.value, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.value, 0);
  const balance = income - expense;

  // --- TELA DE LOGIN / CADASTRO ---
  if (!session) {
    return (
      <div className="welcome-wrapper">
        <div className="welcome-image">
          <div className="welcome-overlay">
            <h1>Descubra e controle sua vida financeira</h1>
            <p>
              Gerencie seus ganhos e gastos em um só lugar com inteligência!
            </p>
          </div>
        </div>

        <div className="welcome-auth-section">
          <div className="auth-card">
            <div className="auth-header">
              <Wallet size={40} color="#4f46e5" />
              <h2 className="brand-name">FocusFinance</h2>
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
              onClick={handleGoogleAuth}
              className="btn-google-auth"
              type="button"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="G"
                className="google-icon-img"
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

  // --- DASHBOARD ---
  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>
            <Wallet size={28} /> FocusFinance
          </h1>
        </div>
        <div className="user-profile-nav">
          <div style={{ textAlign: "right", color: "white" }}>
            <span style={{ fontSize: "12px", display: "block", opacity: 0.8 }}>
              Olá,
            </span>
            <strong>
              {session.user.user_metadata.full_name || session.user.email}
            </strong>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-logout"
          >
            <LogOut size={20} />
          </button>
        </div>
        <div className="balance-box">
          <span>SALDO DISPONÍVEL</span>
          <h2 style={{ color: balance >= 0 ? "#2ecc71" : "#e74c3c" }}>
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
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
                Lançar no Banco
              </button>
            </div>
          </section>

          <section className="card">
            <h3>Histórico {loading && <small>(Sincronizando...)</small>}</h3>
            <ul className="history-list">
              {transactions.map((t) => (
                <li key={t.id} className="history-item">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>{t.name}</strong>
                    <small>
                      {new Date(t.created_at || t.id).toLocaleDateString()}
                    </small>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <span
                      className={
                        t.type === "income" ? "income-text" : "expense-text"
                      }
                    >
                      R$ {t.value.toFixed(2)}
                    </span>
                    <Trash2
                      size={18}
                      color="#bbb"
                      style={{ cursor: "pointer" }}
                      onClick={() => deleteTransaction(t.id)}
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
            <p>Gerencie seus gastos de modelo e faculdade aqui!</p>
          </div>
          <div className="card" style={{ height: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { label: "Ganhos", total: income },
                  { label: "Gastos", total: expense },
                ]}
              >
                <XAxis dataKey="label" />
                <Tooltip />
                <Bar dataKey="total">
                  <Cell fill="#2ecc71" />
                  <Cell fill="#e74c3c" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
