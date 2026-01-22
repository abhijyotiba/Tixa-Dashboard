# Tixa Logger Dashboard

> Developer-facing observability dashboard for centralized workflow logging

A clean, professional dashboard that consumes data from the Tixa Central Logger backend API. Built with Next.js, designed for debugging and analytics.

---

## 🎯 Features

### Core Pages
- **Dashboard** - Analytics overview with metrics and trends
- **Logs** - Searchable, filterable table of all workflow executions
- **Log Detail** - Deep dive into individual executions (most important page)
- **Settings** - Configuration (placeholder)
- **Billing** - Subscription management (placeholder)
- **Profile** - User account (placeholder)

### Key Capabilities
- ✅ Real-time log viewing
- ✅ Execution timeline visualization
- ✅ ReACT reasoning trace (collapsible)
- ✅ Performance metrics
- ✅ Status filtering
- ✅ Pagination
- ✅ Raw JSON inspection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Central Logger backend running (see `../central-logger`)

### Installation

```powershell
cd Tixa-Dashboard

# Install dependencies
npm install

# Configure environment
# Edit .env.local with your backend URL and API key

# Start development server
npm run dev
```

Dashboard will be available at `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your_api_key_here
```

Get your API key from the central-logger `.env` file.

---

## 📁 Project Structure

```
app/
  dashboard/page.tsx       # Analytics overview
  logs/page.tsx            # Logs list with filters
  logs/[id]/page.tsx       # Log detail page (CORE)
  settings/page.tsx        # Settings placeholder
  billing/page.tsx         # Billing placeholder
  profile/page.tsx         # Profile placeholder
  auth/login/page.tsx      # Login scaffold
  auth/signup/page.tsx     # Signup scaffold

components/
  layout/
    Sidebar.tsx            # Navigation sidebar
    Header.tsx             # Page header
  analytics/
    MetricCard.tsx         # Metric display component
  logs/
    LogsTable.tsx          # Logs list table
    TraceTimeline.tsx      # Execution timeline
    JsonViewer.tsx         # Collapsible JSON viewer

services/
  loggerApi.ts             # Backend API client

hooks/
  useLogs.ts               # Logs data hooks
  useMetrics.ts            # Metrics data hooks

types/
  logs.ts                  # TypeScript definitions
```

---

## 🎨 Design Principles

- **Minimal** - Clean, white background, no clutter
- **Developer-first** - Designed like a debugger, not a report
- **Collapsed by default** - Avoid overwhelming users
- **Fast** - Optimized for large log volumes
- **Responsive** - Works on all screen sizes

---

## 🔌 API Integration

All data fetching happens through `services/loggerApi.ts`:

```typescript
// Example usage
import { loggerApi } from '@/services/loggerApi';

// Get metrics
const metrics = await loggerApi.getMetricsOverview();

// Get logs
const logs = await loggerApi.getLogs({ page: 1, status: 'SUCCESS' });

// Get log detail
const log = await loggerApi.getLogById('log-uuid');
```

### Endpoints Used
- `GET /health` - Health check
- `GET /api/v1/metrics/overview` - Analytics overview
- `GET /api/v1/metrics/categories` - Category breakdown
- `GET /api/v1/logs` - Logs list (paginated)
- `GET /api/v1/logs/{id}` - Log detail

---

## 📊 Log Detail Page (Most Important)

The `/logs/[id]` page is the heart of this dashboard. It provides:

### Section 1: Header / Context
- Ticket ID, client, environment, version
- Execution timestamp
- Status badge

### Section 2: Key Metrics
- Execution time
- ReACT iterations
- Overall confidence
- Hallucination risk

### Section 3: Execution Timeline
- Node-by-node execution trace
- Duration and status per node
- Failures highlighted

### Section 4: ReACT Reasoning (Collapsible)
- Iteration-by-iteration thought process
- Actions taken
- Tool calls and results

### Section 5: Retrieval & Evidence (Collapsible)
- Text retrieval hits
- Image matches
- Document references

### Section 6: Final Output
- Final response
- Resolution decision
- Tags applied

### Section 7: Raw Payload (Collapsible)
- Full JSON log payload
- Read-only inspection

---

## 🛠️ Development

```powershell
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

---

## 🚧 Future Enhancements (Not Implemented Yet)

### Authentication
- Email/password login
- JWT sessions
- Role-based access (SERVICE_PROVIDER, CLIENT_ADMIN, CLIENT_VIEWER)

### Billing
- Stripe integration
- Plan selection (Free/Pro/Enterprise)
- Usage tracking
- Invoices

### Advanced Features
- Real-time log streaming
- Advanced search (full-text)
- Custom alerts
- Export to CSV/JSON
- Saved filters

---

## 📝 Notes

- **No authentication** currently - dashboard is open
- **No direct Supabase access** - all data via API
- **Read-only** - no log creation from dashboard
- **Optimized for debugging** - not a reporting tool

---

## 🔗 Related Projects

- **Central Logger** (`../central-logger`) - Backend API
- **Workflow Client** - Sends logs to central logger

---

## 📄 License

Private - Internal use only

---

**Built with:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Axios
- date-fns
- Lucide Icons

---

**Status:** ✅ Phase 5 Complete - Dashboard MVP Ready
