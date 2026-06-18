"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { allocation, backtest, netWorthHistory, spending } from "@/lib/mock-data";

const tooltipStyle = {
  backgroundColor: "#15181e",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
};

export function NetWorthChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={netWorthHistory} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString()}`, "Net worth"]} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
        <Area type="monotone" dataKey="value" stroke="#6ee7b7" strokeWidth={2} fill="url(#netWorth)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ type }: { type: "spending" | "allocation" }) {
  const data = type === "spending" ? spending : allocation;
  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={3} stroke="none">
          {data.map((item) => <Cell key={item.name} fill={item.color} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [type === "spending" ? `$${value}` : `${value}%`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BacktestChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={backtest} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`]} />
        <Bar dataKey="robot" name="Robot" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
        <Bar dataKey="benchmark" name="Benchmark" fill="#343840" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
