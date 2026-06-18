"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Bot, ChevronRight, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { signals } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { BacktestChart } from "@/components/charts";
import { Card, PageHeader, Pill, Progress } from "@/components/ui";

const strategies = {
  Conservative: { stocks: 40, bonds: 45, cash: 15, risk: "Lower", return: "5.8%" },
  Balanced: { stocks: 65, bonds: 25, cash: 10, risk: "Moderate", return: "8.4%" },
  Aggressive: { stocks: 85, bonds: 10, cash: 5, risk: "Higher", return: "11.2%" },
};

export function Robot() {
  const [strategy, setStrategy] = useState<keyof typeof strategies>("Balanced");
  const profile = strategies[strategy];

  return (
    <>
      <PageHeader
        eyebrow="Paper trading lab"
        title="Put a strategy on autopilot."
        description="Explore model-generated signals and simulated performance without connecting a brokerage or risking real money."
        action={<Pill tone="purple"><Bot className="mr-1.5" size={12} /> Simulation active</Pill>}
      />

      <Card className="mb-4 border-amber-300/15 bg-amber-300/[0.035] p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={17} />
          <p className="text-xs leading-5 text-zinc-400"><strong className="font-medium text-amber-200">Educational simulation only.</strong> This robot uses mock data, places no trades, and is not investment advice. Past or simulated performance does not predict future results.</p>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-5 sm:p-6 xl:col-span-5">
          <p className="eyebrow">Choose your flight plan</p>
          <h2 className="mt-2 text-lg font-semibold">Strategy profile</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(Object.keys(strategies) as Array<keyof typeof strategies>).map((item) => (
              <button key={item} onClick={() => setStrategy(item)} className={cn("rounded-xl border px-2 py-3 text-xs font-medium transition", strategy === item ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-300" : "border-white/[0.07] text-zinc-500 hover:text-zinc-200")}>{item}</button>
            ))}
          </div>
          <div className="mt-7 rounded-2xl bg-black/20 p-5">
            <div className="flex items-center justify-between"><span className="text-xs text-zinc-500">Model portfolio</span><span className="text-xs font-medium text-emerald-300">100% allocated</span></div>
            <div className="mt-5 flex h-2.5 overflow-hidden rounded-full">
              <span style={{ width: `${profile.stocks}%` }} className="bg-emerald-300" />
              <span style={{ width: `${profile.bonds}%` }} className="bg-violet-400" />
              <span style={{ width: `${profile.cash}%` }} className="bg-blue-400" />
            </div>
            <div className="mt-5 space-y-3">
              <Allocation label="Global stocks" value={profile.stocks} color="bg-emerald-300" />
              <Allocation label="Investment-grade bonds" value={profile.bonds} color="bg-violet-400" />
              <Allocation label="Cash reserve" value={profile.cash} color="bg-blue-400" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric icon={<Gauge size={15} />} label="Risk profile" value={profile.risk} />
            <Metric icon={<Activity size={15} />} label="Backtest avg." value={profile.return} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-7">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Today&apos;s signals</p><h2 className="mt-2 text-lg font-semibold">Model watchlist</h2></div><span className="flex items-center gap-1.5 text-[11px] text-zinc-600"><span className="size-1.5 animate-pulse rounded-full bg-emerald-300" /> Updated 3m ago</span></div>
          <div className="mt-5 space-y-3">
            {signals.map((signal) => (
              <div key={signal.ticker} className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/[0.05] text-xs font-semibold">{signal.ticker}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{signal.name}</p><p className="text-[11px] text-zinc-600">{signal.price} · {signal.change}</p></div>
                  <Pill tone={signal.action === "BUY" ? "green" : signal.action === "TRIM" ? "amber" : "neutral"}>{signal.action}</Pill>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1"><div className="mb-2 flex justify-between text-[10px] text-zinc-600"><span>MODEL CONFIDENCE</span><span>{signal.confidence}%</span></div><Progress value={signal.confidence} color={signal.action === "TRIM" ? "#fbbf24" : "#6ee7b7"} /></div>
                  <ChevronRight className="text-zinc-700" size={16} />
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-500"><Sparkles className="mr-1.5 inline text-violet-300" size={12} />{signal.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-8">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Historical simulation</p><h2 className="mt-2 text-lg font-semibold">How the model behaved</h2></div><div className="flex gap-3 text-[10px] text-zinc-500"><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-emerald-300" />Robot</span><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-[#343840]" />Benchmark</span></div></div>
          <div className="mt-5"><BacktestChart /></div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-4">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300"><ShieldCheck size={18} /></span>
          <p className="eyebrow mt-6">Guardrails</p>
          <h2 className="mt-2 text-lg font-semibold">Risk controls built in</h2>
          <div className="mt-5 space-y-4">
            {["Maximum 8% single position", "10% minimum cash buffer", "Monthly rebalance cadence", "No leverage or options"].map((item) => <div key={item} className="flex items-center gap-3 text-xs text-zinc-400"><span className="grid size-5 place-items-center rounded-full bg-emerald-300/10 text-[10px] text-emerald-300">✓</span>{item}</div>)}
          </div>
          <p className="mt-7 border-t border-white/[0.06] pt-5 text-[11px] leading-5 text-zinc-600">These are simulated controls for product demonstration. They do not eliminate investment risk.</p>
        </Card>
      </div>
    </>
  );
}

function Allocation({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex items-center text-xs"><span className={cn("mr-2.5 size-2 rounded-full", color)} /><span className="flex-1 text-zinc-500">{label}</span><span className="font-medium">{value}%</span></div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.03] p-3"><span className="text-zinc-600">{icon}</span><p className="mt-3 text-[10px] text-zinc-600">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}
