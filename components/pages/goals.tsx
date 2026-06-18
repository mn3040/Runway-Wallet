"use client";

import { useState } from "react";
import { Calendar, Plus, Target, Trash2, X } from "lucide-react";
import { Goal, initialGoals } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Card, PageHeader, Progress } from "@/components/ui";

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [adding, setAdding] = useState(false);

  function addGoal(formData: FormData) {
    const target = Number(formData.get("target")) || 10000;
    setGoals((current) => [...current, {
      id: Date.now(),
      title: String(formData.get("title") || "New goal"),
      category: String(formData.get("category") || "Custom goal"),
      current: Number(formData.get("current")) || 0,
      target,
      targetDate: String(formData.get("date") || "No date"),
      color: "#6ee7b7",
    }]);
    setAdding(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Your plan"
        title="Goals that feel possible."
        description="Turn the big things into visible, measurable progress. Your balances below use demo data."
        action={<button onClick={() => setAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200"><Plus size={16} /> Add goal</button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active goals" value={String(goals.length)} />
        <Stat label="Total saved" value={formatCurrency(goals.reduce((sum, goal) => sum + goal.current, 0), true)} />
        <Stat label="Monthly pace" value="$3.2k" />
        <Stat label="On track" value={`${Math.max(goals.length - 1, 0)}/${goals.length}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100);
          return (
            <Card key={goal.id} className="group p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: `${goal.color}16`, color: goal.color }}><Target size={18} /></span>
                <button onClick={() => setGoals((current) => current.filter((item) => item.id !== goal.id))} className="text-zinc-700 opacity-0 transition hover:text-rose-400 group-hover:opacity-100" aria-label={`Delete ${goal.title}`}><Trash2 size={16} /></button>
              </div>
              <p className="eyebrow mt-6">{goal.category}</p>
              <h2 className="mt-2 text-lg font-semibold">{goal.title}</h2>
              <div className="mt-6 flex items-end justify-between">
                <div><p className="text-2xl font-semibold tracking-[-0.04em]">{formatCurrency(goal.current)}</p><p className="mt-1 text-xs text-zinc-600">of {formatCurrency(goal.target)}</p></div>
                <p className="text-sm font-semibold" style={{ color: goal.color }}>{progress}%</p>
              </div>
              <div className="mt-4"><Progress value={progress} color={goal.color} /></div>
              <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-500"><Calendar size={13} /> Target: {goal.targetDate}</div>
            </Card>
          );
        })}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">New destination</p><h2 className="mt-2 text-xl font-semibold">Add a financial goal</h2></div><button onClick={() => setAdding(false)} className="text-zinc-500"><X size={19} /></button></div>
            <form action={addGoal} className="space-y-4">
              <label className="block text-xs text-zinc-500">Goal name<input name="title" required placeholder="e.g. Trip to Japan" className="input mt-2" /></label>
              <label className="block text-xs text-zinc-500">Category<select name="category" className="input mt-2"><option>Emergency fund</option><option>Debt payoff</option><option>Down payment</option><option>Retirement</option><option>Custom goal</option></select></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-zinc-500">Already saved<input name="current" type="number" placeholder="0" className="input mt-2" /></label>
                <label className="block text-xs text-zinc-500">Target amount<input name="target" type="number" required placeholder="10000" className="input mt-2" /></label>
              </div>
              <label className="block text-xs text-zinc-500">Target date<input name="date" placeholder="December 2027" className="input mt-2" /></label>
              <button className="mt-2 w-full rounded-xl bg-emerald-300 py-3 text-sm font-semibold text-zinc-950">Create goal</button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="p-4"><p className="text-[11px] text-zinc-600">{label}</p><p className="mt-1.5 text-xl font-semibold tracking-[-0.03em]">{value}</p></Card>;
}
