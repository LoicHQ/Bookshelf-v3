'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = pathname !== '/login';

  return (
    <>
      <div className={showBottomNav ? 'pb-24' : ''}>{children}</div>
      {showBottomNav && <BottomNav />}
    </>
  );
}
