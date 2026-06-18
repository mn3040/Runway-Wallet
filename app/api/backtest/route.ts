import { NextRequest, NextResponse } from "next/server";
import { PriceBar, runBacktest, StrategyName } from "@/lib/trading-engine";
import { saveExperiment } from "@/lib/repository";

export const dynamic = "force-dynamic";

const allowedSymbols = new Set(["SPY", "QQQ", "IWM", "DIA", "VTI"]);
const allowedStrategies = new Set<StrategyName>(["Conservative", "Balanced", "Aggressive"]);

export async function GET(request: NextRequest) {
  try {
    const symbol = (request.nextUrl.searchParams.get("symbol") || "SPY").toUpperCase();
    const strategyParam = request.nextUrl.searchParams.get("strategy") || "Balanced";
    const years = Math.min(10, Math.max(3, Number(request.nextUrl.searchParams.get("years")) || 5));
    if (!allowedSymbols.has(symbol)) return NextResponse.json({ error: "Unsupported symbol." }, { status: 400 });
    if (!allowedStrategies.has(strategyParam as StrategyName)) return NextResponse.json({ error: "Unsupported strategy." }, { status: 400 });

    const researchUrl = process.env.RESEARCH_SERVICE_URL;
    if (researchUrl) {
      try {
        const serviceResponse = await fetch(`${researchUrl}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, strategy: strategyParam, years }),
          signal: AbortSignal.timeout(90_000),
        });
        if (serviceResponse.ok) {
          const serviceResult = await serviceResponse.json();
          const experimentId = crypto.randomUUID();
          await saveExperiment({
            id: experimentId,
            modelVersion: serviceResult.modelVersion,
            symbol,
            strategy: strategyParam,
            years,
            status: "completed",
            metrics: serviceResult.metrics,
            createdAt: new Date().toISOString(),
          });
          return NextResponse.json({ ...serviceResult, experimentId });
        }
      } catch {
        // Keep the app operational when the optional research service is offline.
      }
    }

    const period2 = Math.floor(Date.now() / 1000);
    const period1 = Math.floor(new Date(Date.now() - years * 365.25 * 24 * 60 * 60 * 1000).getTime() / 1000);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Runway-Wallet-Research/0.1" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Market data provider returned ${response.status}.`);
    const payload = await response.json();
    const result = payload.chart?.result?.[0];
    if (!result) throw new Error(payload.chart?.error?.description || "No market history was returned.");
    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.adjclose?.[0]?.adjclose || result.indicators?.quote?.[0]?.close || [];
    const prices: PriceBar[] = timestamps
      .map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        close: Number(quote[index]),
      }))
      .filter((bar) => Number.isFinite(bar.close) && bar.close > 0);

    const backtest = runBacktest(prices, symbol, strategyParam as StrategyName);
    const experimentId = crypto.randomUUID();
    await saveExperiment({
      id: experimentId,
      modelVersion: backtest.modelVersion,
      symbol,
      strategy: strategyParam,
      years,
      status: "completed",
      metrics: backtest.metrics,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ...backtest, experimentId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run the backtest." },
      { status: 500 },
    );
  }
}
