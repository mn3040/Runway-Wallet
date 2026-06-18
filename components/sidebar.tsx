"use client";

import { Bot, ChartNoAxesCombined, Goal, LayoutDashboard, Settings, WalletCards, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Page = "dashboard" | "goals" | "copilot" | "robot" | "settings";

const nav = [
  { id: "dashboard" as Page, label: "Overview", icon: LayoutDashboard },
  { id: "goals" as Page, label: "Goals", icon: Goal },
  { id: "copilot" as Page, label: "AI Copilot", icon: Bot },
  { id: "robot" as Page, label: "Trading robot", icon: ChartNoAxesCombined },
  { id: "settings" as Page, label: "Settings", icon: Settings },
];

export function Sidebar({ page, setPage, open, close }: { page: Page; setPage: (page: Page) => void; open: boolean; close: () => void }) {
  return (
    <>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={close} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0e12] px-4 py-5 transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="mb-10 flex items-center justify-between px-2">
          <button className="flex items-center gap-2.5" onClick={() => setPage("dashboard")}>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-300 text-zinc-950">
              <WalletCards size={17} strokeWidth={2.3} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Runway Wallet</span>
          </button>
          <button className="text-zinc-500 lg:hidden" onClick={close}><X size={19} /></button>
        </div>

        <p className="eyebrow mb-3 px-3">Workspace</p>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); close(); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  page === item.id ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200",
                )}
              >
                <Icon size={17} />
                {item.label}
                {item.id === "copilot" && <span className="ml-auto size-1.5 rounded-full bg-emerald-300" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            Financial pulse
          </div>
          <p className="text-sm font-medium text-zinc-200">You&apos;re on track</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">June savings rate is 32%, six points above your target.</p>
        </div>

        <div className="mt-5 flex items-center gap-3 px-2">
          <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-emerald-300 text-xs font-semibold text-zinc-950">AM</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-200">Alex Morgan</p>
            <p className="truncate text-xs text-zinc-600">alex@runway.demo</p>
          </div>
        </div>
      </aside>
    </>
  );
}
