import React from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";
import type { PieChartData } from "../types/finance";

interface SuperfluousChartProps {
  pieData: PieChartData[];
  showPrivateNames: boolean;
  setShowPrivateNames: (val: boolean) => void;
  renderCustomizedLabel: (props: PieLabelRenderProps) => React.ReactNode;
  getDynamicColor: (index: number, total: number) => string;
}

export const SuperfluousChart: React.FC<SuperfluousChartProps> = ({
  pieData,
  showPrivateNames,
  setShowPrivateNames,
  renderCustomizedLabel,
  getDynamicColor,
}) => {
  return (
    <section className="app-glass-section chart-section">
      <div className="section-title-row" style={{ marginBottom: "10px" }}>
        <h3>Maiores Supérfluos</h3>
        <button
          className="btn-privacy-toggle"
          onClick={() => setShowPrivateNames(!showPrivateNames)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            background: "rgba(139, 92, 246, 0.1)",
            color: "#8b5cf6",
            border: "none",
            padding: "5px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {showPrivateNames ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPrivateNames ? "Mascarar" : "Revelar"}
        </button>
      </div>

      <div style={{ width: "100%", height: 180 }}>
        {pieData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={75}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getDynamicColor(index, pieData.length)}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | string | undefined, name: string | number | undefined) => [
                  `R$ ${Number(value || 0).toLocaleString()}`,
                  showPrivateNames ? String(name) : "Gasto Oculto",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Nenhum gasto supérfluo registrado.
          </div>
        )}
      </div>

      {pieData.length > 0 && (
        <div className="custom-alternating-legend">
          {pieData.map((item, index) => (
            <div key={item.id} className="legend-alternant-item">
              <span
                className="legend-color-badge"
                style={{
                  backgroundColor: getDynamicColor(index, pieData.length),
                }}
              />
              <div className="legend-text-group">
                <span className="legend-item-name">
                  {showPrivateNames ? item.name : `Gasto #${index + 1}`}
                </span>
                <span className="legend-item-value">
                  R$ {item.value.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
