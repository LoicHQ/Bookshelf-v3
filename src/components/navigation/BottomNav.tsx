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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-3 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className={cn(isActive && 'font-semibold')}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
