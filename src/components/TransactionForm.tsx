import React from "react";
import { Plus } from "lucide-react";

interface TransactionFormProps {
  name: string;
  setName: (val: string) => void;
  value: string;
  setValue: (val: string) => void;
  transactionDate: string;
  setTransactionDate: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  addTransaction: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  name,
  setName,
  value,
  setValue,
  transactionDate,
  setTransactionDate,
  type,
  setType,
  addTransaction,
}) => {
  return (
    <section className="app-glass-section">
      <h3>Novo Lançamento</h3>
      <div className="app-quick-form">
        <input
          placeholder="Descrição"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Valor"
          value={value}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (!v) {
              setValue("");
              return;
            }
            v = (parseInt(v, 10) / 100).toFixed(2);
            v = v.replace(".", ",");
            v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            setValue(v);
          }}
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
  );
};
