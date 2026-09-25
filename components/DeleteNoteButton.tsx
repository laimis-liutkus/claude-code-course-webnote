"use client";

import { useId, useRef, type JSX } from "react";
import { useFormStatus } from "react-dom";
import { deleteNoteAction } from "@/app/notes/[id]/actions";

type DeleteNoteButtonProps = {
  noteId: string;
  noteTitle: string;
};

const DANGER_BUTTON_CLASSES =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-colors";

function ConfirmDeleteButton(): JSX.Element {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={DANGER_BUTTON_CLASSES}>
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteNoteButton({ noteId, noteTitle }: DeleteNoteButtonProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const deleteThisNote = deleteNoteAction.bind(null, noteId);

  function handleOpen() {
    dialogRef.current?.showModal();
  }

  function handleCancel() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={handleOpen} aria-haspopup="dialog" className={DANGER_BUTTON_CLASSES}>
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className="m-auto w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-lg backdrop:bg-neutral-900/50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
      >
        <h2 id={headingId} className="text-lg font-semibold">
          Delete note?
        </h2>
        <p className="mt-2 text-sm break-words text-neutral-600 dark:text-neutral-400">
          “{noteTitle}” will be permanently deleted. This cannot be undone.
        </p>
        <form action={deleteThisNote} className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            autoFocus
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100"
          >
            Cancel
          </button>
          <ConfirmDeleteButton />
        </form>
      </dialog>
    </>
  );
}
