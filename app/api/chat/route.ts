import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { rateLimit, getClientIp, rateLimitTextResponse } from "../../lib/rateLimit";

// Callers who supply their own key only cost the app owner bandwidth, so they
// get a generous limit. Callers riding the server's own ANTHROPIC_API_KEY /
// OPENAI_API_KEY fallback are spending the app owner's money directly, so
// that path is throttled hard - this is the actual "bad intentions" vector
// for an app with no server-side session on its API routes.
const BYOK_LIMIT = 30;
const SERVER_KEY_LIMIT = 5;
const WINDOW_MS = 60_000;

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;

function upstreamErrorMessage(err: unknown): string {
  // Anthropic/OpenAI SDK errors carry a `status`; surface auth failures
  // distinctly since an invalid BYOK key is a user-fixable problem, not a
  // server bug.
  const status = (err as { status?: number })?.status;
  if (status === 401) return "The API key was rejected. Check it in Settings.";
  if (status === 429) return "The AI provider rate-limited this request. Try again shortly.";
  return "The AI provider returned an error. Please try again.";
}

export async function POST(req: Request) {
  const { messages, provider, model, apiKey, systemPrompt } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return new Response("Invalid request: messages must be a non-empty array of at most " + MAX_MESSAGES + " turns.", { status: 400 });
  }
  if (messages.some((m) => typeof m?.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH)) {
    return new Response("Invalid request: each message must be under " + MAX_MESSAGE_LENGTH + " characters.", { status: 400 });
  }

  const usingServerKey = !apiKey;
  const ip = getClientIp(req);
  const tier = usingServerKey ? "server" : "byok";
  const limit = usingServerKey ? SERVER_KEY_LIMIT : BYOK_LIMIT;
  const { allowed, retryAfterSeconds } = rateLimit(`chat:${tier}:${ip}`, limit, WINDOW_MS);
  if (!allowed) {
    return rateLimitTextResponse(retryAfterSeconds);
  }

  const encoder = new TextEncoder();
  const defaultSystemPrompt = "You are a helpful legal AI assistant. Be precise and use proper legal terminology.";

  if (provider === "openai") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return new Response("No API key configured. Add one in Settings.", { status: 401 });
    }

    const client = new OpenAI({ apiKey: key });

    let stream;
    try {
      stream = await client.chat.completions.create({
        model: model || "gpt-4o",
        max_completion_tokens: 1024,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt || defaultSystemPrompt },
          ...messages,
        ],
      });
    } catch (err) {
      return new Response(upstreamErrorMessage(err), { status: 502 });
    }

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.enqueue(encoder.encode("\n\n[" + upstreamErrorMessage(err) + "]"));
        } finally {
          controller.close();
        }
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

  let stream;
  try {
    stream = client.messages.stream({
      model: model || "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt || defaultSystemPrompt,
      messages,
    });
  } catch (err) {
    return new Response(upstreamErrorMessage(err), { status: 502 });
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode("\n\n[" + upstreamErrorMessage(err) + "]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
