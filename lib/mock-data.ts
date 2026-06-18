export const netWorthHistory = [
  { month: "Jan", value: 112000 },
  { month: "Feb", value: 116800 },
  { month: "Mar", value: 119400 },
  { month: "Apr", value: 123100 },
  { month: "May", value: 125900 },
  { month: "Jun", value: 128420 },
];

export const accounts = [
  { name: "Everyday Checking", institution: "Chase", type: "Cash", balance: 12840, change: 2.1 },
  { name: "High-Yield Savings", institution: "Marcus", type: "Savings", balance: 28400, change: 0.4 },
  { name: "Investment Portfolio", institution: "Fidelity", type: "Investments", balance: 92180, change: 8.6 },
  { name: "Freedom Card", institution: "Chase", type: "Credit", balance: -5000, change: -6.2 },
];

export const spending = [
  { name: "Housing", value: 2150, color: "#6ee7b7" },
  { name: "Food", value: 740, color: "#a78bfa" },
  { name: "Transport", value: 460, color: "#60a5fa" },
  { name: "Lifestyle", value: 610, color: "#f59e0b" },
  { name: "Other", value: 290, color: "#52525b" },
];

export const allocation = [
  { name: "US Equities", value: 52, color: "#6ee7b7" },
  { name: "International", value: 18, color: "#a78bfa" },
  { name: "Bonds", value: 16, color: "#60a5fa" },
  { name: "Cash", value: 9, color: "#f59e0b" },
  { name: "Alternatives", value: 5, color: "#f472b6" },
];

export type Goal = {
  id: number;
  title: string;
  category: string;
  current: number;
  target: number;
  targetDate: string;
  color: string;
};

export const initialGoals: Goal[] = [
  { id: 1, title: "Six-month safety net", category: "Emergency fund", current: 18400, target: 24000, targetDate: "Oct 2026", color: "#6ee7b7" },
  { id: 2, title: "Clear student loan", category: "Debt payoff", current: 12300, target: 20000, targetDate: "May 2027", color: "#a78bfa" },
  { id: 3, title: "First home", category: "Down payment", current: 34000, target: 80000, targetDate: "Jun 2029", color: "#60a5fa" },
  { id: 4, title: "Work-optional fund", category: "Retirement", current: 92180, target: 1200000, targetDate: "2047", color: "#f59e0b" },
];

export const signals = [
  { ticker: "VTI", name: "Vanguard Total Stock Market", action: "BUY", confidence: 86, price: "$281.42", change: "+1.8%", reason: "Broad-market momentum is positive while valuation remains inside the strategy's accumulation band." },
  { ticker: "BND", name: "Vanguard Total Bond Market", action: "HOLD", confidence: 78, price: "$74.18", change: "+0.2%", reason: "Yield and duration exposure are aligned with the target risk profile. No rebalance needed." },
  { ticker: "QQQ", name: "Invesco QQQ Trust", action: "TRIM", confidence: 72, price: "$521.09", change: "-0.6%", reason: "Technology concentration exceeds the selected strategy's position limit after recent gains." },
];

export const backtest = [
  { year: "2020", robot: 12, benchmark: 15 },
  { year: "2021", robot: 19, benchmark: 18 },
  { year: "2022", robot: -9, benchmark: -18 },
  { year: "2023", robot: 21, benchmark: 24 },
  { year: "2024", robot: 17, benchmark: 16 },
  { year: "2025", robot: 14, benchmark: 12 },
];

export const suggestedPrompts = [
  "Can I afford a car?",
  "How much should I invest this month?",
  "What debt should I pay first?",
  "How soon can I reach financial independence?",
];

export const aiAnswers: Record<string, string> = {
  "Can I afford a car?": "Based on your current $3,250 monthly surplus and emergency fund progress, a car payment below $520 could fit without delaying your near-term goals. A larger down payment would keep your total transportation costs more comfortable.",
  "How much should I invest this month?": "A balanced move would be $1,400: $900 toward your diversified portfolio and $500 toward your emergency fund. That preserves flexibility while keeping your long-term plan moving.",
  "What debt should I pay first?": "Your Freedom Card is the strongest first target because its estimated interest rate is higher than your student loan. Paying an extra $750 monthly could clear it in roughly seven months.",
  "How soon can I reach financial independence?": "At your current savings pace, the rough projection is age 52. Increasing monthly investing by $600 could move that estimate closer to age 49. This is a planning estimate, not a guarantee.",
};
