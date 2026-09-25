import Link from 'next/link';
import type { JSX } from 'react';
import { signOutAction } from '@/app/authenticate/actions';
import { getCurrentUser } from '@/lib/auth';

export async function Header(): Promise<JSX.Element> {
  const user = await getCurrentUser();

  return (
    <header className='border-b border-neutral-200 dark:border-neutral-800'>
      <nav
        aria-label='Main'
        className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3'
      >
        <Link
          href='/dashboard'
          className='rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-neutral-100'
        >
          Next<span className='text-neutral-500'>Notes</span>
        </Link>

        {user && (
          <form action={signOutAction}>
            <button
              type='submit'
              className='rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:border-neutral-700 dark:hover:bg-neutral-900 dark:focus-visible:outline-neutral-100'
            >
              Log out
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
