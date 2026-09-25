import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { z } from 'zod';
import { noteExtensions } from '@/lib/editor-extensions';

// Every write path for user text (create/update note, auth) must go through these helpers.

const MAX_CONTENT_DEPTH = 50;
const HEADING_LEVELS = new Set([1, 2, 3]);
const CODE_LANGUAGE_PATTERN = /^[a-z0-9+#-]{1,32}$/i;
// Control chars plus zero-width / bidi-override chars that enable spoofing.
const UNSAFE_CHARS = /[\p{Cc}​-‏‪-‮⁦-⁩﻿]/gu;

const noteSchema = getSchema(noteExtensions);

type JsonNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
};

export function sanitizePlainText(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').replace(UNSAFE_CHARS, '').trim();
}

export function plainTextSchema(max: number) {
  return z
    .string()
    .transform(sanitizePlainText)
    .pipe(z.string().max(max, `Must be at most ${max} characters`));
}

function assertDepth(value: unknown, depth = 0): void {
  if (depth > MAX_CONTENT_DEPTH) throw new Error('Note content is nested too deeply');
  if (typeof value !== 'object' || value === null) return;
  const content = (value as { content?: unknown }).content;
  if (Array.isArray(content)) content.forEach((child) => assertDepth(child, depth + 1));
}

function normalizeAttrs(node: JsonNode): void {
  if (node.type === 'heading' && !HEADING_LEVELS.has(Number(node.attrs?.level))) {
    node.attrs = { ...node.attrs, level: 1 };
  }
  if (node.type === 'codeBlock' && node.attrs) {
    const language = node.attrs.language;
    if (typeof language !== 'string' || !CODE_LANGUAGE_PATTERN.test(language)) {
      node.attrs.language = null;
    }
  }
  node.content?.forEach(normalizeAttrs);
}

// Parses TipTap JSON against the editor schema and returns a canonical string.
// Throws on unknown nodes/marks or invalid structure; unknown attrs are dropped.
export function sanitizeNoteContent(json: unknown): string {
  assertDepth(json);
  const node = Node.fromJSON(noteSchema, json);
  node.check();
  if (node.type.name !== 'doc') throw new Error('Note content must be a doc');

  const doc = node.toJSON() as JsonNode;
  normalizeAttrs(doc);
  return JSON.stringify(doc);
}
