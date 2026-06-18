# Runway Wallet

Runway Wallet is a polished MVP for an AI-powered financial command center. It combines a personal-finance dashboard, goal tracking, a mock AI copilot, and an educational paper-trading robot in one dark-mode-first interface.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the custom Python model service:

```bash
python -m pip install -r research_service/requirements.txt
npm run research:dev
```

Copy `.env.example` to `.env.local`. The app works without optional services using durable local storage and the TypeScript research fallback. Add `OPENAI_API_KEY` for the real tool-using copilot, `DATABASE_URL` for PostgreSQL, and `RESEARCH_SERVICE_URL` for the Python model service.

## Included

- Financial dashboard with net worth, cash flow, accounts, spending, and allocation views
- Editable goal tracker with add and delete flows
- AI financial copilot with suggested prompts and mock responses
- Real-data market research lab with a walk-forward machine-learning backtest
- Versioned Python research service with a TypeScript continuity fallback
- Persistent profile, goals, copilot conversations, experiments, and paper orders
- OpenAI tool-calling copilot with deterministic local fallback
- Profile, risk tolerance, cash flow, and connected-account settings
- Responsive desktop and mobile layouts

## Mocked for the MVP

Balances, accounts, recommendations, and AI responses are local mock data. The research lab fetches historical adjusted ETF prices server-side and trains a small logistic-classification model on momentum, trend, volatility, and RSI features.

The backtest retrains through time using only earlier observations, compares results with buy-and-hold, estimates transaction costs, and reports drawdown, exposure, and a trade ledger. It is still research software: there is no brokerage integration or order execution.

The trading robot is strictly an educational research and paper-trading simulation. It does not place real trades, predict future returns reliably, or provide investment advice. “Paper trade” actions write only to Runway Wallet’s internal simulation ledger.
