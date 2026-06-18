"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, Bot, BrainCircuit, Database, FlaskConical, Gauge, LoaderCircle, Play, Save, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResearchEquityChart } from "@/components/charts";
import { Card, PageHeader, Pill, Progress } from "@/components/ui";
import { BacktestResult, StrategyName } from "@/lib/trading-engine";

const strategies: Record<StrategyName, { risk: string; description: string }> = {
  Conservative: { risk: "Higher entry threshold", description: "Trades less often and requires stronger model confidence." },
  Balanced: { risk: "Moderate threshold", description: "Balances market participation with downside avoidance." },
  Aggressive: { risk: "Lower entry threshold", description: "Stays invested more often and accepts more volatility." },
};

const symbols = ["SPY", "QQQ", "IWM", "DIA", "VTI"];

export function Robot() {
  const [strategy, setStrategy] = useState<StrategyName>("Balanced");
  const [symbol, setSymbol] = useState("SPY");
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("runway-research-settings");
    if (!saved) return;
    try {
      const settings = JSON.parse(saved);
      if (symbols.includes(settings.symbol)) setSymbol(settings.symbol);
      if (["Conservative", "Balanced", "Aggressive"].includes(settings.strategy)) setStrategy(settings.strategy);
      if ([3, 5, 10].includes(settings.years)) setYears(settings.years);
    } catch {
      // Ignore malformed local demo state.
    }
  }, []);

  const runResearch = useCallback(async () => {
    setLoading(true);
    setError("");
    window.localStorage.setItem("runway-research-settings", JSON.stringify({ symbol, strategy, years }));
    try {
      const response = await fetch(`/api/backtest?symbol=${symbol}&strategy=${strategy}&years=${years}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Backtest failed.");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Backtest failed.");
    } finally {
      setLoading(false);
    }
  }, [symbol, strategy, years]);

  useEffect(() => {
    runResearch();
  }, [runResearch]);

  async function savePaperTrade() {
    if (!result) return;
    setOrderStatus("Saving...");
    const response = await fetch("/api/paper-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: result.symbol,
        side: result.signal === "BUY" ? "BUY" : "SELL",
        quantity: 1,
        price: result.lastPrice,
        modelVersion: result.modelVersion,
        experimentId: result.experimentId,
      }),
    });
    setOrderStatus(response.ok ? "Saved to paper ledger ✓" : "Could not save order");
    window.setTimeout(() => setOrderStatus(""), 2500);
  }

  return (
    <>
      <PageHeader
        eyebrow="AI market research lab"
        title="Train it. Test it. Question it."
        description="Run a walk-forward machine-learning strategy against real historical ETF data before considering any paper-trading experiment."
        action={<Pill tone="purple"><BrainCircuit className="mr-1.5" size={12} /> Research mode</Pill>}
      />

      <Card className="mb-4 border-amber-300/15 bg-amber-300/[0.035] p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={17} />
          <p className="text-xs leading-5 text-zinc-400"><strong className="font-medium text-amber-200">Research and education only.</strong> This experimental model does not provide investment advice, predict returns, or place trades. Backtests can overfit, market data may contain errors, and simulated results can differ substantially from live outcomes.</p>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-5 sm:p-6 xl:col-span-4">
          <p className="eyebrow">Experiment setup</p>
          <h2 className="mt-2 text-lg font-semibold">Backtest configuration</h2>
          <div className="mt-6 space-y-5">
            <label className="block text-xs text-zinc-500">Market ETF
              <select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="input mt-2">
                {symbols.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs text-zinc-500">History window
              <select value={years} onChange={(event) => setYears(Number(event.target.value))} className="input mt-2">
                <option value={3}>3 years</option>
                <option value={5}>5 years</option>
                <option value={10}>10 years</option>
              </select>
            </label>
            <div>
              <p className="text-xs text-zinc-500">Risk behavior</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(strategies) as StrategyName[]).map((item) => (
                  <button key={item} onClick={() => setStrategy(item)} className={cn("rounded-xl border px-2 py-3 text-[11px] font-medium transition", strategy === item ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-300" : "border-white/[0.07] text-zinc-500 hover:text-zinc-200")}>{item}</button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-zinc-600">{strategies[strategy].description}</p>
            </div>
            <button onClick={runResearch} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 py-3 text-sm font-semibold text-zinc-950 transition disabled:opacity-50">
              {loading ? <LoaderCircle className="animate-spin" size={16} /> : <Play size={15} fill="currentColor" />}
              {loading ? "Training and testing..." : "Run experiment"}
            </button>
          </div>
          <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
            <ResearchStep icon={<Database size={14} />} title="Real daily prices" detail="Adjusted historical ETF data" />
            <ResearchStep icon={<BrainCircuit size={14} />} title="Walk-forward training" detail="No future rows enter training" />
            <ResearchStep icon={<FlaskConical size={14} />} title="Out-of-sample test" detail="Costs included on position changes" />
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-8">
          {error && <Card className="border-rose-400/20 bg-rose-400/[0.04] p-5 text-sm text-rose-300">{error}</Card>}
          {!result && !error && <Card className="grid min-h-72 place-items-center p-8 text-center"><div><LoaderCircle className="mx-auto animate-spin text-emerald-300" /><p className="mt-4 text-sm text-zinc-500">Preparing the research run…</p></div></Card>}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric label="Robot return" value={`${signed(result.metrics.totalReturn)}%`} positive={result.metrics.totalReturn >= 0} />
                <Metric label="Buy & hold" value={`${signed(result.metrics.benchmarkReturn)}%`} positive={result.metrics.benchmarkReturn >= 0} />
                <Metric label="Max drawdown" value={`${result.metrics.maxDrawdown}%`} />
                <Metric label="Sharpe ratio" value={String(result.metrics.sharpe)} />
              </div>
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div><p className="eyebrow">Out-of-sample equity curve</p><h2 className="mt-2 text-lg font-semibold">$10,000 simulated investment</h2><p className="mt-1 text-[11px] text-zinc-600">{result.startDate} to {result.endDate}</p></div>
                  <div className="flex gap-3 text-[10px] text-zinc-500"><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-emerald-300" />ML robot</span><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-zinc-500" />Buy & hold</span></div>
                </div>
                <div className="mt-5"><ResearchEquityChart data={result.equity} /></div>
              </Card>
            </>
          )}
        </div>

        {result && (
          <>
            <Card className="p-5 sm:p-6 xl:col-span-7">
              <div className="flex items-start justify-between">
                <div><p className="eyebrow">Latest model state</p><h2 className="mt-2 text-lg font-semibold">{result.symbol} signal</h2><p className="mt-1 font-mono text-[10px] text-zinc-700">{result.modelVersion}</p></div>
                <div className="flex items-center gap-2"><button onClick={savePaperTrade} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-[10px] text-zinc-400 transition hover:text-white"><Save size={11} /> Paper trade</button><Pill tone={result.signal === "BUY" ? "green" : "amber"}>{result.signal === "BUY" ? "INVESTED" : "IN CASH"}</Pill></div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-[150px_1fr]">
                <div className="rounded-2xl bg-black/20 p-5 text-center">
                  <p className="text-[10px] text-zinc-600">UP-DAY PROBABILITY</p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{result.confidence}%</p>
                  <p className="mt-2 text-xs text-zinc-600">${result.lastPrice}</p>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-[10px] text-zinc-600"><span>MODEL CONFIDENCE</span><span>{result.confidence}%</span></div>
                  <Progress value={result.confidence} color={result.signal === "BUY" ? "#6ee7b7" : "#fbbf24"} />
                  <div className="mt-5 space-y-3">
                    {result.explanation.map((item) => <p key={item} className="text-xs leading-5 text-zinc-500">• {item}</p>)}
                  </div>
                </div>
              </div>
              {orderStatus && <p className="mt-4 text-right text-[11px] text-emerald-300">{orderStatus}</p>}
            </Card>

            <Card className="p-5 sm:p-6 xl:col-span-5">
              <p className="eyebrow">Research diagnostics</p>
              <h2 className="mt-2 text-lg font-semibold">What the headline hides</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Diagnostic label="Annualized return" value={`${result.metrics.cagr}%`} icon={<TrendingUp size={14} />} />
                <Diagnostic label="Benchmark CAGR" value={`${result.metrics.benchmarkCagr}%`} icon={<Activity size={14} />} />
                <Diagnostic label="Market exposure" value={`${result.metrics.exposure}%`} icon={<Gauge size={14} />} />
                <Diagnostic label="Trade events" value={String(result.metrics.trades)} icon={<TrendingDown size={14} />} />
              </div>
              <p className="mt-5 text-[11px] leading-5 text-zinc-600">{result.model}. Source: {result.dataSource}. Results include estimated transaction costs but not taxes, spreads, slippage beyond the estimate, or dividends not reflected in adjusted data.</p>
            </Card>

            <Card className="p-5 sm:p-6 xl:col-span-8">
              <div><p className="eyebrow">Paper trade ledger</p><h2 className="mt-2 text-lg font-semibold">Recent position changes</h2></div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="text-[10px] uppercase tracking-wider text-zinc-600"><tr><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Price</th><th className="pb-3 font-medium">Model probability</th></tr></thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {result.trades.map((trade) => <tr key={`${trade.date}-${trade.action}`}><td className="py-3 text-zinc-500">{trade.date}</td><td className={cn("py-3 font-medium", trade.action === "BUY" ? "text-emerald-300" : "text-amber-300")}>{trade.action}</td><td className="py-3">${trade.price}</td><td className="py-3">{trade.probability}%</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 xl:col-span-4">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300"><ShieldCheck size={18} /></span>
              <p className="eyebrow mt-6">Before paper trading</p>
              <h2 className="mt-2 text-lg font-semibold">Research gates</h2>
              <div className="mt-5 space-y-4">
                {["Test multiple market regimes", "Compare against simple rules", "Reserve an untouched holdout set", "Paper trade for 3–6 months", "Set loss and data-failure limits"].map((item) => <div key={item} className="flex items-center gap-3 text-xs text-zinc-400"><span className="grid size-5 place-items-center rounded-full bg-emerald-300/10 text-[10px] text-emerald-300">✓</span>{item}</div>)}
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return <Card className="p-4"><p className="text-[10px] text-zinc-600">{label}</p><p className={cn("mt-2 text-xl font-semibold tracking-[-0.03em]", positive === true && "text-emerald-300", positive === false && "text-rose-300")}>{value}</p></Card>;
}

function Diagnostic({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-xl bg-white/[0.03] p-3"><span className="text-zinc-600">{icon}</span><p className="mt-3 text-[10px] text-zinc-600">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

function ResearchStep({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-zinc-500">{icon}</span><div><p className="text-xs text-zinc-300">{title}</p><p className="mt-0.5 text-[10px] text-zinc-600">{detail}</p></div></div>;
}
