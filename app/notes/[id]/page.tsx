import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";
import { NoteRenderer } from "@/components/NoteRenderer";
import { PublicBadge } from "@/components/PublicBadge";
import { formatDate, toIsoDate } from "@/lib/format";
import { loadOwnNote } from "./load-note";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await loadOwnNote((await params).id);
  return { title: note.title };
}

export default async function NotePage({ params }: Props): Promise<JSX.Element> {
  const note = await loadOwnNote((await params).id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/dashboard"
        className="rounded-sm text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:outline-neutral-100"
      >
        ← Back to notes
      </Link>

      <article className="mt-4 rounded-xl border border-neutral-200 p-6 shadow-sm sm:p-8 dark:border-neutral-800">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight break-words">{note.title}</h1>
            <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span>
                Updated <time dateTime={toIsoDate(note.updatedAt)}>{formatDate(note.updatedAt)}</time>
              </span>
              {note.isPublic && <PublicBadge />}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/notes/${note.id}/edit`}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 dark:focus-visible:outline-neutral-100"
            >
              Edit
            </Link>
            <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
          </div>
        </header>

        <NoteRenderer contentJson={note.contentJson} />
      </article>
    </main>
  );
}
