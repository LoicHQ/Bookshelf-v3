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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Background blur iOS style amélioré */}
      <div className="backdrop-blur-ios border-t border-border/40 shadow-ios-md">
        {/* Container avec safe area */}
        <div className="mx-auto flex max-w-screen-xl items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl',
                  'transition-all duration-300 ease-out',
                  'min-w-[70px]',
                  'active:scale-90',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-foreground'
                )}
              >
                {/* Indicateur actif iOS-like (badge) */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-spring-in" />
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
                    <div className="absolute inset-0 -z-10 bg-primary/20 rounded-full blur-md animate-pulse" />
                  )}
                </div>

                {/* Label avec animation */}
                <span
                  className={cn(
                    'text-[11px] font-medium transition-all duration-300 leading-tight',
                    isActive ? 'font-semibold scale-105' : 'font-medium'
                  )}
                >
                  {item.name}
                </span>

                {/* Background actif iOS-like */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 animate-spring-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
