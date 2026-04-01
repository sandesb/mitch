# Dashboard Documentation

## Project Type
- Vite + React single-page dashboard app (frontend only).
- Migrated from a single `index.html` demo into componentized React files.

## Tech Stack
- React 18 (`react`, `react-dom`)
- Vite 5 (`vite`, `@vitejs/plugin-react`)
- CSS3 (modular app/page styles in `src/App.css` and `src/pages/Dashboard.css`)
- Chart.js (`chart.js/auto`) for all data visualizations
- Lucide React (`lucide-react`) for sidebar/menu icons

## Key Files
- `index.html` - Vite root HTML with `#root`
- `src/main.jsx` - React entry point
- `src/App.jsx` - app shell, collapsible sidebar, page switching
- `src/App.css` - shell/sidebar/responsive nav styles
- `src/pages/Dashboard.jsx` - dashboard UI + charts + live date/time logic
- `src/pages/Dashboard.css` - dashboard layout and responsive styling
- `src/pages/PlaceholderPage.jsx` - dummy pages for non-dashboard routes
- `vite.config.js` - Vite config with React plugin

## Libraries Used
- **Chart.js**
  - Imported in React as `import Chart from "chart.js/auto"`
  - Used for:
    - Cost stacked bar chart
    - Cost semi-arc gauge (doughnut with 180-degree arc)
    - Hourly energy doughnut chart
    - Hourly multi-series line chart
  - Includes custom plugin for in-slice pie percentages: `piePercentLabelsPlugin`
- **Lucide React**
  - Sidebar icons: `Home`, `LayoutDashboard`, `MessageSquare`, `CreditCard`, `Settings`
  - Hamburger/toggle icon: `Menu`

## App Structure and Navigation
- Sidebar + content shell in `App.jsx`.
- Sidebar is collapsible (desktop + mobile behavior).
- Sidebar items:
  - Home
  - Dashboard
  - Message (with badge)
  - Payments
  - Settings
- Simple state-based page switching (no `react-router`).

## Dashboard Sections (Current)
- Top bar with:
  - Title
  - LIVE badge
  - Real-time date/time (updates every second)
  - User badge
- KPI cards row:
  - Weekly Cost
  - Usage
  - Electricity Rate
  - Gas Rate
- Cost panel (wide):
  - Date range dropdown (3 ranges)
  - Weekly/Monthly toggle
  - Semi-arc cost gauge
  - Stacked bar chart (pounds/day)
  - Right-side focus/day label card
- Energy Consumption panel (wide):
  - Left doughnut chart with percentages on slices
  - Middle hourly multi-line chart with point markers
  - Right summary label card
- Bottom row:
  - Current Tariff panel (details + 2 compact rate cards with mini spark lines)
  - Recommendation panel (horizontal swipe/scroll cards, 3 items)

## Data and State
- Static demo datasets in `Dashboard.jsx`:
  - `days`, `hours`
  - `heatingData`, `fridgeData`, `dishData`, `ovenData`
  - `COST_DATA` keyed by date range
  - `RECOMMENDATIONS` array for supplier cards
- React state:
  - selected cost date range
  - weekly/monthly view mode
  - live time/date (`setInterval`)

## Responsiveness
- Multi-breakpoint responsive behavior in `App.css` and `Dashboard.css`.
- Sidebar collapses to compact icon rail on smaller screens.
- Dashboard grids collapse from multi-column to single-column on mobile.
- Chart-heavy sections allow horizontal scroll where needed to preserve readability.

## Notes
- Frontend demo only (no backend/API integration).
- Charts are created in `useEffect` and destroyed on cleanup to prevent memory leaks.
- Typography uses Inter via Google Fonts import in app styles.
