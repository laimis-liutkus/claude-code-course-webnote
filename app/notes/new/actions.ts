"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createNote, EMPTY_DOC_JSON } from "@/lib/notes";

export type NewNoteFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"title" | "contentJson", string[]>>;
  values?: { title?: string; contentJson?: string };
};

const MAX_CONTENT_BYTES = 500_000;

const tiptapDocSchema = z.looseObject({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
});

const newNoteSchema = z.object({
  title: z.string().trim().max(200, "Title must be at most 200 characters"),
  contentJson: z
    .string()
    .max(MAX_CONTENT_BYTES, "Note content is too large")
    .transform((value, ctx) => {
      if (value === "") return EMPTY_DOC_JSON;
      try {
        const doc = tiptapDocSchema.parse(JSON.parse(value));
        return JSON.stringify(doc);
      } catch {
        ctx.addIssue({ code: "custom", message: "Note content is invalid" });
        return z.NEVER;
      }
    }),
});

export async function createNoteAction(
  _prev: NewNoteFormState,
  formData: FormData,
): Promise<NewNoteFormState> {
  const user = await requireUser();
  const values = {
    title: String(formData.get("title") ?? ""),
    contentJson: String(formData.get("contentJson") ?? ""),
  };

  const parsed = newNoteSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  let noteId: string;
  try {
    const note = await createNote(user.id, parsed.data);
    noteId = note.id;
  } catch (err) {
    console.error("Failed to create note", err);
    return { error: "Could not save your note. Please try again.", values };
  }

  redirect(`/notes/${noteId}`);
}
