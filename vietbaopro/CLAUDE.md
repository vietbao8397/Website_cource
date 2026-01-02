# Vietbaopro E-Learning Platform

## Project Overview
This is a Next.js 15 e-learning platform with TypeScript, Supabase, and Vanilla CSS. The platform allows users to browse courses, purchase them, and access learning content.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Vanilla CSS with CSS Modules
- **Email**: Resend API
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   ├── checkout/       # Checkout flow
│   ├── courses/        # Course pages
│   └── ...
├── components/         # Reusable React components
│   └── ui/            # UI primitives
├── lib/               # Utilities and configurations
│   ├── supabase/      # Supabase client setup
│   └── email.ts       # Email utilities
└── styles/            # Global styles
```

## Key Features
- Course catalog with categories
- User authentication (email/password, Google)
- Checkout and payment flow
- Admin dashboard for content management
- Sales Pipeline CRM
- Email Marketing Automation

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## GitHub Repository
- **Owner**: vietbao8397
- **Repo**: Website_cource
- **Branch**: main

---

## CCPM Workflow Rules

### Core Principle: No Vibe Coding
> Every line of code must trace back to a specification.

### 5-Phase Development Discipline
1. **🧠 Brainstorm** - Think deeper than comfortable
2. **📝 Document** - Write specs that leave nothing to interpretation
3. **📐 Plan** - Architect with explicit technical decisions
4. **⚡ Execute** - Build exactly what was specified
5. **📊 Track** - Maintain transparent progress at every step

### Command Reference
- `/pm:prd-new [name]` - Create new Product Requirements Document
- `/pm:prd-parse [name]` - Convert PRD to implementation epic
- `/pm:epic-decompose [name]` - Break epic into tasks
- `/pm:epic-sync [name]` - Push to GitHub Issues
- `/pm:issue-start [id]` - Begin work on issue
- `/pm:next` - Get next priority task

### File Conventions
- PRDs: `.claude/prds/[feature-name].md`
- Epics: `.claude/epics/[feature-name]/epic.md`
- Tasks: `.claude/epics/[feature-name]/[#].md`

### Context Files
Always read `.claude/context/` at session start for project awareness.
