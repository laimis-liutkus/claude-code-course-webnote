import "server-only";
import { headers } from "next/headers";
import { get, run } from "@/lib/db";

export type RateLimitRule = { windowMs: number; max: number };
export type RateLimitResult = { allowed: boolean; retryAfterSec: number };

// Fixed-window counter; the upsert is a single statement, so concurrent requests can't race.
export function consumeRateLimit(key: string, { windowMs, max }: RateLimitRule): RateLimitResult {
  const now = Date.now();
  run("DELETE FROM rate_limit WHERE reset_at <= ?", [now]);

  const row = get<{ count: number; reset_at: number }>(
    `INSERT INTO rate_limit (key, count, reset_at) VALUES (?1, 1, ?2 + ?3)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN reset_at <= ?2 THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at <= ?2 THEN excluded.reset_at ELSE reset_at END
     RETURNING count, reset_at`,
    [key, now, windowMs],
  );
  if (!row) throw new Error(`Rate limit upsert returned no row for ${key}`);

  return {
    allowed: row.count <= max,
    retryAfterSec: Math.max(1, Math.ceil((row.reset_at - now) / 1000)),
  };
}

// Only trustworthy behind a proxy that overwrites these headers; pair IP limits with per-account ones.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}
