import "server-only";
import { get, run } from "@/lib/db";

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

export const DEFAULT_NOTE_TITLE = "Untitled note";
export const EMPTY_DOC_JSON = JSON.stringify({ type: "doc", content: [] });

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
  const row = get<NoteRow>("SELECT * FROM notes WHERE id = ? AND user_id = ?", [noteId, userId]);
  return row ? toNote(row) : null;
}

export async function createNote(
  userId: string,
  data: { title?: string; contentJson?: string },
): Promise<Note> {
  const id = crypto.randomUUID();
  run("INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)", [
    id,
    userId,
    data.title || DEFAULT_NOTE_TITLE,
    data.contentJson ?? EMPTY_DOC_JSON,
  ]);

  const note = await getNoteById(userId, id);
  if (!note) throw new Error(`Failed to load newly created note ${id}`);
  return note;
}
