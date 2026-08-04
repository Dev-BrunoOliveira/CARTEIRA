import React from "react";

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  income,
  expense,
  balance,
  savingsRate,
}) => {
  return (
    <div className="app-summary-grid custom-four-cards">
      <div className="app-stat-card income-card">
        <div>
          <small>Ganhos</small>
          <strong>R$ {income.toLocaleString()}</strong>
        </div>
      </div>
      <div className="app-stat-card expense-card">
        <div>
          <small>Gastos</small>
          <strong>R$ {expense.toLocaleString()}</strong>
        </div>
      </div>
      <div className="app-stat-card balance-card">
        <div>
          <small>Saldo Disponível</small>
          <strong>R$ {balance.toLocaleString()}</strong>
        </div>
      </div>
      <div
        className="app-stat-card savings-card"
        style={{ borderLeftColor: "#8b5cf6" }}
      >
        <div>
          <small>Taxa de Economia</small>
          <strong
            style={{
              color:
                savingsRate >= 20
                  ? "#10b981"
                  : savingsRate > 0
                    ? "#f97316"
                    : "#f43f5e",
            }}
          >
            {savingsRate.toFixed(1)}%
          </strong>
        </div>
      </div>
    </div>
  );
};
