'use client';

import { SessionProvider } from './SessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export { SessionProvider } from './SessionProvider';
