import 'server-only';
import { z } from 'zod';
import { DEFAULT_NOTE_TITLE, EMPTY_DOC_JSON } from '@/lib/notes';
import { plainTextSchema, sanitizeNoteContent } from '@/lib/sanitize';

export type NoteFormState = {
  error?: string;
  fieldErrors?: Partial<Record<'title' | 'contentJson', string[]>>;
  values?: { title?: string; contentJson?: string; isPublic?: boolean };
};

type NoteFormValues = { title: string; contentJson: string; isPublic: boolean };

type ParsedNoteForm =
  | { success: true; data: NoteFormValues; values: NoteFormValues }
  | { success: false; state: NoteFormState };

const MAX_CONTENT_BYTES = 500_000;

const noteFormSchema = z.object({
  title: plainTextSchema(200).transform((title) => title || DEFAULT_NOTE_TITLE),
  contentJson: z
    .string()
    .max(MAX_CONTENT_BYTES, 'Note content is too large')
    .transform((value, ctx) => {
      if (value === '') return EMPTY_DOC_JSON;
      try {
        return sanitizeNoteContent(JSON.parse(value));
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Note content is invalid' });
        return z.NEVER;
      }
    }),
  isPublic: z.boolean(),
});

// Shared validation for the create and edit note forms.
export function parseNoteForm(formData: FormData): ParsedNoteForm {
  const values = {
    title: String(formData.get('title') ?? ''),
    contentJson: String(formData.get('contentJson') ?? ''),
    isPublic: formData.get('isPublic') === 'on',
  };

  const parsed = noteFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      state: { fieldErrors: z.flattenError(parsed.error).fieldErrors, values },
    };
  }
  return { success: true, data: parsed.data, values };
}
