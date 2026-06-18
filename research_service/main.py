from __future__ import annotations

import json
import math
import statistics
import time
import urllib.request
from dataclasses import dataclass
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Runway Research Service", version="1.0.0")
MODEL_VERSION = "runway-logistic-py-v1"


class BacktestRequest(BaseModel):
    symbol: Literal["SPY", "QQQ", "IWM", "DIA", "VTI"] = "SPY"
    strategy: Literal["Conservative", "Balanced", "Aggressive"] = "Balanced"
    years: int = Field(default=5, ge=3, le=10)


@dataclass
class Row:
    date: str
    close: float
    features: list[float]
    target: int
    next_return: float


def mean(values: list[float]) -> float:
    return sum(values) / max(len(values), 1)


def stdev(values: list[float]) -> float:
    return statistics.pstdev(values) if len(values) > 1 else 0.0


def sigmoid(value: float) -> float:
    return 1 / (1 + math.exp(-max(-30, min(30, value))))


def rsi(closes: list[float], index: int, period: int = 14) -> float:
    gains = losses = 0.0
    for cursor in range(index - period + 1, index + 1):
        change = closes[cursor] - closes[cursor - 1]
        gains += max(change, 0)
        losses += max(-change, 0)
    if losses == 0:
        return 1.0
    relative_strength = gains / losses
    return (100 - 100 / (1 + relative_strength)) / 100


def rows_from_prices(prices: list[dict]) -> list[Row]:
    closes = [price["close"] for price in prices]
    rows: list[Row] = []
    for index in range(60, len(prices) - 1):
        returns = [closes[cursor] / closes[cursor - 1] - 1 for cursor in range(index - 18, index + 1)]
        sma20 = mean(closes[index - 19:index + 1])
        sma50 = mean(closes[index - 49:index + 1])
        next_return = closes[index + 1] / closes[index] - 1
        rows.append(Row(
            date=prices[index]["date"],
            close=closes[index],
            features=[
                closes[index] / closes[index - 5] - 1,
                closes[index] / closes[index - 20] - 1,
                closes[index] / sma20 - 1,
                sma20 / sma50 - 1,
                stdev(returns) * math.sqrt(252),
                rsi(closes, index),
            ],
            target=1 if next_return > 0 else 0,
            next_return=next_return,
        ))
    return rows


def train(rows: list[Row]):
    feature_count = len(rows[0].features)
    averages = [mean([row.features[index] for row in rows]) for index in range(feature_count)]
    deviations = [stdev([row.features[index] for row in rows]) or 1 for index in range(feature_count)]
    normalized = [[(feature - averages[index]) / deviations[index] for index, feature in enumerate(row.features)] for row in rows]
    weights = [0.0] * (feature_count + 1)
    for _ in range(180):
        gradients = [0.0] * (feature_count + 1)
        for row_index, features in enumerate(normalized):
            probability = sigmoid(weights[0] + sum(feature * weights[index + 1] for index, feature in enumerate(features)))
            error = probability - rows[row_index].target
            gradients[0] += error
            for index, feature in enumerate(features):
                gradients[index + 1] += error * feature
        for index in range(len(weights)):
            penalty = 0 if index == 0 else 0.002 * weights[index]
            weights[index] -= 0.08 * (gradients[index] / len(rows) + penalty)

    def predict(features: list[float]) -> float:
        normalized_features = [(feature - averages[index]) / deviations[index] for index, feature in enumerate(features)]
        return sigmoid(weights[0] + sum(feature * weights[index + 1] for index, feature in enumerate(normalized_features)))

    return predict


def fetch_prices(symbol: str, years: int) -> list[dict]:
    period2 = int(time.time())
    period1 = int(period2 - years * 365.25 * 24 * 60 * 60)
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={period1}&period2={period2}&interval=1d&events=history"
    request = urllib.request.Request(url, headers={"User-Agent": "Runway-Wallet-Research/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)
    result = payload["chart"]["result"][0]
    timestamps = result.get("timestamp", [])
    quotes = result.get("indicators", {}).get("adjclose", [{}])[0].get("adjclose") or result["indicators"]["quote"][0]["close"]
    prices = []
    for timestamp, quote in zip(timestamps, quotes):
        if quote and quote > 0:
            prices.append({"date": time.strftime("%Y-%m-%d", time.gmtime(timestamp)), "close": float(quote)})
    return prices


def run_backtest(request: BacktestRequest) -> dict:
    config = {
        "Conservative": {"enter": 0.60, "exit": 0.48, "cost": 0.0008},
        "Balanced": {"enter": 0.55, "exit": 0.45, "cost": 0.0006},
        "Aggressive": {"enter": 0.51, "exit": 0.42, "cost": 0.0005},
    }[request.strategy]
    rows = rows_from_prices(fetch_prices(request.symbol, request.years))
    if len(rows) < 320:
        raise ValueError("At least 18 months of history is required.")
    robot = benchmark = 10000.0
    invested = False
    predictor = train(rows[:252])
    probability = 0.5
    exposure_days = 0
    returns: list[float] = []
    equity = []
    trades = []
    for index in range(252, len(rows)):
        if (index - 252) % 21 == 0:
            predictor = train(rows[max(0, index - 756):index])
        probability = predictor(rows[index].features)
        transaction_cost = 0.0
        if not invested and probability >= config["enter"]:
            invested = True
            transaction_cost = config["cost"]
            trades.append({"date": rows[index].date, "action": "BUY", "price": round(rows[index].close, 2), "probability": round(probability * 100, 1)})
        elif invested and probability <= config["exit"]:
            invested = False
            transaction_cost = config["cost"]
            trades.append({"date": rows[index].date, "action": "SELL", "price": round(rows[index].close, 2), "probability": round(probability * 100, 1)})
        strategy_return = (rows[index].next_return if invested else 0) - transaction_cost
        robot *= 1 + strategy_return
        benchmark *= 1 + rows[index].next_return
        returns.append(strategy_return)
        exposure_days += 1 if invested else 0
        equity.append({"date": rows[index].date, "robot": round(robot, 2), "benchmark": round(benchmark, 2), "probability": round(probability * 100, 1), "invested": invested})
    years = len(equity) / 252
    peak = equity[0]["robot"]
    max_drawdown = 0.0
    for point in equity:
        peak = max(peak, point["robot"])
        max_drawdown = min(max_drawdown, point["robot"] / peak - 1)
    deviation = stdev(returns)
    last = rows[-1]
    labels = ["5-day momentum", "20-day momentum", "short-term trend", "long-term trend", "volatility", "RSI"]
    strongest = sorted(zip(labels, last.features), key=lambda item: abs(item[1]), reverse=True)[:3]
    return {
        "modelVersion": MODEL_VERSION,
        "symbol": request.symbol,
        "startDate": equity[0]["date"],
        "endDate": equity[-1]["date"],
        "dataSource": "Yahoo Finance historical chart data",
        "model": "Runway custom walk-forward logistic classifier (Python)",
        "strategy": request.strategy,
        "signal": "BUY" if invested else "CASH",
        "confidence": round(probability * 100, 1),
        "lastPrice": round(last.close, 2),
        "metrics": {
            "totalReturn": round((robot / 10000 - 1) * 100, 1),
            "benchmarkReturn": round((benchmark / 10000 - 1) * 100, 1),
            "cagr": round(((robot / 10000) ** (1 / years) - 1) * 100, 1),
            "benchmarkCagr": round(((benchmark / 10000) ** (1 / years) - 1) * 100, 1),
            "sharpe": round(mean(returns) / deviation * math.sqrt(252), 2) if deviation else 0,
            "maxDrawdown": round(max_drawdown * 100, 1),
            "trades": len(trades),
            "exposure": round(exposure_days / len(equity) * 100, 1),
        },
        "equity": [point for index, point in enumerate(equity) if index % 5 == 0 or index == len(equity) - 1],
        "trades": list(reversed(trades[-12:])),
        "explanation": [f"{label} is {'positive' if value >= 0 else 'negative'} ({round(value * 100, 1)}%)." for label, value in strongest],
    }


@app.get("/health")
def health():
    return {"status": "ok", "modelVersion": MODEL_VERSION}


@app.post("/backtest")
def backtest(request: BacktestRequest):
    try:
        return run_backtest(request)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
