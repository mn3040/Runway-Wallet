import { NextRequest, NextResponse } from "next/server";
import { appendMessage, getAppData } from "@/lib/repository";
import { CopilotResult, deterministicCopilot, financialToolDefinitions, runFinancialTool } from "@/lib/financial-tools";

export const dynamic = "force-dynamic";

const responseSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    calculations: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, description: { type: "string" }, impact: { type: "string" } },
        required: ["title", "description", "impact"],
        additionalProperties: false,
      },
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    warnings: { type: "array", items: { type: "string" } },
    suggestedActions: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, action: { type: "string" } },
        required: ["label", "action"],
        additionalProperties: false,
      },
    },
  },
  required: ["answer", "assumptions", "calculations", "options", "confidence", "warnings", "suggestedActions"],
  additionalProperties: false,
};

async function callOpenAI(question: string): Promise<CopilotResult> {
  const data = await getAppData();
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const initialInput = [{
    role: "user",
    content: question,
  }];
  const base = {
    model,
    instructions: `You are Runway Copilot, an educational financial planning assistant.
Use tools for every financial fact or calculation. Never invent balances, returns, tax rules, or trading recommendations.
State assumptions and uncertainty. Do not claim to be a fiduciary or provide individualized investment, legal, or tax advice.
The trading model is a separate research system; you may explain stored results but may not create or alter signals.`,
    tools: financialToolDefinitions,
    text: { format: { type: "json_schema", name: "runway_copilot_result", strict: true, schema: responseSchema } },
  };

  let response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...base, input: initialInput }),
  }).then(async (result) => {
    if (!result.ok) throw new Error(`OpenAI returned ${result.status}.`);
    return result.json();
  });

  const toolOutputs = [];
  for (const item of response.output || []) {
    if (item.type === "function_call") {
      const args = JSON.parse(item.arguments || "{}");
      toolOutputs.push({
        type: "function_call_output",
        call_id: item.call_id,
        output: JSON.stringify(runFinancialTool(item.name, args, data)),
      });
    }
  }

  if (toolOutputs.length) {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...base, previous_response_id: response.id, input: toolOutputs }),
    }).then(async (result) => {
      if (!result.ok) throw new Error(`OpenAI returned ${result.status}.`);
      return result.json();
    });
  }

  return JSON.parse(response.output_text);
}

export async function POST(request: NextRequest) {
  const { question, conversationId = "default" } = await request.json();
  if (typeof question !== "string" || !question.trim()) return NextResponse.json({ error: "Question is required." }, { status: 400 });
  const data = await getAppData();
  await appendMessage({ id: crypto.randomUUID(), conversationId, role: "user", text: question, createdAt: new Date().toISOString() });
  let result: CopilotResult;
  let mode: "openai" | "local";
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI key is not configured.");
    result = await callOpenAI(question);
    mode = "openai";
  } catch {
    result = deterministicCopilot(question, data);
    mode = "local";
  }
  await appendMessage({
    id: crypto.randomUUID(),
    conversationId,
    role: "assistant",
    text: result.answer,
    createdAt: new Date().toISOString(),
    metadata: { result, mode },
  });
  return NextResponse.json({ result, mode });
}
