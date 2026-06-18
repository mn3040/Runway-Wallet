"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUp, Bot, Calculator, CheckCircle2, ChevronDown, Sparkles, TriangleAlert, User } from "lucide-react";
import { suggestedPrompts } from "@/lib/mock-data";
import { CopilotResult } from "@/lib/financial-tools";
import { Card, PageHeader, Pill } from "@/components/ui";

type Message = { role: "assistant" | "user"; text: string; result?: CopilotResult };

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Good morning. I can calculate scenarios using your saved financial profile, show my assumptions, and explain the tradeoffs. What are you considering?" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<"openai" | "local">("local");

  useEffect(() => {
    fetch("/api/state").then((response) => response.json()).then((data) => {
      const stored = (data.messages || []).slice(-12).map((message: { role: "assistant" | "user"; text: string; metadata?: { result?: CopilotResult } }) => ({
        role: message.role,
        text: message.text,
        result: message.metadata?.result,
      }));
      if (stored.length) setMessages(stored);
    }).catch(() => undefined);
  }, []);

  async function ask(question: string) {
    if (!question.trim() || thinking) return;
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversationId: "primary" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The copilot could not respond.");
      setMode(payload.mode);
      setMessages((current) => [...current, { role: "assistant", text: payload.result.answer, result: payload.result }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "The copilot could not respond." }]);
    } finally {
      setThinking(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      <PageHeader
        eyebrow="Private financial workspace"
        title="Ask. Calculate. Understand."
        description="Run transparent scenarios against your saved profile. Financial arithmetic comes from deterministic tools, not model guesswork."
        action={<Pill tone={mode === "openai" ? "green" : "purple"}><Sparkles className="mr-1.5" size={12} /> {mode === "openai" ? "OpenAI connected" : "Local tool mode"}</Pill>}
      />

      <Card className="flex min-h-[650px] flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-zinc-950"><Bot size={17} /></span>
          <div><p className="text-sm font-medium">Runway Copilot</p><p className="text-[11px] text-zinc-600">Persistent context · Tool-backed calculations · Educational use</p></div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${message.role === "assistant" ? "bg-emerald-300 text-zinc-950" : "bg-violet-400/20 text-violet-300"}`}>
                {message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}
              </span>
              <div className="max-w-3xl">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "rounded-tl-md bg-white/[0.045] text-zinc-300" : "rounded-tr-md bg-violet-400/10 text-zinc-200"}`}>{message.text}</div>
                {message.result && <ResultDetails result={message.result} />}
              </div>
            </div>
          ))}
          {thinking && <div className="ml-11 flex w-16 gap-1 rounded-2xl bg-white/[0.045] p-4">{[0, 1, 2].map((dot) => <span key={dot} className="size-1.5 animate-pulse rounded-full bg-zinc-500" style={{ animationDelay: `${dot * 120}ms` }} />)}</div>}
        </div>

        <div className="border-t border-white/[0.06] p-4 sm:p-5">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-500 transition hover:border-emerald-300/30 hover:text-zinc-200">{prompt}</button>)}
          </div>
          <form onSubmit={submit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-2 pl-4 focus-within:border-emerald-300/35">
            <input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-700" placeholder="Ask a financial question or compare a scenario..." />
            <button disabled={!input.trim() || thinking} className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-zinc-950 transition disabled:opacity-30"><ArrowUp size={17} /></button>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-700">Runway shows assumptions and calculations, but does not provide individualized financial, legal, tax, or investment advice.</p>
        </div>
      </Card>
    </div>
  );
}

function ResultDetails({ result }: { result: CopilotResult }) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {result.calculations.length > 0 && <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600"><Calculator size={12} /> Calculations</p>
        <div className="mt-3 space-y-2">{result.calculations.map((item) => <div key={item.label} className="flex justify-between gap-4 text-xs"><span className="text-zinc-500">{item.label}</span><span className="font-medium text-zinc-200">{item.value}</span></div>)}</div>
      </div>}
      <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600"><CheckCircle2 size={12} /> Confidence</p>
        <p className="mt-3 text-sm capitalize text-emerald-300">{result.confidence}</p>
        <p className="mt-1 text-[11px] text-zinc-600">{result.assumptions.length} stated assumptions</p>
      </div>
      {result.options.map((option) => <div key={option.title} className="rounded-2xl border border-white/[0.06] p-4"><p className="text-xs font-medium">{option.title}</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">{option.description}</p><p className="mt-2 text-[10px] text-violet-300">{option.impact}</p></div>)}
      {(result.assumptions.length > 0 || result.warnings.length > 0) && <details className="sm:col-span-2 rounded-2xl border border-white/[0.06] p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-zinc-500"><TriangleAlert size={13} /> Assumptions and cautions <ChevronDown className="ml-auto" size={13} /></summary>
        <div className="mt-3 space-y-2 text-[11px] leading-5 text-zinc-600">{[...result.assumptions, ...result.warnings].map((item) => <p key={item}>• {item}</p>)}</div>
      </details>}
    </div>
  );
}
