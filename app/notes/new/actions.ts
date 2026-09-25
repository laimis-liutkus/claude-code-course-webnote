'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { parseNoteForm, type NoteFormState } from '@/lib/note-form';
import { createNote, setNotePublic } from '@/lib/notes';

export async function createNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireUser();

  const parsed = parseNoteForm(formData);
  if (!parsed.success) return parsed.state;

  const { isPublic, ...content } = parsed.data;
  let noteId: string;
  try {
    const note = await createNote(user.id, content);
    noteId = note.id;
    if (isPublic) await setNotePublic(user.id, noteId, true);
  } catch (err) {
    console.error('Failed to create note', err);
    return { error: 'Could not save your note. Please try again.', values: parsed.values };
  }

  revalidatePath('/dashboard');
  redirect(`/notes/${noteId}`);
}
