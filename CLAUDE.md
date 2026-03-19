# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

This is a mobile-first PWA built with React 19 + Vite for calculating procedure payouts. The entire application logic lives in a single file: `src/App.jsx`.

### State & Persistence
- All state is managed in `App.jsx` via `useState`/`useEffect`
- Persisted to `localStorage` under key `@procedures_data`
- No external state management library

### Data Model
Each procedure record:
```js
{ id, name, price, tax, payment, date }
// id: timestamp string
// tax: percentage (e.g. 20 for 20%)
// payment: "40" or "50" (percentage)
// date: "YYYY-MM-DD"
```

### Calculation Logic
```js
afterTax = price - (price * (tax / 100))
payout = afterTax * (payment / 100)
// Minimum daily payout floor: 1500₽
```

### Tab Structure
`App.jsx` contains three inline "route" components rendered based on `activeTab`:
- **Tab 0 (DayRoute)** — view procedures for a selected date, totals, delete items
- **Tab 1 (MonthRoute)** — monthly aggregate view with per-day breakdown
- **Tab 2 (InputRoute)** — form to add a new procedure (name + price required, tax defaults 0%, payment 40% or 50%)

### UI Stack
- MUI v7 (`@mui/material`, `@mui/icons-material`) with dark theme
- Emotion for styling (MUI's engine)
- iOS-specific meta tags and PWA manifest via `vite-plugin-pwa`
- `index.css` handles global mobile/iOS overrides
