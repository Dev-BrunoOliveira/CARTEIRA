import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import {
  BrainCircuit,
  Wallet,
  Trash2,
  LogOut,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Check,
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// Inicialização Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Estados do Cofrinho Editável
  const [goalName, setGoalName] = useState("Reserva de Emergência");
  const [goalValue, setGoalValue] = useState(10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalName, setTempGoalName] = useState("");
  const [tempGoalValue, setTempGoalValue] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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
        alert("Verifique seu e-mail!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
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
      .insert([{
        name: name.trim(),
        value: parseFloat(value),
        type,
        user_id: session.user.id,
      }])
      .select();
    if (!error && data) {
      setTransactions([...transactions, data[0]]);
      setName(""); setValue("");
    }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleEditGoal = () => {
    setTempGoalName(goalName);
    setTempGoalValue(goalValue.toString());
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    if (tempGoalName.trim()) setGoalName(tempGoalName);
    if (!isNaN(parseFloat(tempGoalValue))) setGoalValue(parseFloat(tempGoalValue));
    setIsEditingGoal(false);
  };

  const filteredTransactions = transactions.filter(
    (t) => (t.created_at ? new Date(t.created_at) : new Date()).getMonth() === selectedMonth
  );

  const income = filteredTransactions.filter((t) => t.type === "income").reduce((a, b) => a + (b.value || 0), 0);
  const expense = filteredTransactions.filter((t) => t.type === "expense").reduce((a, b) => a + (b.value || 0), 0);
  const balance = income - expense;
  
  const progressPercent = Math.min(Math.round(balance > 0 ? (balance / goalValue) * 100 : 0), 100);

  const getMonthlyData = () => {
    const chartMap: any = {};
    months.forEach((m) => (chartMap[m.substring(0, 3)] = { name: m.substring(0, 3), Ganhos: 0, Gastos: 0 }));
    transactions.forEach((t) => {
      const date = t.created_at ? new Date(t.created_at) : new Date();
      const mName = months[date.getMonth()].substring(0, 3);
      if (t.type === "income") chartMap[mName].Ganhos += t.value || 0;
      else chartMap[mName].Gastos += t.value || 0;
    });
    return Object.values(chartMap);
  };

  if (!session) {
    return (
      <div className="auth-fullscreen">
        <div className="auth-side-banner">
          <div className="auth-overlay-info">
            <h1>Domine suas finanças.</h1>
            <p>Organização inteligente para seu cofrinho e reserva.</p>
          </div>
        </div>
        <div className="auth-side-form">
          <div className="auth-card-box">
            <div className="auth-logo"><Wallet size={42} /> <span>FocusFinance</span></div>
            <h2>{isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
            <form onSubmit={(e) => e.preventDefault()} className="auth-main-form">
              {isSignUp && (
                <div className="auth-input">
                  <span>Nome Completo</span>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              )}
              <div className="auth-input">
                <span>E-mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="auth-input">
                <span>Senha</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="auth-btn-submit" onClick={handleAuth} disabled={loading}>
                {loading ? "..." : isSignUp ? "Cadastrar" : "Entrar"}
              </button>
            </form>
            <div className="auth-divider"><span>OU</span></div>
            <button className="auth-btn-google" onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" /> Entrar com Google
            </button>
            <p className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar agora"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-main-layout">
      <header className="app-top-nav">
        <div className="app-logo-brand"><Wallet /> FocusFinance</div>
        <div className="app-user-actions">
          <span className="app-user-name">Olá, <strong>{session?.user?.user_metadata?.full_name?.split(" ")[0]}</strong></span>
          <button onClick={() => supabase.auth.signOut()} className="app-logout-icon"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="app-summary-grid">
        <div className="app-stat-card income-card"><TrendingUp /> <div><small>Ganhos</small><strong>R$ {income.toLocaleString()}</strong></div></div>
        <div className="app-stat-card expense-card"><TrendingDown /> <div><small>Gastos</small><strong>R$ {expense.toLocaleString()}</strong></div></div>
        <div className="app-stat-card balance-card"><Target /> <div><small>Saldo Disponível</small><strong className={balance >= 0 ? "pos" : "neg"}>R$ {balance.toLocaleString()}</strong></div></div>
      </div>

      <div className="app-content-columns">
        <div className="app-col-primary">
          <section className="app-glass-section reserve-goal-box">
            <div className="section-title-row">
              {isEditingGoal ? (
                <div className="goal-edit-container">
                  <input className="goal-input-text" value={tempGoalName} onChange={(e) => setTempGoalName(e.target.value)} placeholder="Nome" />
                  <input className="goal-input-value" type="number" value={tempGoalValue} onChange={(e) => setTempGoalValue(e.target.value)} placeholder="Valor" />
                  <button className="btn-save-goal" onClick={handleSaveGoal}><Check size={18} /></button>
                </div>
              ) : (
                <>
                  <h3>{goalName} 🪙</h3>
                  <div className="meta-actions">
                    <span className="meta-info-badge">Meta: R$ {goalValue.toLocaleString()}</span>
                    <Edit2 size={16} onClick={handleEditGoal} style={{ cursor: "pointer", color: "#64748b" }} />
                  </div>
                </>
              )}
            </div>
            <div className="app-progress-track"><div className="app-progress-bar" style={{ width: `${progressPercent}%` }}></div></div>
            <div className="app-progress-labels">
              <span>{progressPercent}% atingido</span>
              <span>Falta R$ {(goalValue - balance > 0 ? goalValue - balance : 0).toLocaleString()}</span>
            </div>
          </section>

          <section className="app-glass-section">
            <h3>Novo Lançamento</h3>
            <div className="app-quick-form">
              <input placeholder="Descrição" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="number" placeholder="Valor" value={value} onChange={(e) => setValue(e.target.value)} />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <button className="app-btn-add" onClick={addTransaction}><Plus size={20} /> Lançar</button>
            </div>
          </section>

          <section className="app-glass-section">
            <div className="section-title-row">
              <h3>Histórico Financeiro</h3>
              <select className="app-month-filter" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="app-history-container">
              {filteredTransactions.reverse().map((t) => (
                <div key={t.id} className="app-history-row">
                  {/* AJUSTE AQUI: Criamos um grupo para Nome e Data */}
                  <div className="history-info-group">
                    <strong>{t.name}</strong>
                    <small className="history-item-date">{new Date(t.created_at).toLocaleDateString()}</small>
                  </div>
                  {/* AJUSTE AQUI: Grupo para Valor e Lixeira */}
                  <div className="history-value-group">
                    <span className={t.type === "income" ? "val-plus" : "val-minus"}>
                      {t.type === "income" ? "+" : "-"} R$ {t.value.toFixed(2)}
                    </span>
                    <button className="btn-delete-row" onClick={() => deleteTransaction(t.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="app-col-side">
          <div className="app-ai-insight-box">
            <div className="ai-box-header"><BrainCircuit /> IA Consultora</div>
            <p>{balance < goalValue ? `Foco na meta: ${goalName}.` : "Excelente! Meta batida."}</p>
          </div>
          <div className="app-glass-section">
            <h3 style={{ marginBottom: "15px", textAlign: "center" }}>Fluxo de Caixa</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyData()}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="Ganhos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}