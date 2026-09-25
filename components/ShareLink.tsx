'use client';

import { useState, type FocusEvent, type JSX } from 'react';

type ShareLinkProps = {
  url: string;
};

export function ShareLink({ url }: ShareLinkProps): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    event.currentTarget.select();
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor='public-link' className='text-sm font-medium'>
        Public link
      </label>
      <div className='flex gap-2'>
        <input
          id='public-link'
          type='url'
          readOnly
          value={url}
          onFocus={handleFocus}
          className='min-w-0 flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:border-neutral-100 dark:focus-visible:ring-neutral-100/20'
        />
        <button
          type='button'
          onClick={handleCopy}
          className='shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-safe:transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100'
        >
          Copy
        </button>
      </div>
      <p role='status' className='min-h-5 text-sm text-neutral-600 dark:text-neutral-400'>
        {status === 'copied' && 'Link copied to clipboard.'}
        {status === 'failed' && 'Could not copy. Select the link and copy it manually.'}
      </p>
    </div>
  );
}
