import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, type JSX } from 'react';
import { z } from 'zod';
import { NoteRenderer } from '@/components/NoteRenderer';
import { formatDate, toIsoDate } from '@/lib/format';
import { getNoteByPublicSlug } from '@/lib/notes';

type Props = {
  params: Promise<{ slug: string }>;
};

const slugSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);

// Only the fields safe to show anonymously; never expose ids or owner data.
const loadPublicNote = cache(async (rawSlug: string) => {
  const slug = slugSchema.safeParse(rawSlug);
  if (!slug.success) notFound();

  const note = await getNoteByPublicSlug(slug.data);
  if (!note) notFound();
  return { title: note.title, contentJson: note.contentJson, updatedAt: note.updatedAt };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await loadPublicNote((await params).slug);
  return { title: note.title, robots: { index: false, follow: false } };
}

export default async function PublicNotePage({ params }: Props): Promise<JSX.Element> {
  const note = await loadPublicNote((await params).slug);

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-10'>
      <article className='rounded-xl border border-neutral-200 p-6 shadow-sm sm:p-8 dark:border-neutral-800'>
        <header className='mb-6 flex flex-col gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800'>
          <h1 className='text-3xl font-semibold tracking-tight break-words'>{note.title}</h1>
          <p className='text-sm text-neutral-600 dark:text-neutral-400'>
            Updated <time dateTime={toIsoDate(note.updatedAt)}>{formatDate(note.updatedAt)}</time>
          </p>
        </header>

        <NoteRenderer contentJson={note.contentJson} />
      </article>
    </main>
  );
}
