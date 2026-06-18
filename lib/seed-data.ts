import { AppData } from "@/lib/domain";

export const seedData: AppData = {
  profile: {
    id: "demo-user",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@runway.demo",
    location: "New York, NY",
    riskTolerance: "Balanced",
    monthlyIncome: 7500,
    monthlyExpenses: 4250,
    liquidSavings: 41240,
    investmentBalance: 92180,
    highInterestDebt: 5000,
  },
  goals: [
    { id: "goal-emergency", title: "Six-month safety net", category: "Emergency fund", current: 18400, target: 24000, targetDate: "Oct 2026", color: "#6ee7b7" },
    { id: "goal-debt", title: "Clear student loan", category: "Debt payoff", current: 12300, target: 20000, targetDate: "May 2027", color: "#a78bfa" },
    { id: "goal-home", title: "First home", category: "Down payment", current: 34000, target: 80000, targetDate: "Jun 2029", color: "#60a5fa" },
    { id: "goal-retirement", title: "Work-optional fund", category: "Retirement", current: 92180, target: 1200000, targetDate: "2047", color: "#f59e0b" },
  ],
  messages: [],
  experiments: [],
  paperOrders: [],
};
