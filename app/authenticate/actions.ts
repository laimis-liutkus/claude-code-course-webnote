"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { consumeRateLimit, getClientIp, type RateLimitRule } from "@/lib/rate-limit";
import { plainTextSchema } from "@/lib/sanitize";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string[]>>;
  values?: { name?: string; email?: string };
};

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: plainTextSchema(100).pipe(z.string().min(1, "Name is required")),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

// auth.api calls bypass better-auth's rate limiter, so the actions enforce their own.
const SIGN_IN_IP_LIMIT: RateLimitRule = { windowMs: 60_000, max: 10 };
const SIGN_IN_EMAIL_LIMIT: RateLimitRule = { windowMs: 5 * 60_000, max: 5 };
const SIGN_UP_IP_LIMIT: RateLimitRule = { windowMs: 10 * 60_000, max: 5 };

// Consumes every bucket (so each one counts the attempt) and reports the longest wait.
function checkRateLimits(limits: [key: string, rule: RateLimitRule][]): string | undefined {
  const retryAfterSec = Math.max(
    0,
    ...limits
      .map(([key, rule]) => consumeRateLimit(key, rule))
      .filter((result) => !result.allowed)
      .map((result) => result.retryAfterSec),
  );
  if (retryAfterSec > 0) return `Too many attempts. Try again in ${retryAfterSec} seconds.`;
}

function readValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
}

function toErrorMessage(err: unknown): string {
  if (err instanceof APIError) {
    const code = String(err.body?.code ?? "");
    if (code === "INVALID_EMAIL_OR_PASSWORD") return "Invalid email or password";
    if (code.startsWith("USER_ALREADY_EXISTS")) {
      return "An account with this email already exists";
    }
  }
  console.error("Authentication failed", err);
  return "Something went wrong. Please try again.";
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = readValues(formData);
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const ip = await getClientIp();
  const rateLimitError = checkRateLimits([
    [`sign-in:ip:${ip}`, SIGN_IN_IP_LIMIT],
    [`sign-in:email:${parsed.data.email.toLowerCase()}`, SIGN_IN_EMAIL_LIMIT],
  ]);
  if (rateLimitError) return { error: rateLimitError, values };

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (err) {
    return { error: toErrorMessage(err), values };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (err) {
    console.error("Sign out failed", err);
  }

  redirect("/authenticate");
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = readValues(formData);
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const ip = await getClientIp();
  const rateLimitError = checkRateLimits([[`sign-up:ip:${ip}`, SIGN_UP_IP_LIMIT]]);
  if (rateLimitError) return { error: rateLimitError, values };

  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (err) {
    return { error: toErrorMessage(err), values };
  }

  redirect("/dashboard");
}
