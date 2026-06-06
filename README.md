# Para AI

A legal AI assistant web app for analyzing documents, generating citations, and answering legal questions.

Built with Next.js, TypeScript, Tailwind CSS, and the Anthropic Claude API.

---

## Features

### Assistant
Chat interface powered by Claude. Ask legal questions, analyze documents, and get precise answers. Supports multi-turn conversations with a configurable system prompt.

### Research
Upload legal documents and generate citations from them. Select one or more source documents, enter a search query, and get relevant excerpts with properly formatted legal citations. Supports Bluebook, ALWD, and California Style Manual formats.

### Library
Upload and manage PDF and text files. Files are stored on the server and can be previewed directly in the browser — images and PDFs render inline, text files display as formatted content.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/lungyoungyu/dimensional-app.git
cd dimensional-app
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Alternatively, add your API key directly in the app via **Settings** after signing in.

### Running locally

```bash
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo credentials

```
Email:    eric@example.com
Password: demo
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| File parsing | `pdf-parse` |
| Auth | localStorage (demo only) |
| Storage | Local filesystem (`public/uploads/`) |

---

## Project Structure

```
app/
├── (main)/               # Authenticated app routes
│   ├── assistant/        # Chat interface
│   ├── research/         # Citation generator
│   ├── library/          # File manager
│   └── settings/         # API key, model, citation format
├── api/
│   ├── chat/             # Streaming chat endpoint
│   ├── citations/        # Citation generation endpoint
│   ├── upload/           # File upload endpoint
│   └── files/            # File listing endpoint
├── components/
│   ├── Sidebar.tsx       # Navigation + profile dropdown
│   ├── ChatWindow.tsx    # Chat UI with streaming
│   └── AuthGuard.tsx     # Route protection
├── lib/
│   └── auth.ts           # Sign in / sign out / auth check
├── hooks/
│   └── useSettings.ts    # Settings persistence (localStorage)
└── login/                # Login page
```

---

## Notes

- **File storage** uses the local filesystem (`public/uploads/`). This works for local development but will not persist on serverless platforms like Vercel. For production, swap in a cloud storage provider (AWS S3, Cloudflare R2, Vercel Blob).
- **Authentication** is client-side localStorage only — suitable for demos, not production. For real auth, use [Clerk](https://clerk.com), [Auth0](https://auth0.com), or [Supabase Auth](https://supabase.com/auth).
- **API key** can be set via `.env.local` or entered in Settings. It is stored in the browser's localStorage and sent to your own Next.js API routes — it never goes directly to Anthropic from the client.
