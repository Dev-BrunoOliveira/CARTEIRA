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
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");

  // Lógica de Autenticação
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

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTransactions([]);
  };

  // Persistência Local
  useEffect(() => {
    const saved = localStorage.getItem("@FocusFinance:data");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("@FocusFinance:data", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!name.trim() || !value) return;
    const item = {
      id: Date.now(),
      name: name.trim(),
      value: parseFloat(value),
      type,
    };
    setTransactions([item, ...transactions]);
    setName("");
    setValue("");
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.value, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.value, 0);

  const balance = income - expense;

  const getAISuggestion = () => {
    if (transactions.length === 0) return "Adicione sua primeira movimentação!";
    if (balance <= 0) return "Foco total em quitar dívidas.";
    const reserveGoal = expense * 6;
    if (balance < reserveGoal)
      return `Foque na Reserva de Emergência. Aplique R$ ${balance.toFixed(2)} no SELIC.`;
    return "Reserva OK! Hora de diversificar em FIIs ou Ações.";
  };

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
              <h3 className="welcome-text">Bem-vindo(a) de volta!</h3>
            </div>

            <div className="auth-form-simulated">
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="Seu email" disabled />
              </div>
              <div className="input-group">
                <label>Senha</label>
                <input type="password" placeholder="Sua senha" disabled />
              </div>
              <button className="btn-login-main">Entrar</button>

              <div className="auth-divider">
                <span>OU</span>
              </div>
            </div>

            <button onClick={handleLogin} className="btn-google-auth">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon-img"
              />
              <span>Continuar com o Google</span>
            </button>

            <p className="auth-footer-text">
              Ainda não tem conta?{" "}
              <span className="link-text">Crie uma conta</span>
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
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wallet size={28} /> FocusFinance
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className="user-profile" style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", opacity: 0.8, display: "block" }}>
              Olá,
            </span>
            <strong>{session.user.user_metadata.full_name}</strong>
          </div>
          <button onClick={handleLogout} className="btn-logout">
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
                Lançar Transação
              </button>
            </div>
          </section>

          <section className="card">
            <h3>Histórico</h3>
            <ul className="history-list">
              {transactions.map((t) => (
                <li key={t.id} className="history-item">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>{t.name}</strong>
                    <small>{new Date(t.id).toLocaleDateString()}</small>
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
              <BrainCircuit size={20} /> Sugestão da IA
            </div>
            <p>{getAISuggestion()}</p>
          </div>

          <div className="card" style={{ height: "320px" }}>
            <h3 className="chart-title">Balanço Visual</h3>
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
