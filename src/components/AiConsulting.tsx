import React from "react";
import { BrainCircuit } from "lucide-react";

interface AiConsultingProps {
  generateAiAnalysis: () => void;
  loadingAi: boolean;
  aiInsights: string;
}

export const AiConsulting: React.FC<AiConsultingProps> = ({
  generateAiAnalysis,
  loadingAi,
  aiInsights,
}) => {
  return (
    <section className="app-glass-section ai-section">
      <div className="section-title-row">
        <h3>
          <BrainCircuit size={20} color="#8b5cf6" /> Consultoria IA
        </h3>
        <button
          className="app-btn-ai"
          onClick={generateAiAnalysis}
          disabled={loadingAi}
        >
          {loadingAi ? "Analisando..." : "Analisar Mês"}
        </button>
      </div>
      {aiInsights && (
        <div className="ai-response-container">
          <div
            style={{
              whiteSpace: "pre-line",
              fontSize: "14px",
              marginTop: "15px",
              color: "#475569",
            }}
          >
            {aiInsights}
          </div>
        </div>
      )}
    </section>
  );
};
