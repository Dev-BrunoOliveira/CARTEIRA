import React from "react";
import { Trash2 } from "lucide-react";
import type { Transaction } from "../types/finance";

interface TransactionHistoryProps {
  selectedMonth: number;
  setSelectedMonth: (val: number) => void;
  months: string[];
  filteredTransactions: Transaction[];
  deleteTransaction: (id: string | number) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  selectedMonth,
  setSelectedMonth,
  months,
  filteredTransactions,
  deleteTransaction,
}) => {
  return (
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
              <span
                className={t.type === "income" ? "val-plus" : "val-minus"}
              >
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
  );
};
