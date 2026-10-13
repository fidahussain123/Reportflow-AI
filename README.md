# ReportFlow AI

ReportFlow AI turns Google Ads and Meta Ads CSV exports into client-ready PDF reports. You upload a campaign export, the app analyses the numbers with a large language model, and you get a written report you can download as a PDF.

## What it does

- Upload a Google Ads or Meta Ads CSV export by drag and drop.
- Generate a written analysis of how the campaigns performed.
- Preview the report and export it as a branded PDF.
- Keep track of past reports from a simple dashboard.

## Stack

Next.js 14 (App Router), TypeScript and Tailwind CSS, with an LLM API for the analysis, jsPDF for the PDF export, Papaparse for CSV parsing and Zustand for state.

## Running it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/fidahussain123/Reportflow-AI.git
cd Reportflow-AI
npm install
cp .env.example .env.local
```

Add your API key to `.env.local`:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Then run `npm run dev` and open http://localhost:3000.

Without an API key the app runs in demo mode and produces a sample report, so you can try the whole flow first.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-report/     # report generation endpoint
│   ├── dashboard/
│   │   ├── new-report/          # three-step report wizard
│   │   ├── report/[id]/         # report preview
│   │   ├── reports/             # list of all reports
│   │   └── settings/            # account settings
│   ├── layout.tsx
│   └── page.tsx                 # landing page
├── components/
│   ├── CSVUploader.tsx          # drag-and-drop upload
│   ├── PDFExporter.tsx          # PDF generation
│   ├── ReportPreview.tsx        # report rendering
│   └── Sidebar.tsx
└── lib/
    ├── store.ts                 # Zustand store
    └── utils.ts
```

## CSV format

Google Ads export (Reports, then Predefined Reports, then Campaign Performance) needs these columns: Campaign, Impressions, Clicks, CTR, Avg. CPC, Cost, Conversions, Conv. rate and Cost / conv.

Meta Ads export (Ads Manager, then Export, then Campaign Data) needs these columns: Campaign name, Reach, Impressions, Clicks (all), CTR (all), CPC (all), Amount spent, Results, Cost per result and CPM.

## Environment variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `ANTHROPIC_API_KEY` | Key for the language model that writes the analysis | Yes, outside demo mode |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Not yet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Not yet |
| `STRIPE_SECRET_KEY` | Stripe secret key | Not yet |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Not yet |

Supabase and Stripe are planned for accounts and payments and aren't used yet.

## Scripts

- `npm run dev` starts the development server
- `npm run build` builds for production
- `npm run start` runs the production build
- `npm run lint` runs ESLint

## License

MIT
