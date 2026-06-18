"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, Check, Database, Plus, UserRound } from "lucide-react";
import { Card, PageHeader, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";
import { FinancialProfile } from "@/lib/domain";
import { seedData } from "@/lib/seed-data";

export function Settings() {
  const [profile, setProfile] = useState<FinancialProfile>(seedData.profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/state").then((response) => response.json()).then((data) => {
      if (data.profile) setProfile(data.profile);
    }).catch(() => undefined);
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  const surplus = profile.monthlyIncome - profile.monthlyExpenses;
  const runway = profile.monthlyExpenses > 0 ? profile.liquidSavings / profile.monthlyExpenses : 0;

  return (
    <form onSubmit={save}>
      <PageHeader eyebrow="Personalize Runway" title="Your financial model" description="These saved values now power the copilot's deterministic tools and scenario calculations." action={<Pill tone="green"><Database className="mr-1.5" size={12} /> Persistent profile</Pill>} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><UserRound size={17} /></span><div><h2 className="text-sm font-medium">Personal profile</h2><p className="text-[11px] text-zinc-600">Stored locally or in PostgreSQL when configured</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="First name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })} />
            <Field label="Last name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })} />
            <Field label="Email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} type="email" />
            <Field label="Location" value={profile.location} onChange={(value) => setProfile({ ...profile, location: value })} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="eyebrow">Risk tolerance</p>
          <h2 className="mt-2 text-lg font-semibold">How do you handle turbulence?</h2>
          <div className="mt-5 space-y-2">
            {(["Conservative", "Balanced", "Aggressive"] as const).map((item) => <button type="button" key={item} onClick={() => setProfile({ ...profile, riskTolerance: item })} className={cn("flex w-full items-center rounded-xl border p-3 text-sm transition", profile.riskTolerance === item ? "border-emerald-300/35 bg-emerald-300/[0.07] text-emerald-300" : "border-white/[0.06] text-zinc-500")}><span className={cn("mr-3 grid size-5 place-items-center rounded-full border", profile.riskTolerance === item ? "border-emerald-300 bg-emerald-300 text-zinc-950" : "border-zinc-700")}>{profile.riskTolerance === item && <Check size={12} />}</span>{item}</button>)}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="mb-6"><p className="eyebrow">Financial baseline</p><h2 className="mt-2 text-lg font-semibold">Values used by the copilot</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField label="Monthly take-home income" value={profile.monthlyIncome} onChange={(value) => setProfile({ ...profile, monthlyIncome: value })} />
            <NumberField label="Average monthly expenses" value={profile.monthlyExpenses} onChange={(value) => setProfile({ ...profile, monthlyExpenses: value })} />
            <NumberField label="Liquid savings" value={profile.liquidSavings} onChange={(value) => setProfile({ ...profile, liquidSavings: value })} />
            <NumberField label="Investment balance" value={profile.investmentBalance} onChange={(value) => setProfile({ ...profile, investmentBalance: value })} />
            <NumberField label="High-interest debt" value={profile.highInterestDebt} onChange={(value) => setProfile({ ...profile, highInterestDebt: value })} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-300/[0.04] p-4 text-xs text-zinc-500">Monthly surplus <strong className="ml-1 font-medium text-emerald-300">${surplus.toLocaleString()}</strong></div>
            <div className="rounded-xl bg-violet-300/[0.04] p-4 text-xs text-zinc-500">Financial runway <strong className="ml-1 font-medium text-violet-300">{runway.toFixed(1)} months</strong></div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Connections</p><h2 className="mt-2 text-lg font-semibold">Linked accounts</h2></div><Pill tone="neutral">Demo</Pill></div>
          <div className="mt-5 space-y-2">
            {["Chase", "Marcus", "Fidelity"].map((bank) => <div key={bank} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3"><span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-zinc-500"><Building2 size={15} /></span><span className="flex-1 text-xs">{bank}</span><span className="size-1.5 rounded-full bg-emerald-300" /></div>)}
          </div>
          <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs text-zinc-600 transition hover:text-zinc-300"><Plus size={14} /> Add account placeholder</button>
        </Card>
      </div>
      <div className="mt-5 flex justify-end"><button className="min-w-32 rounded-xl bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-zinc-950">{saved ? "Saved ✓" : "Save changes"}</button></div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-xs text-zinc-500">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="input mt-2" /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block text-xs text-zinc-500">{label}<div className="relative mt-2"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-600">$</span><input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="input pl-7" /></div></label>;
}
