import Link from 'next/link';
import type { JSX } from 'react';
import { getCurrentUser } from '@/lib/auth';

const PRIMARY_LINK_CLASSES =
  'rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 dark:focus-visible:outline-neutral-100';

const SECONDARY_LINK_CLASSES =
  'rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:border-neutral-700 dark:hover:bg-neutral-900 dark:focus-visible:outline-neutral-100';

export default async function Home(): Promise<JSX.Element> {
  const user = await getCurrentUser();

  return (
    <main className='flex flex-1 items-center justify-center px-4 py-16'>
      <section
        aria-labelledby='hero-heading'
        className='flex max-w-xl flex-col items-center gap-6 text-center'
      >
        <h1 id='hero-heading' className='text-4xl font-semibold tracking-tight text-balance'>
          Write rich notes. Share them with a link.
        </h1>
        <p className='text-lg text-pretty text-neutral-600 dark:text-neutral-400'>
          Headings, lists, code blocks and more. Keep notes private, or publish a read-only link
          anyone can open.
        </p>
        <div className='flex flex-wrap justify-center gap-3'>
          {user ? (
            <Link href='/dashboard' className={PRIMARY_LINK_CLASSES}>
              Go to your notes
            </Link>
          ) : (
            <>
              <Link href='/authenticate?mode=sign-up' className={PRIMARY_LINK_CLASSES}>
                Sign up
              </Link>
              <Link href='/authenticate' className={SECONDARY_LINK_CLASSES}>
                Log in
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
