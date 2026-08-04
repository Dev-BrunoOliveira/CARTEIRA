import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { months, ESSENCIAIS } from "./constants/finance";
import type { PieLabelRenderProps } from "recharts";
import type { Transaction, MonthlyChartData } from "./types/finance";

import { AuthScreen } from "./components/AuthScreen";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { WasteAnalysis } from "./components/WasteAnalysis";
import { AiConsulting } from "./components/AiConsulting";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionHistory } from "./components/TransactionHistory";
import { MonthlyChart } from "./components/MonthlyChart";
import { SuperfluousChart } from "./components/SuperfluousChart";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  const fetchTransactions = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setTransactions(data);
  }, [session]);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session, fetchTransactions]);

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
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert(String(error));
    }
  };

  const addTransaction = async () => {
    if (!name.trim() || !value || !session?.user?.id) return;
    if (name.trim().length > 100) return;

    const numVal = parseFloat(value.replace(/\./g, "").replace(",", "."));
    if (isNaN(numVal) || numVal <= 0 || numVal > 10_000_000) return;

    const targetDate = new Date(transactionDate + "T12:00:00").toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          name: name.trim(),
          value: numVal,
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

  const deleteTransaction = async (id: string | number) => {
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

  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const trueNonEssential = filteredTransactions.filter(
    (t) => t.type === "expense" && !ESSENCIAIS.includes(t.name),
  );

  const totalNonEssential = trueNonEssential.reduce(
    (a, b) => a + (b.value || 0),
    0,
  );

  const biggestWaste =
    trueNonEssential.length > 0
      ? [...trueNonEssential].sort((a, b) => b.value - a.value)[0]
      : null;

  const getMonthlyData = (): MonthlyChartData[] => {
    const chartMap: Record<string, MonthlyChartData> = {};
    months.forEach((m) => (chartMap[m] = { name: m, Ganhos: 0, Gastos: 0 }));
    transactions.forEach((t) => {
      const mName = months[new Date(t.created_at).getMonth()];
      chartMap[mName] = chartMap[mName] || {
        name: mName,
        Ganhos: 0,
        Gastos: 0,
      };
      if (t.type === "income") chartMap[mName].Ganhos += t.value || 0;
      else chartMap[mName].Gastos += t.value || 0;
    });
    return Object.values(chartMap);
  };

  const getPieData = () => {
    if (trueNonEssential.length === 0) return [];

    const groupedWastes: { [key: string]: number } = {};

    trueNonEssential.forEach((t) => {
      const gName = t.name;
      groupedWastes[gName] = (groupedWastes[gName] || 0) + (t.value || 0);
    });

    return Object.keys(groupedWastes)
      .map((gName, index) => ({
        id: `gasto-${index}`,
        name: gName,
        value: parseFloat(groupedWastes[gName].toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getDynamicColor = (index: number, total: number) => {
    const baseColors = [
      "#f43f5e",
      "#ec4899",
      "#d946ef",
      "#8b5cf6",
      "#f97316",
      "#eab308",
      "#ef4444",
      "#a855f7",
    ];
    if (index < baseColors.length) return baseColors[index];

    const hue = (index * (360 / (total || 1))) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  const pieData = getPieData();

  const renderCustomizedLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  }: PieLabelRenderProps) => {
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const RADIAN = Math.PI / 180;
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

    return Number(percent) > 0.04 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(Number(percent) * 100).toFixed(0)}%`}
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
      setAiInsights(
        "Erro de Ambiente: A chave VITE_GEMINI_API_KEY não foi encontrada.",
      );
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

      if (
        resData.candidates &&
        resData.candidates[0]?.content?.parts?.[0]?.text
      ) {
        setAiInsights(resData.candidates[0].content.parts[0].text);
      } else if (resData.error) {
        setAiInsights(`Erro retornado pelo Google: ${resData.error.message}`);
      } else {
        setAiInsights(
          "Nota: Erro de parse na resposta. Verifique o console da aplicação.",
        );
      }
    } catch {
      setAiInsights(
        "Erro de conexão com o servidor. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoadingAi(false);
    }
  };

  if (loadingInitial)
    return <div className="loading-screen">Carregando...</div>;

  if (!session) {
    return (
      <AuthScreen
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleAuth={handleAuth}
      />
    );
  }

  return (
    <div className="app-main-layout">
      <Header />

      <SummaryCards
        income={income}
        expense={expense}
        balance={balance}
        savingsRate={savingsRate}
      />

      <div className="app-content-columns">
        <div className="app-col-primary">
          <WasteAnalysis
            totalNonEssential={totalNonEssential}
            biggestWaste={biggestWaste}
          />

          <AiConsulting
            generateAiAnalysis={generateAiAnalysis}
            loadingAi={loadingAi}
            aiInsights={aiInsights}
          />

          <TransactionForm
            name={name}
            setName={setName}
            value={value}
            setValue={setValue}
            transactionDate={transactionDate}
            setTransactionDate={setTransactionDate}
            type={type}
            setType={setType}
            addTransaction={addTransaction}
          />

          <TransactionHistory
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            months={months}
            filteredTransactions={filteredTransactions}
            deleteTransaction={deleteTransaction}
          />
        </div>

        <aside className="app-col-side">
          <MonthlyChart data={getMonthlyData()} />

          <SuperfluousChart
            pieData={pieData}
            showPrivateNames={showPrivateNames}
            setShowPrivateNames={setShowPrivateNames}
            renderCustomizedLabel={renderCustomizedLabel}
            getDynamicColor={getDynamicColor}
          />
        </aside>
      </div>
    </div>
  );
}
