import React, { useState, useEffect } from "react";
import "./App.css";
import { BrainCircuit, Wallet, Plus, Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function App() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");

  // Carrega os dados salvos ao iniciar o App
  useEffect(() => {
    const saved = localStorage.getItem("@FocusFinance:data");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Salva no LocalStorage sempre que a lista de transações mudar
  useEffect(() => {
    localStorage.setItem("@FocusFinance:data", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    // .trim() evita nomes vazios ou só com espaços
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
    if (transactions.length === 0)
      return "Adicione sua primeira movimentação para começar!";

    if (balance <= 0)
      return "Foco total em quitar dívidas e reduzir custos fixos.";

    const emergencyReserveGoal = expense * 6;

    if (balance < emergencyReserveGoal) {
      return `Sua prioridade é a Reserva de Emergência. Recomendo aplicar os R$ ${balance.toFixed(2)} no Tesouro SELIC.`;
    }

    return "Reserva OK! Hora de diversificar em FIIs ou Ações.";
  };

  const chartData = [
    { label: "Ganhos", total: income },
    { label: "Gastos", total: expense },
  ];

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wallet size={28} /> FocusFinance
          </h1>
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
                placeholder="Nome da transação"
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
              {transactions.length === 0 && (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  Nenhuma transação encontrada.
                </p>
              )}
              {transactions.map((t) => (
                <li key={t.id} className="history-item">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold" }}>{t.name}</span>
                    <small style={{ color: "#999" }}>
                      {new Date(t.id).toLocaleDateString()}
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
                      {t.type === "income" ? "+" : "-"} R$ {t.value.toFixed(2)}
                    </span>
                    <Trash2
                      size={18}
                      color="#bbb"
                      style={{ cursor: "pointer" }}
                      className="btn-delete"
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
            <div
              className="ai-title"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <BrainCircuit size={20} /> Sugestão da IA
            </div>
            <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: "1.4" }}>
              {getAISuggestion()}
            </p>
          </div>

          <div className="card" style={{ height: "320px" }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              Gráfico Mensal
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
