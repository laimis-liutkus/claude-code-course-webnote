import 'server-only';
import { get, query, run } from '@/lib/db';

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string; // stringified TipTap doc
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_NOTE_TITLE = 'Untitled note';
export const EMPTY_DOC_JSON = JSON.stringify({ type: 'doc', content: [] });

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getNoteById(userId: string, noteId: string): Promise<Note | null> {
  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  return row ? toNote(row) : null;
}

export async function createNote(
  userId: string,
  data: { title?: string; contentJson?: string },
): Promise<Note> {
  const id = crypto.randomUUID();
  run('INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)', [
    id,
    userId,
    data.title || DEFAULT_NOTE_TITLE,
    data.contentJson ?? EMPTY_DOC_JSON,
  ]);

  const note = await getNoteById(userId, id);
  if (!note) throw new Error(`Failed to load newly created note ${id}`);
  return note;
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const rows = query<NoteRow>(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC',
    [userId],
  );
  return rows.map(toNote);
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>,
): Promise<Note | null> {
  run(
    `UPDATE notes
     SET title = COALESCE(?, title), content_json = COALESCE(?, content_json), updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    [data.title ?? null, data.contentJson ?? null, noteId, userId],
  );
  return getNoteById(userId, noteId);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
}

// 16 random bytes → 22 URL-safe chars; unguessable, so public links can't be enumerated.
function generatePublicSlug(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url');
}

// Enabling keeps an existing slug; disabling clears it so the old link stops working.
export async function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean,
): Promise<Note | null> {
  run(
    `UPDATE notes
     SET is_public = ?, public_slug = CASE WHEN ? THEN COALESCE(public_slug, ?) ELSE NULL END
     WHERE id = ? AND user_id = ?`,
    [isPublic ? 1 : 0, isPublic ? 1 : 0, generatePublicSlug(), noteId, userId],
  );
  return getNoteById(userId, noteId);
}

export async function getNoteByPublicSlug(slug: string): Promise<Note | null> {
  const row = get<NoteRow>('SELECT * FROM notes WHERE public_slug = ? AND is_public = 1', [slug]);
  return row ? toNote(row) : null;
}
