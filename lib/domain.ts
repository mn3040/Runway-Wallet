export type FinancialProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  riskTolerance: "Conservative" | "Balanced" | "Aggressive";
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  investmentBalance: number;
  highInterestDebt: number;
};

export type StoredGoal = {
  id: string;
  title: string;
  category: string;
  current: number;
  target: number;
  targetDate: string;
  color: string;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ModelExperiment = {
  id: string;
  modelVersion: string;
  symbol: string;
  strategy: string;
  years: number;
  status: "completed" | "failed";
  metrics: Record<string, number>;
  createdAt: string;
};

export type PaperOrder = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  modelVersion: string;
  experimentId?: string;
  createdAt: string;
};

export type AppData = {
  profile: FinancialProfile;
  goals: StoredGoal[];
  messages: ConversationMessage[];
  experiments: ModelExperiment[];
  paperOrders: PaperOrder[];
};
