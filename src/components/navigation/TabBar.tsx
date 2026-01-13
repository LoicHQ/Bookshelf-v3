'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Library, BarChart3, User, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  name: string;
  href: string;
  icon: typeof Home;
}

const tabs: TabItem[] = [
  { name: 'Accueil', href: '/dashboard', icon: Home },
  { name: 'Bibliothèque', href: '/library', icon: Library },
  { name: 'Scanner', href: '/scanner', icon: Scan },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Profil', href: '/profile', icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  // Ne pas afficher sur les pages de login/register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="tab-bar">
      <div className="tab-bar-content">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const isScanner = tab.href === '/scanner';
          const Icon = tab.icon;

          if (isScanner) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="tab-item-scanner"
              >
                <motion.div
                  className="tab-item-scanner-button"
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn('tab-item', isActive && 'active')}
            >
              <motion.div
                className="flex flex-col items-center gap-0.5"
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
              >
                <Icon 
                  className={cn(
                    'tab-item-icon transition-all duration-200',
                    isActive && 'scale-110'
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  'tab-item-label',
                  isActive && 'font-semibold'
                )}>
                  {tab.name}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
