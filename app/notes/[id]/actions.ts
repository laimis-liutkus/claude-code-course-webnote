"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { deleteNote } from "@/lib/notes";

export async function deleteNoteAction(rawNoteId: string): Promise<void> {
  const user = await requireUser();
  const noteId = z.uuid().safeParse(rawNoteId);
  if (!noteId.success) notFound();

  await deleteNote(user.id, noteId.data);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
