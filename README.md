# Para AI

A legal AI assistant web app for analyzing documents, generating citations, and answering legal questions — powered by either Anthropic Claude or OpenAI, your choice.

Built with Next.js, TypeScript, and Tailwind CSS.

---

## Screenshots

### Assistant
Streaming chat, powered by whichever provider is active in Settings.

![Assistant chat interface](docs/screenshots/assistant.png)

### Research
Select source documents, ask a question, get excerpts with formatted legal citations.

![Research citation tool](docs/screenshots/research.png)

### Library
Upload and manage PDF and text files.

![Library file manager](docs/screenshots/library.png)

### Settings
Toggle between Anthropic Claude and OpenAI, each with its own API key and model.

![Settings with AI provider toggle](docs/screenshots/settings.png)

---

## Features

### Assistant
Chat interface with streaming responses. Ask legal questions, analyze documents, and get precise answers. Supports multi-turn conversations with a configurable system prompt.

### Research
Upload legal documents and generate citations from them. Select one or more source documents, enter a search query, and get relevant excerpts with properly formatted legal citations. Supports Bluebook, ALWD, and California Style Manual formats.

### Library
Upload and manage PDF and text files. Files are stored on the server and can be previewed directly in the browser — images and PDFs render inline, text files display as formatted content.

### AI Provider Toggle
Switch between Anthropic Claude and OpenAI in Settings. Each provider keeps its own API key and model selection — switching back and forth never overwrites or exposes the other provider's saved key.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [Anthropic API key](https://console.anthropic.com) and/or an [OpenAI API key](https://platform.openai.com/api-keys)

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
OPENAI_API_KEY=sk-...
```

Either variable is optional — set whichever provider(s) you plan to use. Alternatively, add your API key directly in the app via **Settings** after signing in; per-provider keys entered there are stored in the browser and take priority over the server-side env vars.

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
| AI | Anthropic Claude (`claude-sonnet-4-6` / `claude-opus-4-8`) or OpenAI (`gpt-4o` / `gpt-4o-mini`) |
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
│   └── settings/         # Provider toggle, API keys, model, citation format
├── api/
│   ├── chat/             # Streaming chat endpoint (Anthropic + OpenAI)
│   ├── citations/        # Citation generation endpoint (Anthropic + OpenAI)
│   ├── upload/           # File upload endpoint
│   └── files/            # File listing endpoint
├── components/
│   ├── Sidebar.tsx       # Navigation + profile dropdown
│   ├── ChatWindow.tsx    # Chat UI with streaming
│   └── AuthGuard.tsx     # Client-side route protection
├── lib/
│   ├── auth.ts           # Sign in / sign out / auth check
│   └── rateLimit.ts      # Per-IP rate limiting for AI routes
├── hooks/
│   └── useSettings.ts    # Per-provider settings persistence (localStorage)
└── login/                # Login page
```

---

## Notes

- **File storage** uses the local filesystem (`public/uploads/`). This works for local development but will not persist on serverless platforms like Vercel. For production, swap in a cloud storage provider (AWS S3, Cloudflare R2, Vercel Blob).
- **Authentication** is client-side localStorage only, with no server-side session — suitable for demos, not production. For real auth, use [Clerk](https://clerk.com), [Auth0](https://auth0.com), or [Supabase Auth](https://supabase.com/auth).
- **API keys** can be set via `.env.local` or entered per-provider in Settings. A key entered in Settings is stored in the browser's localStorage and sent to your own Next.js API routes — it never goes directly to the provider from the client.
- **Rate limiting** on `/api/chat` and `/api/citations` is in-memory and per-process — fine for a single server instance, but it won't share state across multiple serverless instances. A production deployment behind real traffic should move this to a shared store (e.g. Upstash Redis).
- **Research citations** are generated from the first 12,000 characters of each document with no page/location tracking (`pdf-parse` returns flat text, not structured position data) — treat citation strings as a starting point to verify, not a pincite.
