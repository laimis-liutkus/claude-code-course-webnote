"use client";

import type { JSONContent } from "@tiptap/react";
import { useActionState, useState, type JSX } from "react";
import { NoteEditor } from "@/components/NoteEditor";
import { createNoteAction, type NewNoteFormState } from "./actions";

const initialState: NewNoteFormState = {};

export function NewNoteForm(): JSX.Element {
  const [state, formAction, isPending] = useActionState(createNoteAction, initialState);
  const [contentJson, setContentJson] = useState("");

  const titleError = state.fieldErrors?.title?.[0];
  const contentError = state.fieldErrors?.contentJson?.[0];

  function handleContentChange(json: JSONContent) {
    setContentJson(JSON.stringify(json));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Untitled note"
          defaultValue={state.values?.title}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "title-error" : undefined}
          className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-base outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/20 aria-invalid:border-red-600 dark:border-neutral-700 dark:focus-visible:border-neutral-100 dark:focus-visible:ring-neutral-100/20"
        />
        {titleError && (
          <p id="title-error" className="text-sm text-red-600 dark:text-red-400">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="content-label" className="text-sm font-medium">
          Content
        </span>
        <NoteEditor
          onChange={handleContentChange}
          labelledBy="content-label"
          describedBy={contentError ? "content-error" : undefined}
        />
        <input type="hidden" name="contentJson" value={contentJson} />
        {contentError && (
          <p id="content-error" className="text-sm text-red-600 dark:text-red-400">
            {contentError}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 dark:focus-visible:outline-neutral-100"
        >
          {isPending ? "Creating…" : "Create note"}
        </button>
      </div>
    </form>
  );
}
