import { notFound } from "next/navigation";
import type { JSX } from "react";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoteEditorPage({ params }: Props): Promise<JSX.Element> {
  await requireUser();
  const parsedId = z.uuid().safeParse((await params).id);
  if (!parsedId.success) notFound();
  const id = parsedId.data;

  return <div>Note editor for {id} (placeholder)</div>;
}
