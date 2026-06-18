"use client";

import { useState } from "react";
import { Building2, Check, Plus, UserRound } from "lucide-react";
import { Card, PageHeader, Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Settings() {
  const [risk, setRisk] = useState("Balanced");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <PageHeader eyebrow="Personalize Runway" title="Settings" description="Shape the demo around your financial picture and comfort with risk." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><UserRound size={17} /></span><div><h2 className="text-sm font-medium">Personal profile</h2><p className="text-[11px] text-zinc-600">Used to personalize your workspace</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="First name" defaultValue="Alex" />
            <Field label="Last name" defaultValue="Morgan" />
            <Field label="Email" defaultValue="alex@runway.demo" type="email" />
            <Field label="Location" defaultValue="New York, NY" />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="eyebrow">Risk tolerance</p>
          <h2 className="mt-2 text-lg font-semibold">How do you handle turbulence?</h2>
          <div className="mt-5 space-y-2">
            {["Conservative", "Balanced", "Aggressive"].map((item) => <button key={item} onClick={() => setRisk(item)} className={cn("flex w-full items-center rounded-xl border p-3 text-sm transition", risk === item ? "border-emerald-300/35 bg-emerald-300/[0.07] text-emerald-300" : "border-white/[0.06] text-zinc-500")}><span className={cn("mr-3 grid size-5 place-items-center rounded-full border", risk === item ? "border-emerald-300 bg-emerald-300 text-zinc-950" : "border-zinc-700")}>{risk === item && <Check size={12} />}</span>{item}</button>)}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="mb-6"><p className="eyebrow">Monthly baseline</p><h2 className="mt-2 text-lg font-semibold">Income and expenses</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Monthly take-home income" defaultValue="7500" type="number" prefix="$" />
            <Field label="Average monthly expenses" defaultValue="4250" type="number" prefix="$" />
          </div>
          <div className="mt-6 rounded-xl bg-emerald-300/[0.04] p-4 text-xs leading-5 text-zinc-500">Estimated monthly runway contribution: <strong className="font-medium text-emerald-300">$3,250</strong>. This is a simple demo calculation and excludes taxes, irregular costs, and account activity.</div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Connections</p><h2 className="mt-2 text-lg font-semibold">Linked accounts</h2></div><Pill tone="neutral">Demo</Pill></div>
          <div className="mt-5 space-y-2">
            {["Chase", "Marcus", "Fidelity"].map((bank) => <div key={bank} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3"><span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-zinc-500"><Building2 size={15} /></span><span className="flex-1 text-xs">{bank}</span><span className="size-1.5 rounded-full bg-emerald-300" /></div>)}
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs text-zinc-600 transition hover:text-zinc-300"><Plus size={14} /> Add account placeholder</button>
        </Card>
      </div>
      <div className="mt-5 flex justify-end">
        <button onClick={save} className="min-w-32 rounded-xl bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-zinc-950">{saved ? "Saved ✓" : "Save changes"}</button>
      </div>
    </>
  );
}

function Field({ label, defaultValue, type = "text", prefix }: { label: string; defaultValue: string; type?: string; prefix?: string }) {
  return <label className="block text-xs text-zinc-500">{label}<div className="relative mt-2">{prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-600">{prefix}</span>}<input type={type} defaultValue={defaultValue} className={cn("input", prefix && "pl-7")} /></div></label>;
}
