"use client";

import { ArrowRight, ArrowUpRight, Landmark, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { accounts, allocation, spending } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { DonutChart, NetWorthChart } from "@/components/charts";
import { Card, Pill, Progress, PageHeader } from "@/components/ui";
import { Page } from "@/components/sidebar";

export function Dashboard({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Thursday, June 18"
        title="Good morning, Alex."
        description="Your financial runway is getting longer. Here’s what changed and where to focus next."
        action={<Pill tone="green"><span className="mr-1.5 size-1.5 rounded-full bg-emerald-300" />All systems healthy</Pill>}
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="relative overflow-hidden p-5 sm:p-6 xl:col-span-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Total net worth</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">$128,420</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300"><TrendingUp size={13} /> +$15,920 this year</p>
            </div>
            <Pill tone="green">+14.2% YTD</Pill>
          </div>
          <div className="mt-3 -mb-4 -ml-2"><NetWorthChart /></div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6 xl:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Monthly cash flow</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">+$3,250</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Wallet size={18} /></span>
          </div>
          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-zinc-500">Income</span><span>$7,500</span></div>
              <Progress value={100} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-zinc-500">Spending</span><span>$4,250</span></div>
              <Progress value={57} color="#a78bfa" />
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
            <div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[11px] text-zinc-500">Savings rate</p><p className="mt-1 text-lg font-semibold">43.3%</p></div>
            <div className="rounded-xl bg-white/[0.035] p-3"><p className="text-[11px] text-zinc-500">vs. last month</p><p className="mt-1 text-lg font-semibold text-emerald-300">+$420</p></div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="eyebrow">Connected accounts</p><h2 className="mt-2 text-lg font-semibold">Everything in one place</h2></div>
            <button onClick={() => navigate("settings")} className="text-xs text-zinc-500 transition hover:text-white">Manage <ArrowRight className="ml-1 inline" size={13} /></button>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {accounts.map((account) => (
              <div key={account.name} className="flex items-center gap-3 py-3.5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-zinc-400"><Landmark size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">{account.name}</p>
                  <p className="text-[11px] text-zinc-600">{account.institution} · {account.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                  <p className={account.change >= 0 ? "text-[11px] text-emerald-400" : "text-[11px] text-rose-400"}>{account.change >= 0 ? "+" : ""}{account.change}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-emerald-300/15 bg-emerald-300/[0.045] p-5 sm:p-6 xl:col-span-4">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-300 text-zinc-950"><Sparkles size={18} /></span>
          <p className="eyebrow mt-7 text-emerald-300/70">Next best move</p>
          <h2 className="mt-3 text-xl font-semibold leading-7 tracking-[-0.03em]">Move $750 to your card balance this week.</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">You&apos;ll still maintain a 4.6-month cash buffer and could avoid about $92 in interest.</p>
          <button onClick={() => navigate("copilot")} className="mt-7 flex items-center gap-2 text-sm font-medium text-emerald-300">Ask the copilot <ArrowUpRight size={15} /></button>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-6">
          <div><p className="eyebrow">Spending</p><h2 className="mt-2 text-lg font-semibold">Where your money went</h2></div>
          <div className="mt-2 grid items-center sm:grid-cols-2">
            <div className="relative"><DonutChart type="spending" /><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><p className="text-xl font-semibold">$4,250</p><p className="text-[10px] text-zinc-600">THIS MONTH</p></div></div></div>
            <div className="space-y-3">
              {spending.map((item) => <LegendRow key={item.name} name={item.name} value={formatCurrency(item.value)} color={item.color} />)}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-6">
          <div><p className="eyebrow">Investment allocation</p><h2 className="mt-2 text-lg font-semibold">Built for steady growth</h2></div>
          <div className="mt-2 grid items-center sm:grid-cols-2">
            <div className="relative"><DonutChart type="allocation" /><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><p className="text-xl font-semibold">$92.2k</p><p className="text-[10px] text-zinc-600">INVESTED</p></div></div></div>
            <div className="space-y-3">
              {allocation.map((item) => <LegendRow key={item.name} name={item.name} value={`${item.value}%`} color={item.color} />)}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function LegendRow({ name, value, color }: { name: string; value: string; color: string }) {
  return <div className="flex items-center text-xs"><span className="mr-2.5 size-2 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1 text-zinc-500">{name}</span><span className="font-medium text-zinc-300">{value}</span></div>;
}
