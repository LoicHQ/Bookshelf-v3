'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Accueil',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Bibliothèque',
    href: '/library',
    icon: Library,
  },
  {
    name: 'Ajouter',
    href: '/add-book',
    icon: Plus,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Background blur iOS style */}
      <div className="backdrop-blur-ios border-t border-border/50">
        {/* Safe area for iOS notch */}
        <div className="mx-auto flex max-w-screen-xl items-center justify-around py-2 safe-area-inset-bottom">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-2xl transition-all duration-200 active:scale-95',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground active:bg-accent/50'
                )}
              >
                <Icon className={cn('h-6 w-6 transition-all', isActive && 'scale-110')} />
                <span className={cn('text-[13px] font-medium', isActive && 'font-semibold')}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
