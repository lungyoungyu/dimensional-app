// In-memory, per-process rate limiter. Good enough for a single long-running
// Node server; it does NOT share state across serverless invocations or
// multiple instances. If this app is ever deployed on Vercel/serverless with
// real traffic, swap this for a shared store (Upstash Redis, etc).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Buckets are 1:1 with distinct rate-limit keys (ip+route+tier). Idle demo
// traffic won't grow this unboundedly, but sweep expired entries periodically
// so a slow trickle of distinct IPs can't leak memory forever.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, CLEANUP_INTERVAL_MS);
// Don't let the interval keep the process alive (irrelevant in serverless,
// helpful for local `next dev`/scripts).
cleanupTimer.unref?.();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limit. `key` should already encode everything that
 * should share a bucket (e.g. `${ip}:${route}:${tier}`).
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP extraction behind a proxy/load balancer. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

const RATE_LIMIT_MESSAGE = "Rate limit exceeded. Please slow down and try again shortly.";

export function rateLimitJsonResponse(retryAfterSeconds: number): Response {
  return Response.json(
    { error: RATE_LIMIT_MESSAGE },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export function rateLimitTextResponse(retryAfterSeconds: number): Response {
  return new Response(RATE_LIMIT_MESSAGE, {
    status: 429,
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}
