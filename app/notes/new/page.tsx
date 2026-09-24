import type { Metadata } from "next";
import type { JSX } from "react";
import { requireUser } from "@/lib/auth";
import { NewNoteForm } from "./NewNoteForm";

export const metadata: Metadata = {
  title: "New note",
};

export default async function NewNotePage(): Promise<JSX.Element> {
  await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <section
        aria-labelledby="new-note-heading"
        className="rounded-xl border border-neutral-200 p-6 shadow-sm sm:p-8 dark:border-neutral-800"
      >
        <h1 id="new-note-heading" className="mb-6 text-2xl font-semibold tracking-tight">
          New note
        </h1>
        <NewNoteForm />
      </section>
    </main>
  );
}
