"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Sidebar, Page } from "@/components/sidebar";
import { Dashboard } from "@/components/pages/dashboard";
import { Goals } from "@/components/pages/goals";
import { Copilot } from "@/components/pages/copilot";
import { Robot } from "@/components/pages/robot";
import { Settings } from "@/components/pages/settings";

export function RunwayApp() {
  const [page, setPage] = useState<Page>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar page={page} setPage={setPage} open={menuOpen} close={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-white/[0.05] bg-[#090b0f]/85 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <button onClick={() => setMenuOpen(true)} className="mr-3 text-zinc-500 lg:hidden"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs text-zinc-600 sm:flex"><Search size={14} /><span>Search your finances</span><kbd className="ml-2 rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[9px]">⌘ K</kbd></div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[11px] text-zinc-600 sm:block">Demo data · Updated just now</span>
            <button className="relative grid size-9 place-items-center rounded-xl border border-white/[0.07] text-zinc-500 transition hover:text-white"><Bell size={16} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-300" /></button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 pb-12 sm:p-7 lg:p-10">
          {page === "dashboard" && <Dashboard navigate={setPage} />}
          {page === "goals" && <Goals />}
          {page === "copilot" && <Copilot />}
          {page === "robot" && <Robot />}
          {page === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
