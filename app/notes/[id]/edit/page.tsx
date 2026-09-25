import type { Metadata } from "next";
import type { JSX } from "react";
import { NoteForm } from "@/components/NoteForm";
import { loadOwnNote } from "../load-note";
import { updateNoteAction } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await loadOwnNote((await params).id);
  return { title: `Edit: ${note.title}` };
}

export default async function EditNotePage({ params }: Props): Promise<JSX.Element> {
  const note = await loadOwnNote((await params).id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <section
        aria-labelledby="edit-note-heading"
        className="rounded-xl border border-neutral-200 p-6 shadow-sm sm:p-8 dark:border-neutral-800"
      >
        <h1 id="edit-note-heading" className="mb-6 text-2xl font-semibold tracking-tight">
          Edit note
        </h1>
        <NoteForm
          action={updateNoteAction.bind(null, note.id)}
          initialTitle={note.title}
          initialContent={JSON.parse(note.contentJson)}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          cancelHref={`/notes/${note.id}`}
        />
      </section>
    </main>
  );
}
