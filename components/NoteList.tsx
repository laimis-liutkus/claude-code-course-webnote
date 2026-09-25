import Link from "next/link";
import type { JSX } from "react";
import { PublicBadge } from "@/components/PublicBadge";
import { formatDate, toIsoDate } from "@/lib/format";
import type { Note } from "@/lib/notes";

type NoteListProps = {
  notes: Pick<Note, "id" | "title" | "updatedAt" | "isPublic">[];
};

export function NoteList({ notes }: NoteListProps): JSX.Element {
  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="font-medium">No notes yet</p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Create your first note to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-4 shadow-sm hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:focus-visible:outline-neutral-100"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium">{note.title}</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Updated <time dateTime={toIsoDate(note.updatedAt)}>{formatDate(note.updatedAt)}</time>
              </span>
            </span>
            {note.isPublic && <PublicBadge />}
          </Link>
        </li>
      ))}
    </ul>
  );
}
