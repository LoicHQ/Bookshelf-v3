/**
 * @agent frontend-ux-ui
 * Wrapper d'application avec navigation conditionnelle
 */
'use client';

import { usePathname } from 'next/navigation';
import { TabBar } from './TabBar';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <>
      <main className={hideNav ? '' : 'pb-20'}>{children}</main>
      {!hideNav && <TabBar />}
    </>
  );
}
