import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { messages, provider, model, apiKey, systemPrompt } = await req.json();

  const encoder = new TextEncoder();
  const defaultSystemPrompt = "You are a helpful legal AI assistant. Be precise and use proper legal terminology.";

  if (provider === "openai") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return new Response("No API key configured. Add one in Settings.", { status: 401 });
    }

    const client = new OpenAI({ apiKey: key });

    const stream = await client.chat.completions.create({
      model: model || "gpt-4o",
      max_completion_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt || defaultSystemPrompt },
        ...messages,
      ],
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Default: Anthropic
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response("No API key configured. Add one in Settings.", { status: 401 });
  }

  const client = new Anthropic({ apiKey: key });

  const stream = await client.messages.stream({
    model: model || "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt || defaultSystemPrompt,
    messages,
  });

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
