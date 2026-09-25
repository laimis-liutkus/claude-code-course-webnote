import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getNoteById, type Note } from '@/lib/notes';

// Loads a note owned by the current user or 404s.
// Deduplicated per request so generateMetadata and the page share one query.
export const loadOwnNote = cache(async (rawId: string): Promise<Note> => {
  const user = await requireUser();
  const parsedId = z.uuid().safeParse(rawId);
  if (!parsedId.success) notFound();

  const note = await getNoteById(user.id, parsedId.data);
  if (!note) notFound();
  return note;
});
