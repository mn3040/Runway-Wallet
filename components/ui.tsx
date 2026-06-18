import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "purple" | "amber" }) {
  const tones = {
    neutral: "bg-white/5 text-zinc-400",
    green: "bg-emerald-400/10 text-emerald-300",
    purple: "bg-violet-400/10 text-violet-300",
    amber: "bg-amber-400/10 text-amber-300",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", tones[tone])}>{children}</span>;
}

export function Progress({ value, color = "#6ee7b7" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
