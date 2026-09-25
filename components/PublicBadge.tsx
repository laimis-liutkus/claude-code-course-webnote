import type { JSX } from 'react';

export function PublicBadge(): JSX.Element {
  return (
    <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'>
      Public
    </span>
  );
}
