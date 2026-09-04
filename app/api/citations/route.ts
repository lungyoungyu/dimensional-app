import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { join, extname } from "path";

async function extractText(filename: string): Promise<string> {
  const filePath = join(process.cwd(), "public", "uploads", filename);
  const ext = extname(filename).toLowerCase();

  if (ext === ".pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  return await readFile(filePath, "utf-8");
}

export async function POST(req: Request) {
  const { query, filenames, format, provider, model, apiKey } = await req.json();

  if (!query || !filenames?.length) {
    return Response.json({ error: "Missing query or files" }, { status: 400 });
  }

  const key = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY);
  if (!key) {
    return Response.json({ error: "No API key configured. Add one in Settings." }, { status: 401 });
  }

  const docs = await Promise.all(
    filenames.map(async (filename: string) => {
      try {
        const content = await extractText(filename);
        const name = filename.replace(/^\d+-/, "");
        return { filename, name, content: content.slice(0, 12000) };
      } catch {
        return null;
      }
    })
  );

  const validDocs = docs.filter(Boolean) as { filename: string; name: string; content: string }[];

  if (validDocs.length === 0) {
    return Response.json({ error: "Could not read any files" }, { status: 400 });
  }

  const docsBlock = validDocs
    .map((d, i) => `--- DOCUMENT ${i + 1}: ${d.name} ---\n${d.content}`)
    .join("\n\n");

  const formatLabel = format === "California" ? "California Style Manual" : format;

  const prompt = `You are a legal citation assistant. A user is searching across legal documents for relevant passages and needs proper legal citations.

QUERY: "${query}"

DOCUMENTS:
${docsBlock}

For each document that contains content relevant to the query, return up to 2 relevant excerpts. For each excerpt, generate a ${formatLabel} citation. Use the document filename as the case or document name. Apply correct ${formatLabel} citation rules for legal documents, cases, statutes, or secondary sources as appropriate.

Return ONLY a valid JSON array — no markdown, no explanation. Format:
[
  {
    "filename": "exact-filename-here",
    "name": "display name",
    "excerpt": "The exact relevant passage from the document (2–4 sentences)",
    "citation": "Full ${formatLabel} citation string"
  }
]

If no relevant content is found in a document, omit it. If nothing is relevant across all documents, return an empty array [].`;

  let raw = "[]";
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

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const results = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}
