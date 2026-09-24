import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

// Deduplicated per request, so pages and nested components can call it freely.
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

// For pages / server components: redirects anonymous visitors to sign in.
// Route handlers should use getCurrentUser() and respond with 401 instead.
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/authenticate");
  return user;
}
