export interface Transaction {
  id: string | number;
  name: string;
  value: number;
  type: "income" | "expense" | string;
  user_id?: string;
  created_at: string;
}

export interface MonthlyChartData {
  name: string;
  Ganhos: number;
  Gastos: number;
}

export interface PieChartData {
  id: string;
  name: string;
  value: number;
}
