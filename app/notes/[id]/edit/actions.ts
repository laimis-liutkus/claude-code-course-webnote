"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { parseNoteForm, type NoteFormState } from "@/lib/note-form";
import { updateNote, type Note } from "@/lib/notes";

export async function updateNoteAction(
  rawNoteId: string,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireUser();
  const noteId = z.uuid().safeParse(rawNoteId);
  if (!noteId.success) notFound();

  const parsed = parseNoteForm(formData);
  if (!parsed.success) return parsed.state;

  let note: Note | null;
  try {
    note = await updateNote(user.id, noteId.data, parsed.data);
  } catch (err) {
    console.error("Failed to update note", err);
    return { error: "Could not save your changes. Please try again.", values: parsed.values };
  }
  if (!note) notFound();

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  redirect(`/notes/${note.id}`);
}
