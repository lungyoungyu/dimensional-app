import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  const { messages, model, apiKey, systemPrompt } = await req.json();

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response("No API key configured. Add one in Settings.", { status: 401 });
  }

  const client = new Anthropic({ apiKey: key });

  const stream = await client.messages.stream({
    model: model || "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt || "You are a helpful legal AI assistant. Be precise and use proper legal terminology.",
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
