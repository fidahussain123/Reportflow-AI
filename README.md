# ReportFlow AI

Turn raw marketing data into professional client reports in seconds using Claude AI.

## Features

- **CSV Upload**: Drag and drop Google Ads or Meta Ads CSV exports
- **AI-Powered Reports**: Claude AI analyzes your data and writes professional narratives
- **PDF Export**: Generate beautiful, branded PDF reports with one click
- **Dashboard**: Track all your reports with stats and quick access

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API (Anthropic)
- **PDF**: jsPDF
- **CSV Parsing**: Papaparse
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ReportAI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-report/     # Claude AI report generation
│   ├── dashboard/
│   │   ├── new-report/          # 3-step report wizard
│   │   ├── report/[id]/         # Report preview page
│   │   ├── reports/             # All reports list
│   │   └── settings/            # Account settings
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── CSVUploader.tsx          # Drag & drop CSV upload
│   ├── PDFExporter.tsx          # PDF generation
│   ├── ReportPreview.tsx        # Markdown report rendering
│   └── Sidebar.tsx              # Navigation sidebar
└── lib/
    ├── store.ts                 # Zustand state management
    └── utils.ts                 # Utility functions
```

## CSV Format

### Google Ads Export
Required columns:
- Campaign
- Impressions
- Clicks
- CTR
- Avg. CPC
- Cost
- Conversions
- Conv. rate
- Cost / conv.

Export from: Google Ads → Reports → Predefined Reports → Campaign Performance

### Meta Ads Export
Required columns:
- Campaign name
- Reach
- Impressions
- Clicks (all)
- CTR (all)
- CPC (all)
- Amount spent
- Results
- Cost per result
- CPM

Export from: Meta Ads Manager → Export → Campaign Data

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No* |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | No* |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No* |

*These will be required when database/auth/payments are implemented.

## Demo Mode

If no `ANTHROPIC_API_KEY` is configured, the app will generate a demo report so you can test the full flow without an API key.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Design System

The app uses a strict black and white color scheme:
- Primary: #000000 (Black)
- Secondary: #FFFFFF (White)
- All UI elements follow the monochrome theme for a clean, professional look.

## License

MIT
# Reportflow-AI
