'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">404</h1>
      <p className="text-muted-foreground text-sm sm:text-base mt-2 mb-6">Page not found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all shadow-xs"
      >
        Return Home
      </Link>
    </div>
  );
}
