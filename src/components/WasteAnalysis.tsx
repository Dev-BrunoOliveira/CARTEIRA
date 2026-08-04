import React from "react";
import type { Transaction } from "../types/finance";

interface WasteAnalysisProps {
  totalNonEssential: number;
  biggestWaste: Transaction | null;
}

export const WasteAnalysis: React.FC<WasteAnalysisProps> = ({
  totalNonEssential,
  biggestWaste,
}) => {
  return (
    <section className="app-glass-section waste-alert">
      <div className="section-title-row">
        <h3>Análise de Gastos</h3>
        <span className="waste-badge">
          R$ {totalNonEssential.toLocaleString()} não essenciais
        </span>
      </div>
      <p>
        {biggestWaste
          ? `⚠️ Seu maior gasto supérfluo é "${biggestWaste.name}" (R$ ${biggestWaste.value.toFixed(2)}).`
          : "✅ Ótimo! Seus gastos estão focados no essencial."}
      </p>
    </section>
  );
};
