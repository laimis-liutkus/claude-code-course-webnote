import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type JSX } from "react";
import { z } from "zod";
import { NoteRenderer } from "@/components/NoteRenderer";
import { PublicBadge } from "@/components/PublicBadge";
import { requireUser } from "@/lib/auth";
import { formatDate, toIsoDate } from "@/lib/format";
import { getNoteById, type Note } from "@/lib/notes";

type Props = {
  params: Promise<{ id: string }>;
};

// Deduplicated per request so generateMetadata and the page share one query.
const loadNote = cache(async (rawId: string): Promise<Note> => {
  const user = await requireUser();
  const parsedId = z.uuid().safeParse(rawId);
  if (!parsedId.success) notFound();

  const note = await getNoteById(user.id, parsedId.data);
  if (!note) notFound();
  return note;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await loadNote((await params).id);
  return { title: note.title };
}

export default async function NotePage({ params }: Props): Promise<JSX.Element> {
  const note = await loadNote((await params).id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/dashboard"
        className="rounded-sm text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:outline-neutral-100"
      >
        ← Back to notes
      </Link>

      <article className="mt-4 rounded-xl border border-neutral-200 p-6 shadow-sm sm:p-8 dark:border-neutral-800">
        <header className="mb-6 flex flex-col gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <h1 className="text-3xl font-semibold tracking-tight break-words">{note.title}</h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>
              Updated <time dateTime={toIsoDate(note.updatedAt)}>{formatDate(note.updatedAt)}</time>
            </span>
            {note.isPublic && <PublicBadge />}
          </p>
        </header>

        <NoteRenderer contentJson={note.contentJson} />
      </article>
    </main>
  );
}
