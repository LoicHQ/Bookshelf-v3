/**
 * @agent frontend-ux-ui
 * Navigation bottom bar iOS-like avec glassmorphism et animations
 */
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
    <nav className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50">
      {/* Background blur iOS style amélioré */}
      <div className="backdrop-blur-ios border-border/40 shadow-ios-md border-t">
        {/* Container avec safe area */}
        <div className="safe-area-inset-bottom mx-auto flex max-w-screen-xl items-center justify-around px-2 py-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5',
                  'transition-all duration-300 ease-out',
                  'min-w-[70px]',
                  'active:scale-90',
                  isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground'
                )}
              >
                {/* Indicateur actif iOS-like (badge) */}
                {isActive && (
                  <div className="bg-primary animate-spring-in absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
                )}

                {/* Icône avec animation */}
                <div
                  className={cn(
                    'relative transition-all duration-300',
                    isActive ? 'scale-110' : 'scale-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-all duration-300',
                      isActive && 'drop-shadow-sm'
                    )}
                  />
                  {/* Halo effect pour l'icône active */}
                  {isActive && (
                    <div className="bg-primary/20 absolute inset-0 -z-10 animate-pulse rounded-full blur-md" />
                  )}
                </div>

                {/* Label avec animation */}
                <span
                  className={cn(
                    'text-[11px] leading-tight font-medium transition-all duration-300',
                    isActive ? 'scale-105 font-semibold' : 'font-medium'
                  )}
                >
                  {item.name}
                </span>

                {/* Background actif iOS-like */}
                {isActive && (
                  <div className="bg-primary/10 animate-spring-in absolute inset-0 -z-10 rounded-2xl" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
