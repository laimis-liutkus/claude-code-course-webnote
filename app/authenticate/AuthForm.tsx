"use client";

import { useActionState, type JSX } from "react";
import { signInAction, signUpAction, type AuthFormState } from "./actions";

export type AuthMode = "sign-in" | "sign-up";

const SUBMIT_LABELS: Record<AuthMode, { idle: string; pending: string }> = {
  "sign-in": { idle: "Sign in", pending: "Signing in…" },
  "sign-up": { idle: "Create account", pending: "Creating account…" },
};

const MIN_PASSWORD_LENGTH = 8;

type FieldProps = {
  name: "name" | "email" | "password";
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  defaultValue?: string;
  minLength?: number;
  hint?: string;
  errors?: string[];
};

function Field({ name, label, hint, errors, ...inputProps }: FieldProps): JSX.Element {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const error = errors?.[0];
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/20 aria-invalid:border-red-600 dark:border-neutral-700 dark:focus-visible:border-neutral-100 dark:focus-visible:ring-neutral-100/20"
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-xs text-neutral-600 dark:text-neutral-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const initialState: AuthFormState = {};

export function AuthForm({ mode }: { mode: AuthMode }): JSX.Element {
  const isSignUp = mode === "sign-up";
  const [state, formAction, isPending] = useActionState(
    isSignUp ? signUpAction : signInAction,
    initialState,
  );
  const submitLabel = isPending ? SUBMIT_LABELS[mode].pending : SUBMIT_LABELS[mode].idle;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      {isSignUp && (
        <Field
          name="name"
          label="Name"
          type="text"
          autoComplete="name"
          defaultValue={state.values?.name}
          errors={state.fieldErrors?.name}
        />
      )}
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        minLength={isSignUp ? MIN_PASSWORD_LENGTH : undefined}
        hint={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        errors={state.fieldErrors?.password}
      />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {submitLabel}
      </button>
    </form>
  );
}
