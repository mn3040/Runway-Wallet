"use client";

import { FormEvent, useState } from "react";
import { ArrowUp, Bot, Sparkles, User } from "lucide-react";
import { aiAnswers, suggestedPrompts } from "@/lib/mock-data";
import { Card, PageHeader, Pill } from "@/components/ui";

type Message = { role: "assistant" | "user"; text: string };

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Good morning, Alex. I can help you explore tradeoffs across your spending, goals, debt, and investments. What’s on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function ask(question: string) {
    if (!question.trim() || thinking) return;
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const response = aiAnswers[question] ?? "Looking at your mock financial picture, you have a healthy monthly surplus and solid momentum. I’d protect your emergency buffer first, then compare the after-tax benefit of each option before moving money. This is educational guidance, not financial advice.";
      setMessages((current) => [...current, { role: "assistant", text: response }]);
      setThinking(false);
    }, 650);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      <PageHeader
        eyebrow="Private financial workspace"
        title="Ask about your money."
        description="Explore scenarios using your demo financial picture. Responses are mocked and provided for education only."
        action={<Pill tone="green"><Sparkles className="mr-1.5" size={12} /> Context aware</Pill>}
      />

      <Card className="flex min-h-[620px] flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-zinc-950"><Bot size={17} /></span>
          <div><p className="text-sm font-medium">Runway Copilot</p><p className="text-[11px] text-zinc-600">Demo mode · No financial advice</p></div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${message.role === "assistant" ? "bg-emerald-300 text-zinc-950" : "bg-violet-400/20 text-violet-300"}`}>
                {message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}
              </span>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "rounded-tl-md bg-white/[0.045] text-zinc-300" : "rounded-tr-md bg-violet-400/10 text-zinc-200"}`}>
                {message.text}
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
            <input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-700" placeholder="Ask a financial question..." />
            <button disabled={!input.trim() || thinking} className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-zinc-950 transition disabled:opacity-30"><ArrowUp size={17} /></button>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-700">Mock responses can be inaccurate. Consider a qualified professional for personal financial decisions.</p>
        </div>
      </Card>
    </div>
  );
}
