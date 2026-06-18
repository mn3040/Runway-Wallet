import { AppData } from "@/lib/domain";

export type CopilotResult = {
  answer: string;
  assumptions: string[];
  calculations: Array<{ label: string; value: string }>;
  options: Array<{ title: string; description: string; impact: string }>;
  confidence: "low" | "medium" | "high";
  warnings: string[];
  suggestedActions: Array<{ label: string; action: string }>;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const financialToolDefinitions = [
  {
    type: "function",
    name: "get_financial_snapshot",
    description: "Get the user's current income, expenses, savings, debt, investments, risk tolerance, and goals.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    strict: true,
  },
  {
    type: "function",
    name: "calculate_runway",
    description: "Calculate how many months current liquid savings can cover expenses.",
    parameters: {
      type: "object",
      properties: {
        monthly_expenses_override: { type: ["number", "null"], description: "Optional scenario expense amount." },
      },
      required: ["monthly_expenses_override"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "simulate_purchase",
    description: "Calculate the cash-flow and runway effect of a purchase or recurring payment.",
    parameters: {
      type: "object",
      properties: {
        upfront_cost: { type: "number" },
        monthly_payment: { type: "number" },
      },
      required: ["upfront_cost", "monthly_payment"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "project_goal",
    description: "Estimate months to reach a savings goal using a monthly contribution.",
    parameters: {
      type: "object",
      properties: {
        current: { type: "number" },
        target: { type: "number" },
        monthly_contribution: { type: "number" },
      },
      required: ["current", "target", "monthly_contribution"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "compare_debt_payment",
    description: "Estimate payoff months for a debt using a proposed monthly payment. This is a simplified estimate.",
    parameters: {
      type: "object",
      properties: {
        balance: { type: "number" },
        annual_rate_percent: { type: "number" },
        monthly_payment: { type: "number" },
      },
      required: ["balance", "annual_rate_percent", "monthly_payment"],
      additionalProperties: false,
    },
    strict: true,
  },
] as const;

export function runFinancialTool(name: string, args: Record<string, unknown>, data: AppData) {
  const profile = data.profile;
  if (name === "get_financial_snapshot") {
    return { profile, goals: data.goals, monthlySurplus: profile.monthlyIncome - profile.monthlyExpenses };
  }
  if (name === "calculate_runway") {
    const expenses = Number(args.monthly_expenses_override) || profile.monthlyExpenses;
    return {
      liquidSavings: profile.liquidSavings,
      monthlyExpenses: expenses,
      runwayMonths: expenses > 0 ? profile.liquidSavings / expenses : null,
    };
  }
  if (name === "simulate_purchase") {
    const upfront = Math.max(0, Number(args.upfront_cost) || 0);
    const monthlyPayment = Math.max(0, Number(args.monthly_payment) || 0);
    const remainingSavings = Math.max(0, profile.liquidSavings - upfront);
    const newExpenses = profile.monthlyExpenses + monthlyPayment;
    return {
      remainingSavings,
      newMonthlySurplus: profile.monthlyIncome - newExpenses,
      runwayMonths: newExpenses > 0 ? remainingSavings / newExpenses : null,
      affordableByCashFlow: profile.monthlyIncome - newExpenses > 0,
    };
  }
  if (name === "project_goal") {
    const current = Number(args.current) || 0;
    const target = Number(args.target) || 0;
    const contribution = Number(args.monthly_contribution) || 0;
    return {
      remaining: Math.max(0, target - current),
      months: contribution > 0 ? Math.ceil(Math.max(0, target - current) / contribution) : null,
    };
  }
  if (name === "compare_debt_payment") {
    let balance = Math.max(0, Number(args.balance) || 0);
    const rate = Math.max(0, Number(args.annual_rate_percent) || 0) / 1200;
    const payment = Math.max(0, Number(args.monthly_payment) || 0);
    let months = 0;
    let interest = 0;
    while (balance > 0.01 && months < 600 && payment > balance * rate) {
      const monthlyInterest = balance * rate;
      interest += monthlyInterest;
      balance = Math.max(0, balance + monthlyInterest - payment);
      months += 1;
    }
    return { months: months >= 600 ? null : months, estimatedInterest: interest, payment };
  }
  throw new Error(`Unknown financial tool: ${name}`);
}

export function deterministicCopilot(question: string, data: AppData): CopilotResult {
  const profile = data.profile;
  const surplus = profile.monthlyIncome - profile.monthlyExpenses;
  const runway = profile.liquidSavings / profile.monthlyExpenses;
  const lower = question.toLowerCase();

  if (lower.includes("car") || lower.includes("afford")) {
    const comfortablePayment = Math.max(0, Math.round(surplus * 0.18 / 25) * 25);
    return {
      answer: `Your current cash flow could support a payment around ${currency.format(comfortablePayment)}, but the purchase should preserve your emergency runway and account for insurance, maintenance, and registration.`,
      assumptions: ["Monthly income and expenses match your saved profile.", "The estimate reserves most of your monthly surplus for existing goals.", "No loan rate or purchase price was provided."],
      calculations: [
        { label: "Monthly surplus", value: currency.format(surplus) },
        { label: "Current runway", value: `${runway.toFixed(1)} months` },
        { label: "Illustrative payment ceiling", value: currency.format(comfortablePayment) },
      ],
      options: [
        { title: "Preserve flexibility", description: "Save a larger down payment before purchasing.", impact: "Best runway protection" },
        { title: "Buy sooner", description: "Keep the all-in payment below the estimate.", impact: "Slower goal progress" },
      ],
      confidence: "medium",
      warnings: ["This does not include loan APR, insurance, taxes, repairs, or depreciation.", "This is educational planning, not individualized financial advice."],
      suggestedActions: [{ label: "Model a specific car", action: "simulate_purchase" }],
    };
  }

  if (lower.includes("debt")) {
    const proposed = Math.min(Math.max(500, surplus * 0.4), surplus);
    return {
      answer: `The highest-interest balance is usually the strongest mathematical first target. With your current surplus, an illustrative extra payment of ${currency.format(proposed)} would preserve room for savings while accelerating payoff.`,
      assumptions: ["Debt interest rates are not yet stored.", "Your emergency cash is not used for the payoff."],
      calculations: [
        { label: "High-interest balance", value: currency.format(profile.highInterestDebt) },
        { label: "Monthly surplus", value: currency.format(surplus) },
        { label: "Illustrative extra payment", value: currency.format(proposed) },
      ],
      options: [
        { title: "Avalanche", description: "Pay the highest-rate debt first.", impact: "Usually lowest interest cost" },
        { title: "Snowball", description: "Pay the smallest balance first.", impact: "Potentially stronger motivation" },
      ],
      confidence: "medium",
      warnings: ["Enter balances, minimum payments, and APRs before relying on a payoff projection."],
      suggestedActions: [{ label: "Add debt details", action: "open_settings" }],
    };
  }

  return {
    answer: `You currently have an estimated ${runway.toFixed(1)} months of financial runway and a monthly surplus of ${currency.format(surplus)}. The strongest next move is the one that improves your priority goal without materially weakening that buffer.`,
    assumptions: ["Saved profile values are current.", "Liquid savings are available for ordinary expenses.", "Taxes and irregular spending are not separately modeled."],
    calculations: [
      { label: "Monthly surplus", value: currency.format(surplus) },
      { label: "Financial runway", value: `${runway.toFixed(1)} months` },
      { label: "Investments", value: currency.format(profile.investmentBalance) },
    ],
    options: data.goals.slice(0, 2).map((goal) => ({
      title: goal.title,
      description: `${currency.format(goal.current)} of ${currency.format(goal.target)} funded.`,
      impact: `${Math.round(goal.current / goal.target * 100)}% complete`,
    })),
    confidence: "high",
    warnings: ["This is educational planning and does not replace a qualified financial professional."],
    suggestedActions: [{ label: "Compare a scenario", action: "simulate_purchase" }],
  };
}
