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
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

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

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });

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
      setTransactions([...transactions, data[0]]);
      setName("");
      setValue("");
    }
  };

  const deleteTransaction = async (id: any) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter((t) => t.id !== id));
  };

  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.created_at || t.id);
    return date.getMonth() === selectedMonth;
  });

  const getMonthlyData = () => {
    const chartData: any = {};
    transactions.forEach((t) => {
      const date = new Date(t.created_at || t.id);
      const mName = months[date.getMonth()].substring(0, 3);
      if (!chartData[mName])
        chartData[mName] = { name: mName, Ganhos: 0, Gastos: 0 };
      if (t.type === "income") chartData[mName].Ganhos += t.value;
      else chartData[mName].Gastos += t.value;
    });
    return Object.values(chartData);
  };

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.value, 0);
  const expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.value, 0);
  const balance = income - expense;

  // --- NOVA LÓGICA DE SUGESTÃO DE IA ---
  const getAISuggestion = () => {
    if (filteredTransactions.length === 0) 
      return `Lance suas movimentações de ${months[selectedMonth]} para eu analisar seu perfil.`;
    
    if (balance <= 0) {
      return "⚠️ Alerta: Seu saldo está zerado ou negativo. Foque em cortar gastos variáveis e quitar dívidas antes de investir.";
    }

    // Cálculo da Reserva (6 meses de gastos)
    const monthlyExpenses = expense;
    const emergencyReserveGoal = monthlyExpenses * 6;
    
    if (balance > 0 && balance < emergencyReserveGoal) {
      return `💰 Foco: Reserva de Emergência. Você tem R$ ${balance.toFixed(2)} sobrando. Recomendo o Tesouro SELIC ou CDB 100% CDI. Sua meta de segurança é R$ ${emergencyReserveGoal.toFixed(2)}.`;
    }

    return `🚀 Reserva OK! Com R$ ${balance.toFixed(2)} sobrando após sua reserva, diversifique: 70% em Renda Fixa (Tesouro IPCA), 20% em Fundos Imobiliários (FIIs) e 10% em Ações.`;
  };

  if (!session) return null;

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1><Wallet size={28} /> FocusFinance</h1>
        </div>
        <div className="balance-box">
          <span>SALDO EM {months[selectedMonth].toUpperCase()}</span>
          <h2 style={{ color: balance >= 0 ? "#2ecc71" : "#e74c3c" }}>
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div className="user-menu">
          <small>Olá, {session.user.user_metadata.full_name?.split(" ")[0]}</small>
          <button onClick={() => supabase.auth.signOut()} className="logout-button">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="grid-layout">
        <div className="left-column">
          <section className="card">
            <h3>Nova Movimentação</h3>
            <div className="form-group">
              <input placeholder="Descrição" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="number" placeholder="Valor R$" value={value} onChange={(e) => setValue(e.target.value)} />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <button className="btn-add" onClick={addTransaction}>Lançar</button>
            </div>
          </section>

          <section className="card">
            <div className="card-header-filter">
              <h3>Histórico</h3>
              <div className="filter-select">
                <Filter size={16} />
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                  {months.map((m, index) => <option key={m} value={index}>{m}</option>)}
                </select>
              </div>
            </div>
            <ul className="history-list">
              {[...filteredTransactions].reverse().map((t) => (
                <li key={t.id} className="history-item">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>{t.name}</strong>
                    <small>{new Date(t.created_at || t.id).toLocaleDateString()}</small>
                  </div>
                  <div className="history-actions">
                    <span className={t.type === "income" ? "income-text" : "expense-text"}>
                      R$ {t.value.toFixed(2)}
                    </span>
                    <Trash2 size={18} color="#bbb" onClick={() => deleteTransaction(t.id)} style={{ cursor: "pointer" }} />
                  </div>
                </li>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="empty-msg">Sem registros em {months[selectedMonth]}.</p>
              )}
            </ul>
          </section>
        </div>

        <div className="right-column">
          <div className="ai-box">
            <div className="ai-title">
              <BrainCircuit size={20} /> IA Financeira
            </div>
            <p className="ai-text">{getAISuggestion()}</p>
          </div>

          <div className="card" style={{ height: "400px" }}>
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Comparativo Anual</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyData()}>
                <XAxis dataKey="name" />
                <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                <Legend />
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