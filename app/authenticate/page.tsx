import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getSession } from "@/lib/auth";
import { AuthForm, type AuthMode } from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
};

const COPY: Record<
  AuthMode,
  { heading: string; intro: string; switchPrompt: string; switchLabel: string; switchMode: AuthMode }
> = {
  "sign-in": {
    heading: "Welcome back",
    intro: "Sign in to access your notes.",
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchMode: "sign-up",
  },
  "sign-up": {
    heading: "Create an account",
    intro: "Sign up with your email and a password.",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchMode: "sign-in",
  },
};

type Props = {
  searchParams: Promise<{ mode?: string | string[] }>;
};

function parseMode(value: string | string[] | undefined): AuthMode {
  return value === "sign-up" ? "sign-up" : "sign-in";
}

export default async function AuthenticatePage({ searchParams }: Props): Promise<JSX.Element> {
  if (await getSession()) redirect("/dashboard");

  const mode = parseMode((await searchParams).mode);
  const copy = COPY[mode];

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section
        aria-labelledby="auth-heading"
        className="w-full max-w-sm rounded-xl border border-neutral-200 p-8 shadow-sm dark:border-neutral-800"
      >
        <header className="mb-6 flex flex-col gap-1">
          <h1 id="auth-heading" className="text-2xl font-semibold tracking-tight">
            {copy.heading}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{copy.intro}</p>
        </header>

        <AuthForm key={mode} mode={mode} />

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {copy.switchPrompt}{" "}
          <Link
            href={`?mode=${copy.switchMode}`}
            className="font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
