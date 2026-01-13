'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BookMarked, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserBook, BookStatus } from '@/types';

interface BookGridProps {
  books: UserBook[];
  viewMode: 'grid' | 'list';
}

const STATUS_CONFIG: Record<BookStatus, { label: string; className: string }> = {
  TO_READ: { label: 'À lire', className: 'bg-muted text-muted-foreground' },
  READING: { label: 'En cours', className: 'bg-warning/20 text-warning' },
  COMPLETED: { label: 'Lu', className: 'bg-success/20 text-success' },
  ABANDONED: { label: 'Abandonné', className: 'bg-destructive/20 text-destructive' },
  ON_HOLD: { label: 'En pause', className: 'bg-info/20 text-info' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export function BookGrid({ books, viewMode }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookMarked className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Aucun livre trouvé</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3"
      >
        {books.map((userBook) => (
          <motion.div key={userBook.id} variants={item}>
            <Link href={`/book/${userBook.id}`}>
              <div className="group relative">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-sm group-active:scale-95 transition-transform">
                  {userBook.book?.coverImage || userBook.book?.thumbnail ? (
                    <Image
                      src={userBook.book.coverImage || userBook.book.thumbnail || ''}
                      alt={userBook.book?.title || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookMarked className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status badge overlay */}
                  <div className="absolute top-1.5 right-1.5">
                    <div 
                      className={cn(
                        'w-2 h-2 rounded-full',
                        userBook.status === 'READING' && 'bg-warning',
                        userBook.status === 'COMPLETED' && 'bg-success',
                        userBook.status === 'TO_READ' && 'bg-muted-foreground',
                        userBook.status === 'ABANDONED' && 'bg-destructive',
                        userBook.status === 'ON_HOLD' && 'bg-info'
                      )}
                    />
                  </div>

                  {/* Favorite badge */}
                  {userBook.favorite && (
                    <div className="absolute top-1.5 left-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium mt-2 line-clamp-2 leading-tight">
                  {userBook.book?.title}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {books.map((userBook) => (
        <motion.div key={userBook.id} variants={item}>
          <Link href={`/book/${userBook.id}`}>
            <div className="flex gap-4 p-4 bg-card rounded-2xl shadow-sm active:bg-secondary/50 transition-colors">
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {userBook.book?.coverImage || userBook.book?.thumbnail ? (
                  <Image
                    src={userBook.book.coverImage || userBook.book.thumbnail || ''}
                    alt={userBook.book?.title || ''}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookMarked className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-1 text-[15px]">
                    {userBook.book?.title}
                  </h3>
                  {userBook.favorite && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {userBook.book?.authors?.join(', ')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="secondary"
                    className={cn('text-xs', STATUS_CONFIG[userBook.status].className)}
                  >
                    {STATUS_CONFIG[userBook.status].label}
                  </Badge>
                  {userBook.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{userBook.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
