# Clinio AI – Next.js + TypeScript

A fully migrated Next.js 14 (App Router) + TypeScript version of the Clinio AI platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v3
- **State**: Zustand
- **Data fetching**: TanStack React Query v5
- **HTTP**: Axios + native fetch (Firestore REST API)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase values:

```bash
cp .env.example .env.local
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (sidebar, bottom nav, footer)
│   ├── page.tsx            # Home page
│   ├── rapid-quiz/         # Rapid Quiz
│   ├── exam/               # Exam Mode (setup / session / results)
│   ├── feed/               # Clinio Room feed + post detail
│   ├── scenarios/          # Clinical OSCE scenarios
│   ├── practice-exams/     # Practice Exams
│   └── about|contact|...   # Static pages
├── components/
│   ├── layout/             # AppLayout, BottomNav, Footer
│   └── ui/                 # ShareButtons, etc.
├── features/               # Feature-specific components
├── stores/                 # Zustand stores (useQuizStore, useExamStore)
├── data/                   # Firestore REST helpers (categories, questions)
├── types/                  # TypeScript interfaces
└── utils/                  # sessionManager, questionSelector
```

## Migration Notes (Vite → Next.js)

| Vite / React Router | Next.js Equivalent |
|---|---|
| `react-router-dom` `<Link to>` | `next/link` `<Link href>` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useParams()` | `useParams<T>()` from `next/navigation` |
| `useSearchParams()` (RR) | `useSearchParams()` from `next/navigation` (needs Suspense) |
| `vite.config.ts` | `next.config.ts` |
| `index.html` + `main.tsx` | `app/layout.tsx` |
| `src/routes/index.tsx` | `app/**/page.tsx` (file-based routing) |
| `tailwind.config.js` | `tailwind.config.ts` |

## Key Patterns

- All interactive components have `'use client'` at the top
- Pages that use `useSearchParams` are wrapped in `<Suspense>`
- Server components (page files) export `metadata` for SEO
- All type-only imports use `import type { ... }`
