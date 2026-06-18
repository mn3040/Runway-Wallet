export type StrategyName = "Conservative" | "Balanced" | "Aggressive";

export type PriceBar = {
  date: string;
  close: number;
};

export type EquityPoint = {
  date: string;
  robot: number;
  benchmark: number;
  probability: number;
  invested: boolean;
};

export type Trade = {
  date: string;
  action: "BUY" | "SELL";
  price: number;
  probability: number;
};

export type BacktestResult = {
  experimentId?: string;
  modelVersion: string;
  symbol: string;
  startDate: string;
  endDate: string;
  dataSource: string;
  model: string;
  strategy: StrategyName;
  signal: "BUY" | "CASH";
  confidence: number;
  lastPrice: number;
  metrics: {
    totalReturn: number;
    benchmarkReturn: number;
    cagr: number;
    benchmarkCagr: number;
    sharpe: number;
    maxDrawdown: number;
    trades: number;
    exposure: number;
  };
  equity: EquityPoint[];
  trades: Trade[];
  explanation: string[];
};

type FeatureRow = {
  date: string;
  close: number;
  features: number[];
  target: number;
  nextReturn: number;
};

const strategyConfig: Record<StrategyName, { enter: number; exit: number; costBps: number }> = {
  Conservative: { enter: 0.6, exit: 0.48, costBps: 8 },
  Balanced: { enter: 0.55, exit: 0.45, costBps: 6 },
  Aggressive: { enter: 0.51, exit: 0.42, costBps: 5 },
};

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function standardDeviation(values: number[]) {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, value))));
}

function calculateRsi(closes: number[], index: number, period = 14) {
  let gains = 0;
  let losses = 0;
  for (let i = index - period + 1; i <= index; i += 1) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 1;
  const relativeStrength = gains / losses;
  return (100 - 100 / (1 + relativeStrength)) / 100;
}

function buildFeatureRows(prices: PriceBar[]) {
  const closes = prices.map((bar) => bar.close);
  const rows: FeatureRow[] = [];
  for (let index = 60; index < prices.length - 1; index += 1) {
    const dailyReturns = closes.slice(index - 19, index + 1).map((close, offset, sample) => {
      if (offset === 0) return 0;
      return close / sample[offset - 1] - 1;
    }).slice(1);
    const sma20 = mean(closes.slice(index - 19, index + 1));
    const sma50 = mean(closes.slice(index - 49, index + 1));
    const nextReturn = closes[index + 1] / closes[index] - 1;
    rows.push({
      date: prices[index].date,
      close: closes[index],
      features: [
        closes[index] / closes[index - 5] - 1,
        closes[index] / closes[index - 20] - 1,
        closes[index] / sma20 - 1,
        sma20 / sma50 - 1,
        standardDeviation(dailyReturns) * Math.sqrt(252),
        calculateRsi(closes, index),
      ],
      target: nextReturn > 0 ? 1 : 0,
      nextReturn,
    });
  }
  return rows;
}

function trainLogisticRegression(rows: FeatureRow[]) {
  const featureCount = rows[0]?.features.length ?? 0;
  const averages = Array.from({ length: featureCount }, (_, index) => mean(rows.map((row) => row.features[index])));
  const deviations = Array.from({ length: featureCount }, (_, index) => standardDeviation(rows.map((row) => row.features[index])) || 1);
  const normalized = rows.map((row) => row.features.map((feature, index) => (feature - averages[index]) / deviations[index]));
  const weights = Array(featureCount + 1).fill(0);
  const learningRate = 0.08;
  const regularization = 0.002;

  for (let iteration = 0; iteration < 180; iteration += 1) {
    const gradients = Array(featureCount + 1).fill(0);
    normalized.forEach((features, rowIndex) => {
      const probability = sigmoid(weights[0] + features.reduce((sum, feature, index) => sum + feature * weights[index + 1], 0));
      const error = probability - rows[rowIndex].target;
      gradients[0] += error;
      features.forEach((feature, index) => {
        gradients[index + 1] += error * feature;
      });
    });
    weights.forEach((weight, index) => {
      const penalty = index === 0 ? 0 : regularization * weight;
      weights[index] -= learningRate * (gradients[index] / rows.length + penalty);
    });
  }

  return {
    predict(features: number[]) {
      const normalizedFeatures = features.map((feature, index) => (feature - averages[index]) / deviations[index]);
      return sigmoid(weights[0] + normalizedFeatures.reduce((sum, feature, index) => sum + feature * weights[index + 1], 0));
    },
  };
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function runBacktest(prices: PriceBar[], symbol: string, strategy: StrategyName): BacktestResult {
  const rows = buildFeatureRows(prices);
  if (rows.length < 320) throw new Error("At least 18 months of daily history is required.");

  const config = strategyConfig[strategy];
  let robotValue = 10000;
  let benchmarkValue = 10000;
  let invested = false;
  let model = trainLogisticRegression(rows.slice(0, 252));
  let probability = 0.5;
  let exposureDays = 0;
  const equity: EquityPoint[] = [];
  const trades: Trade[] = [];
  const robotReturns: number[] = [];

  for (let index = 252; index < rows.length; index += 1) {
    if ((index - 252) % 21 === 0) {
      model = trainLogisticRegression(rows.slice(Math.max(0, index - 756), index));
    }
    probability = model.predict(rows[index].features);
    let transactionCost = 0;
    if (!invested && probability >= config.enter) {
      invested = true;
      transactionCost = config.costBps / 10000;
      trades.push({ date: rows[index].date, action: "BUY", price: round(rows[index].close), probability: round(probability * 100, 1) });
    } else if (invested && probability <= config.exit) {
      invested = false;
      transactionCost = config.costBps / 10000;
      trades.push({ date: rows[index].date, action: "SELL", price: round(rows[index].close), probability: round(probability * 100, 1) });
    }
    const strategyReturn = (invested ? rows[index].nextReturn : 0) - transactionCost;
    robotValue *= 1 + strategyReturn;
    benchmarkValue *= 1 + rows[index].nextReturn;
    robotReturns.push(strategyReturn);
    if (invested) exposureDays += 1;
    equity.push({
      date: rows[index].date,
      robot: round(robotValue),
      benchmark: round(benchmarkValue),
      probability: round(probability * 100, 1),
      invested,
    });
  }

  const years = equity.length / 252;
  const totalReturn = robotValue / 10000 - 1;
  const benchmarkReturn = benchmarkValue / 10000 - 1;
  const cagr = (robotValue / 10000) ** (1 / years) - 1;
  const benchmarkCagr = (benchmarkValue / 10000) ** (1 / years) - 1;
  const returnDeviation = standardDeviation(robotReturns);
  const sharpe = returnDeviation ? mean(robotReturns) / returnDeviation * Math.sqrt(252) : 0;
  let peak = equity[0]?.robot ?? 10000;
  let maxDrawdown = 0;
  equity.forEach((point) => {
    peak = Math.max(peak, point.robot);
    maxDrawdown = Math.min(maxDrawdown, point.robot / peak - 1);
  });

  const last = rows[rows.length - 1];
  const featureLabels = ["5-day momentum", "20-day momentum", "short-term trend", "long-term trend", "volatility", "RSI"];
  const strongest = last.features
    .map((value, index) => ({ label: featureLabels[index], value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 3)
    .map((feature) => `${feature.label} is ${feature.value >= 0 ? "positive" : "negative"} (${round(feature.value * 100, 1)}%).`);

  return {
    modelVersion: "runway-logistic-ts-v1",
    symbol,
    startDate: equity[0].date,
    endDate: equity[equity.length - 1].date,
    dataSource: "Yahoo Finance historical chart data",
    model: "Walk-forward logistic classifier",
    strategy,
    signal: invested ? "BUY" : "CASH",
    confidence: round(probability * 100, 1),
    lastPrice: round(last.close),
    metrics: {
      totalReturn: round(totalReturn * 100, 1),
      benchmarkReturn: round(benchmarkReturn * 100, 1),
      cagr: round(cagr * 100, 1),
      benchmarkCagr: round(benchmarkCagr * 100, 1),
      sharpe: round(sharpe, 2),
      maxDrawdown: round(maxDrawdown * 100, 1),
      trades: trades.length,
      exposure: round(exposureDays / equity.length * 100, 1),
    },
    equity: equity.filter((_, index) => index % 5 === 0 || index === equity.length - 1),
    trades: trades.slice(-12).reverse(),
    explanation: strongest,
  };
}
