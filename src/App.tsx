import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import { BrainCircuit, Wallet, Trash2, LogOut, Target, TrendingUp, TrendingDown, Plus, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const ESSENCIAIS = ["Salario", "Taxa Cartorial","Feira Domingo","Açougue", "Condominio", "FAM", "TIM","Carregador","Mercado", "ENEL", "CLARO", "Academia", "CLOUDDY", "Apple", "Cartão da Larissa", "Nubank","Condução","Bomboniere", "VT+ ALIMENTAÇÃO"];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingInitial(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchTransactions(); }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: true });
    if (!error && data) setTransactions(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        alert("Verifique seu e-mail!");
      } else {
        await supabase.auth.signInWithPassword({ email, password });
      }
    } catch (error: any) { alert(error.message); }
  };

  const addTransaction = async () => {
    if (!name.trim() || !value || !session?.user?.id) return;
    const { data, error } = await supabase.from("transactions").insert([{
      name: name.trim(),
      value: parseFloat(value),
      type,
      user_id: session.user.id
    }]).select();
    if (!error && data) { setTransactions([...transactions, data[0]]); setName(""); setValue(""); }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  const filteredTransactions = transactions.filter(t => new Date(t.created_at).getMonth() === selectedMonth);
  const income = filteredTransactions.filter(t => t.type === "income").reduce((a, b) => a + (b.value || 0), 0);
  const expense = filteredTransactions.filter(t => t.type === "expense").reduce((a, b) => a + (b.value || 0), 0);
  const balance = income - expense;

  const nonEssentialExpenses = filteredTransactions.filter(t => t.type === "expense" && !ESSENCIAIS.includes(t.name));
  const totalNonEssential = nonEssentialExpenses.reduce((a, b) => a + (b.value || 0), 0);
  const biggestWaste = nonEssentialExpenses.length > 0 ? nonEssentialExpenses.sort((a,b) => b.value - a.value)[0] : null;

  const getMonthlyData = () => {
    const chartMap: any = {};
    months.forEach(m => chartMap[m] = { name: m, Ganhos: 0, Gastos: 0 });
    transactions.forEach((t) => {
      const mName = months[new Date(t.created_at).getMonth()];
      if (t.type === "income") chartMap[mName].Ganhos += t.value || 0;
      else chartMap[mName].Gastos += t.value || 0;
    });
    return Object.values(chartMap);
  };

  if (loadingInitial) return <div className="loading-screen">Carregando...</div>;

  if (!session) {
    return (
      <div className="auth-fullscreen">
        <div className="auth-side-banner">
          <div className="auth-overlay-info">
            <h1>Domine suas finanças.</h1>
            <p>Organização inteligente para seu cofrinho.</p>
          </div>
        </div>
        <div className="auth-side-form">
          <div className="auth-card-box">
            <div className="auth-logo"><Wallet size={42} /> <span>Gestão Financeira</span></div>
            <form onSubmit={handleAuth} className="auth-main-form">
              {isSignUp && <div className="auth-input"><span>Nome</span><input value={fullName} onChange={e => setFullName(e.target.value)} /></div>}
              <div className="auth-input"><span>E-mail</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="auth-input"><span>Senha</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <button className="auth-btn-submit" type="submit">{isSignUp ? "Cadastrar" : "Entrar"}</button>
            </form>
            <div className="auth-divider"><span>OU</span></div>
            <button className="auth-btn-google" onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" /> Entrar com Google
            </button>
            <p className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Já tem conta? Entrar" : "Criar conta"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-main-layout">
      <header className="app-top-nav">
        <div className="app-logo-brand"><Wallet /> Gestão Financeira </div>
        <button onClick={() => supabase.auth.signOut()} className="app-logout-icon"><LogOut size={20} /></button>
      </header>

      <div className="app-summary-grid">
        <div className="app-stat-card income-card"><div><small>Ganhos</small><strong>R$ {income.toLocaleString()}</strong></div></div>
        <div className="app-stat-card expense-card"><div><small>Gastos</small><strong>R$ {expense.toLocaleString()}</strong></div></div>
        <div className="app-stat-card balance-card"><div><small>Saldo Disponível</small><strong>R$ {balance.toLocaleString()}</strong></div></div>
      </div>

      <div className="app-content-columns">
        <div className="app-col-primary">
          <section className="app-glass-section waste-alert">
            <div className="section-title-row">
              <h3>Análise de Gastos</h3>
              <span className="waste-badge">R$ {totalNonEssential.toLocaleString()} não essenciais</span>
            </div>
            <p>{biggestWaste ? `⚠️ Seu maior gasto supérfluo é "${biggestWaste.name}" (R$ ${biggestWaste.value.toFixed(2)}).` : "✅ Ótimo! Seus gastos estão focados no essencial."}</p>
          </section>

          <section className="app-glass-section">
            <h3>Novo Lançamento</h3>
            <div className="app-quick-form">
              <input placeholder="Descrição" value={name} onChange={e => setName(e.target.value)} />
              <input type="number" placeholder="Valor" value={value} onChange={e => setValue(e.target.value)} />
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <button className="app-btn-add" onClick={addTransaction}><Plus size={18} /></button>
            </div>
          </section>

          <section className="app-glass-section">
            <div className="section-title-row">
              <h3>Histórico</h3>
              <select className="app-month-filter" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="app-history-container">
              {filteredTransactions.reverse().map(t => (
                <div key={t.id} className="app-history-row">
                  <div className="history-info-group">
                    <strong>{t.name}</strong>
                    <div className="history-spacer"></div>
                    <span className={t.type === "income" ? "val-plus" : "val-minus"}>R$ {t.value.toFixed(2)}</span>
                    <button className="btn-delete-row" onClick={() => deleteTransaction(t.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="app-col-side">
          <section className="app-glass-section chart-section">
            <h3>Comparativo Mensal</h3>
            <div style={{ width: '100%', height: 300 }}>
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
        </aside>
      </div>
    </div>
  );
}