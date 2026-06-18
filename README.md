# soroban-split-dashboard

#  SorobanSplit Dashboard (`soroban-split-dashboard`)

The modern web application client for **SorobanSplit**, built using **Next.js, TypeScript, and Tailwind CSS**. 

This interface allows open-source maintainers and developer organizations on Stellar to easily interact with their deployed `SorobanSplit` contracts. Users can visually map out contributor address percentages, view historical tracking metrics, monitor real-time wallet balances, and sign configuration envelopes directly through browser extensions.

---

##  Key Features

- **Stellar Wallet Connection:** Seamless integration with the Freighter Wallet and other Stellar network extensions.
- **Visual Matrix Builder:** Form arrays allowing repository owners to balance basis points ($10,000 = 100\%$) across multiple team members interactively.
- **Live Token Feeds:** Instantly reads remaining token balances (USDC/XLM) using Soroban RPC node queries.

---

##  Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Stellar Client Integration:** `@stellar/stellar-sdk` / Soroban RPC client hooks

---

##  Getting Started

### 1. Install Dependencies
```bash
npm install
# or
yarn install
