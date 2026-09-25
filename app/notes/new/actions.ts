'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { parseNoteForm, type NoteFormState } from '@/lib/note-form';
import { createNote } from '@/lib/notes';

export async function createNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireUser();

  const parsed = parseNoteForm(formData);
  if (!parsed.success) return parsed.state;

  let noteId: string;
  try {
    const note = await createNote(user.id, parsed.data);
    noteId = note.id;
  } catch (err) {
    console.error('Failed to create note', err);
    return { error: 'Could not save your note. Please try again.', values: parsed.values };
  }

  redirect(`/notes/${noteId}`);
}
