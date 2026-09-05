import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { rateLimit, getClientIp, rateLimitJsonResponse } from "../../lib/rateLimit";

// Same tiering as /api/chat: BYOK callers spend their own quota, server-key
// fallback callers spend the app owner's - throttle that path much harder.
const BYOK_LIMIT = 15;
const SERVER_KEY_LIMIT = 5;
const WINDOW_MS = 60_000;

const MAX_FILENAMES = 10;
const MAX_QUERY_LENGTH = 500;

// Per-document caps on how much we send to the model. Applied at page
// boundaries (never mid-page) so every included excerpt still has a page
// number attached to it - the whole point of extracting per-page.
const MAX_PAGES_PER_DOC = 40;
const MAX_CHARS_PER_DOC = 40_000;

interface PageChunk {
  page: number | null;
  text: string;
}

// PDFs: real per-page text via pdf-parse's PDFParse class (built on
// pdfjs-dist), which returns text grouped by page number - this is what
// makes a page-accurate citation link possible at all. Plain text files
// have no native pagination, so they get a single page:null chunk (same
// as before this fix - no page-jump link is offered for them).
async function extractPages(filename: string): Promise<PageChunk[]> {
  const filePath = join(process.cwd(), "public", "uploads", filename);
  const ext = extname(filename).toLowerCase();

  if (ext === ".pdf") {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const chunks: PageChunk[] = [];
      let totalChars = 0;
      for (const p of result.pages) {
        if (chunks.length >= MAX_PAGES_PER_DOC || totalChars >= MAX_CHARS_PER_DOC) break;
        chunks.push({ page: p.num, text: p.text });
        totalChars += p.text.length;
      }
      return chunks;
    } finally {
      await parser.destroy();
    }
  }

  const text = await readFile(filePath, "utf-8");
  return [{ page: null, text: text.slice(0, MAX_CHARS_PER_DOC) }];
}

export async function POST(req: Request) {
  const { query, filenames, format, provider, model, apiKey } = await req.json();

  if (!query || !filenames?.length) {
    return Response.json({ error: "Missing query or files" }, { status: 400 });
  }
  if (typeof query !== "string" || query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: `Query must be under ${MAX_QUERY_LENGTH} characters.` }, { status: 400 });
  }
  if (!Array.isArray(filenames) || filenames.length > MAX_FILENAMES) {
    return Response.json({ error: `At most ${MAX_FILENAMES} files per search.` }, { status: 400 });
  }

  const key = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY);
  if (!key) {
    return Response.json({ error: "No API key configured. Add one in Settings." }, { status: 401 });
  }

  const usingServerKey = !apiKey;
  const ip = getClientIp(req);
  const tier = usingServerKey ? "server" : "byok";
  const limit = usingServerKey ? SERVER_KEY_LIMIT : BYOK_LIMIT;
  const { allowed, retryAfterSeconds } = rateLimit(`citations:${tier}:${ip}`, limit, WINDOW_MS);
  if (!allowed) {
    return rateLimitJsonResponse(retryAfterSeconds);
  }

  const docs = await Promise.all(
    filenames.map(async (filename: string) => {
      try {
        const pages = await extractPages(filename);
        const name = filename.replace(/^\d+-/, "");
        return { filename, name, pages };
      } catch {
        return null;
      }
    })
  );

  const validDocs = docs.filter(Boolean) as { filename: string; name: string; pages: PageChunk[] }[];

  if (validDocs.length === 0) {
    return Response.json({ error: "Could not read any files" }, { status: 400 });
  }

  const docsBlock = validDocs
    .map((d, i) => {
      const body = d.pages
        .map((p) => (p.page !== null ? `[PAGE ${p.page}]\n${p.text}` : p.text))
        .join("\n\n");
      return `--- DOCUMENT ${i + 1}: ${d.name} ---\n${body}`;
    })
    .join("\n\n");

  const formatLabel = format === "California" ? "California Style Manual" : format;

  const prompt = `You are a legal citation assistant. A user is searching across legal documents for relevant passages and needs proper legal citations.

QUERY: "${query}"

DOCUMENTS:
${docsBlock}

For each document that contains content relevant to the query, return up to 2 relevant excerpts. For each excerpt, generate a ${formatLabel} citation. Use the document filename as the case or document name. Apply correct ${formatLabel} citation rules for legal documents, cases, statutes, or secondary sources as appropriate.

Rules for the "page" field in your response:
- Text in the DOCUMENTS section is tagged with "[PAGE N]" markers. If an excerpt falls under one of these markers, set "page" to that exact number N, and use it as the pincite in the citation string (e.g. "at 4").
- If a document has no "[PAGE N]" markers anywhere (a plain text file), set "page" to null.
- Never guess, estimate, or interpolate a page number that was not explicitly marked in the source text above.

Return ONLY a valid JSON array — no markdown, no explanation. Format:
[
  {
    "filename": "exact-filename-here",
    "name": "display name",
    "excerpt": "The exact relevant passage from the document (2–4 sentences)",
    "citation": "Full ${formatLabel} citation string",
    "page": 4
  }
]

If no relevant content is found in a document, omit it. If nothing is relevant across all documents, return an empty array [].`;

  let raw = "[]";
  try {
    if (provider === "openai") {
      const client = new OpenAI({ apiKey: key });
      const completion = await client.chat.completions.create({
        model: model || "gpt-4o",
        max_completion_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });
      raw = completion.choices[0]?.message?.content || "[]";
    } else {
      const client = new Anthropic({ apiKey: key });
      const message = await client.messages.create({
        model: model || "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });
      raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    }
  } catch (err) {
    // Invalid/expired BYOK keys or upstream outages shouldn't surface as a
    // raw 500 - the key itself is user-controlled input.
    const status = (err as { status?: number })?.status;
    const message = status === 401
      ? "The API key was rejected. Check it in Settings."
      : "The AI provider returned an error. Please try again.";
    return Response.json({ error: message }, { status: 502 });
  }

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const results = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");

    // Don't just trust the model's honesty about "page" - the prompt asks it
    // not to guess, but nothing stops it from doing so anyway. Clamp against
    // the page numbers we actually extracted for that file; anything that
    // doesn't match a real page we sent becomes null rather than a
    // confident-looking wrong link.
    const validPagesByFile = new Map(
      validDocs.map((d) => [
        d.filename,
        new Set(d.pages.map((p) => p.page).filter((n): n is number => n !== null)),
      ])
    );
    const verified = Array.isArray(results)
      ? results.map((r) => {
          const validPages = validPagesByFile.get(r?.filename);
          const page = typeof r?.page === "number" && validPages?.has(r.page) ? r.page : null;
          return { ...r, page };
        })
      : results;

    return Response.json(verified);
  } catch {
    return Response.json([]);
  }
}
