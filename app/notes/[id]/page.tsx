import type { JSX } from "react";
import { requireUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoteEditorPage({ params }: Props): Promise<JSX.Element> {
  await requireUser();
  const { id } = await params;

  return <div>Note editor for {id} (placeholder)</div>;
}
