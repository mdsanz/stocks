# 📈 Stocket

> Track real-time stock prices, get personalized alerts and explore detailed company insights.

Stocket is a full-stack stock market dashboard built with **Next.js 15** (App Router), **MongoDB**, and **TradingView** widgets. It features email/password authentication, AI-powered welcome emails, a daily news digest pipeline, and interactive financial charts.

---

## ✨ Features

- **Real-time market data** — Market overview, stock heatmaps, top stories & market quotes via TradingView embedded widgets.
- **Stock search** — Search stocks by name or symbol using the Finnhub API with debounced queries and keyboard shortcut (`Ctrl/Cmd + K`).
- **Stock details page** — Candle charts, baseline charts, symbol info, technical analysis, company profile & financials per symbol.
- **Watchlist** — Save/remove stocks to a personal watchlist stored in MongoDB.
- **Authentication** — Email & password sign-up/sign-in powered by Better Auth with session cookies and middleware protection.
- **AI-powered welcome email** — On sign-up, Inngest triggers a Gemini AI inference to generate a personalized welcome email based on the user's investment profile.
- **Daily news digest** — A scheduled cron function (via Inngest) fetches relevant news from Finnhub, summarizes it with Gemini AI, and sends a curated HTML email to subscribed users.
- **Dark mode by default** — Sleek dark UI with the Geist font family.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + custom CSS |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) — Button, Command, Dialog, Dropdown, Avatar, Select, Input, Sonner |
| **Authentication** | [Better Auth](https://www.better-auth.com/) with MongoDB adapter & `nextCookies` plugin |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) via native `MongoClient` (auth) + [Mongoose](https://mongoosejs.com/) (watchlist/data) |
| **Financial data** | [Finnhub API](https://finnhub.io/) — stock search, company profiles, market news |
| **Charts** | [TradingView](https://www.tradingview.com/widget/) embedded widgets |
| **Background jobs** | [Inngest](https://www.inngest.com/) — event-driven functions + cron scheduling |
| **AI** | [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) — email content generation |
| **Email** | [Nodemailer](https://nodemailer.com/) with Gmail SMTP |
| **Forms** | [React Hook Form](https://react-hook-form.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | Geist Sans & Geist Mono (via `next/font`) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                           │
│  React 19 · TradingView Widgets · shadcn/ui · Tailwind CSS          │
└──────────────┬─────────────────────────────────────┬────────────────┘
               │  Server Actions / API Routes        │  Embed scripts
               ▼                                     ▼
┌──────────────────────────────────┐    ┌────────────────────────────┐
│        Next.js 15 Server         │    │     TradingView CDN        │
│  ┌────────────┐ ┌──────────────┐ │    │  Market overview, heatmap  │
│  │ Better Auth│ │Server Actions│ │    │  Candle/baseline charts    │
│  │  (Auth API)│ │  (finnhub,   │ │    │  Technical analysis, etc.  │
│  │  /api/auth │ │ watchlist,   │ │    └────────────────────────────┘
│  │            │ │  user)       │ │
│  └─────┬──────┘ └──────┬───────┘ │
│        │               │         │
│  ┌─────▼───────────────▼───────┐ │
│  │      MongoDB Atlas          │ │
│  │  ┌─────────┐ ┌───────────┐  │ │
│  │  │  user   │ │ watchlist │  │ │
│  │  │ session │ │           │  │ │
│  │  │ account │ │           │  │ │
│  │  └─────────┘ └───────────┘  │ │
│  └─────────────────────────────┘ │
└──────────────┬───────────────────┘
               │  Inngest events
               ▼
┌──────────────────────────────────┐
│          Inngest Engine          │
│  ┌────────────────────────────┐  │
│  │  sign-up-email             │  │──▶  Gemini AI ──▶ Nodemailer
│  │  (event: user.created)     │  │
│  ├────────────────────────────┤  │
│  │  daily-news-summary        │  │──▶  Finnhub API ──▶ Gemini AI
│  │  (cron: 0 12 * * *)        │  │                 ──▶ Nodemailer
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Route Groups

| Group | Path | Description |
|---|---|---|
| `(auth)` | `/sign-in`, `/sign-up` | Public auth pages. Redirects to `/` if already authenticated. |
| `(root)` | `/`, `/stocks/[symbol]` | Protected pages. Requires a valid session cookie. |
| `api` | `/api/auth/[...all]`, `/api/inngest` | API routes for auth handler and Inngest webhook. |

### Middleware

The middleware (`middleware.ts`) intercepts every request except static assets, API routes, and auth pages. It checks for a Better Auth session cookie and redirects unauthenticated users to `/sign-in`.

---

## 📦 Project Structure

```
stocks-app/
├── app/
│   ├── (auth)/                  # Auth layout + sign-in/sign-up pages
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (root)/                  # Protected layout + main pages
│   │   ├── layout.tsx           # Session check, Header, container
│   │   ├── page.tsx             # Dashboard (TradingView widgets)
│   │   └── stocks/[symbol]/
│   │       └── page.tsx         # Stock detail page
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth catch-all route
│   │   └── inngest/route.ts     # Inngest webhook endpoint
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout (fonts, toaster)
│   └── favicon.ico
├── components/
│   ├── Header.tsx               # Sticky top nav with logo, nav, user menu
│   ├── NavItems.tsx             # Navigation links
│   ├── SearchCommand.tsx        # Cmd+K stock search dialog
│   ├── TradingViewWidget.tsx    # Reusable TradingView embed component
│   ├── UserDropdown.tsx         # Avatar dropdown with sign-out
│   ├── WatchlistButton.tsx      # Add/remove from watchlist
│   ├── forms/                   # Form field components
│   │   ├── CountrySelectField.tsx
│   │   ├── FooterLink.tsx
│   │   ├── InputField.tsx
│   │   └── SelectField.tsx
│   └── ui/                      # shadcn/ui primitives
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── sonner.tsx
├── database/
│   ├── mongoose.ts              # Mongoose connection with global cache
│   └── models/
│       └── watchlist.model.ts   # Watchlist schema (userId, symbol, company)
├── hooks/
│   ├── useDebounce.ts           # Debounce utility hook
│   └── useTradingViewWidget.tsx # Script injection hook for TradingView
├── lib/
│   ├── actions/
│   │   ├── auth.actions.ts      # signUp, signIn, signOut server actions
│   │   ├── finnhub.actions.ts   # searchStocks, getNews server actions
│   │   ├── user.actions.ts      # getAllUsersForNewsEmail
│   │   └── watchlist.actions.ts # getWatchlistSymbolsByEmail
│   ├── better-auth/
│   │   └── auth.ts              # Better Auth config (MongoDB adapter)
│   ├── constants.ts             # Nav items, TradingView configs, stock symbols
│   ├── inngest/
│   │   ├── client.ts            # Inngest client setup
│   │   ├── functions.ts         # Inngest functions (welcome email, daily news)
│   │   └── prompts.ts           # AI prompt templates
│   ├── nodemailer/
│   │   ├── index.ts             # Email transport + send functions
│   │   └── templates.ts         # HTML email templates
│   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
├── public/
│   └── assets/                  # Static images/icons (logo, dashboard preview, etc.)
├── types/
│   └── global.d.ts              # Global TypeScript type declarations
├── middleware.ts                 # Auth middleware (session cookie check)
├── next.config.ts               # Next.js config
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── components.json              # shadcn/ui configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ── General ──────────────────────────────────────────────
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ── Database ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/stocket?appName=Cluster0

# ── Authentication (Better Auth) ─────────────────────────
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:3000

# ── AI (Gemini) ──────────────────────────────────────────
GEMINI_API_KEY=<your-gemini-api-key>

# ── Background Jobs (Inngest) ────────────────────────────
INNGEST_DEV=1                          # Set to 1 for local Inngest Dev Server

# ── Email (Nodemailer / Gmail) ───────────────────────────
NODEMAILER_EMAIL=<your-gmail@gmail.com>
NODEMAILER_PASSWORD=<gmail-app-password>

# ── Financial Data (Finnhub) ─────────────────────────────
NEXT_PUBLIC_FINNHUB_API_KEY=<your-finnhub-api-key>
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string pointing to the `stocket` database. |
| `BETTER_AUTH_SECRET` | ✅ | Secret key for signing session tokens. Generate with `openssl rand -hex 16`. |
| `BETTER_AUTH_URL` | ✅ | Base URL of the app (used by Better Auth for callbacks). |
| `GEMINI_API_KEY` | ⚠️ Optional | Google Gemini API key. If missing, AI features gracefully fallback to static text. |
| `INNGEST_DEV` | ⚠️ Optional | Set to `1` to use the Inngest Dev Server locally. |
| `NODEMAILER_EMAIL` | ✅ | Gmail address for sending transactional emails. |
| `NODEMAILER_PASSWORD` | ✅ | Gmail [App Password](https://myaccount.google.com/apppasswords) (not your regular password). |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | ✅ | Free API key from [finnhub.io](https://finnhub.io/). |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (included with Node.js)
- A **MongoDB Atlas** cluster (free tier works fine)
- API keys for **Finnhub**, **Gemini** (optional), and a **Gmail App Password**

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/stocks-app.git
cd stocks-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and fill in the values described in the [Environment Variables](#️-environment-variables) section above.

### 4. Start the development server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000) with Turbopack enabled for fast refresh.

### 5. (Optional) Start the Inngest Dev Server

To test background functions (welcome email, daily news digest) locally:

```bash
npx inngest-cli@latest dev
```

The Inngest Dev Server UI will be available at [http://localhost:8288](http://localhost:8288).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🔑 API Keys Setup

### Finnhub

1. Go to [finnhub.io](https://finnhub.io/) and create a free account.
2. Copy your API key from the dashboard.
3. Set it as `NEXT_PUBLIC_FINNHUB_API_KEY` in your `.env`.

### Google Gemini

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Create an API key.
3. Set it as `GEMINI_API_KEY` in your `.env`.
4. *If omitted, the app still works — AI features will use static fallback text.*

### Gmail App Password (Nodemailer)

1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account.
2. Go to [App Passwords](https://myaccount.google.com/apppasswords) and generate one for "Mail".
3. Set the generated password as `NODEMAILER_PASSWORD` and your Gmail as `NODEMAILER_EMAIL`.

---

## 📄 License

This project is private and not licensed for redistribution.
