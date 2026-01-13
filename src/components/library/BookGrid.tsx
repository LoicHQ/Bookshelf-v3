'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BookMarked, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserBook, BookStatus } from '@/types';

interface BookGridProps {
  books: UserBook[];
  viewMode: 'grid' | 'list';
  onDelete?: (userBookId: string) => void;
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
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function BookGrid({ books, viewMode, onDelete }: BookGridProps) {
  // Helper pour obtenir l'URL de la couverture en priorité
  const getCoverImageUrl = (userBook: UserBook): string | null => {
    try {
      // 1. Prioriser les images utilisateur si disponibles
      if (
        userBook.userBookImages &&
        Array.isArray(userBook.userBookImages) &&
        userBook.userBookImages.length > 0
      ) {
        const firstImage = userBook.userBookImages[0];
        if (firstImage && firstImage.imageUrl) {
          return firstImage.imageUrl;
        }
      }
      // 2. Sinon utiliser Book.coverImage ou Book.thumbnail
      if (userBook.book?.coverImage) {
        return userBook.book.coverImage;
      }
      if (userBook.book?.thumbnail) {
        return userBook.book.thumbnail;
      }
    } catch (error) {
      console.error('Error getting cover image URL:', error);
      // Fallback sur Book.coverImage ou Book.thumbnail
      if (userBook.book?.coverImage) {
        return userBook.book.coverImage;
      }
      if (userBook.book?.thumbnail) {
        return userBook.book.thumbnail;
      }
    }
    return null;
  };

  const handleDelete = async (e: React.MouseEvent, userBookId: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookGrid.tsx:40',
        message: 'handleDelete called',
        data: { userBookId, hasOnDelete: !!onDelete },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    e.preventDefault();
    e.stopPropagation();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookGrid.tsx:45',
        message: 'Before confirm dialog',
        data: { userBookId },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    if (!confirm('Supprimer ce livre de votre bibliothèque ?')) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'BookGrid.tsx:48',
          message: 'User cancelled deletion',
          data: { userBookId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B',
        }),
      }).catch(() => {});
      // #endregion
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookGrid.tsx:52',
        message: 'Before API call',
        data: { userBookId, url: `/api/books/${userBookId}` },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    try {
      const response = await fetch(`/api/books/${userBookId}`, {
        method: 'DELETE',
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'BookGrid.tsx:58',
          message: 'API response received',
          data: { userBookId, status: response.status, ok: response.ok },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B',
        }),
      }).catch(() => {});
      // #endregion

      if (response.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'BookGrid.tsx:61',
            message: 'Before calling onDelete',
            data: { userBookId, hasOnDelete: !!onDelete },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }).catch(() => {});
        // #endregion
        onDelete?.(userBookId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'BookGrid.tsx:63',
            message: 'After calling onDelete',
            data: { userBookId },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }).catch(() => {});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'BookGrid.tsx:65',
            message: 'API error',
            data: { userBookId, status: response.status },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        }).catch(() => {});
        // #endregion
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'BookGrid.tsx:68',
          message: 'Exception in handleDelete',
          data: { userBookId, error: String(error) },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B',
        }),
      }).catch(() => {});
      // #endregion
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (books.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookMarked className="text-muted-foreground/30 mx-auto mb-4 h-16 w-16" />
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
                <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-xl shadow-sm transition-transform group-active:scale-95">
                  {getCoverImageUrl(userBook) ? (
                    <Image
                      src={getCoverImageUrl(userBook) || ''}
                      alt={userBook.book?.title || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookMarked className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}

                  {/* Status badge overlay */}
                  <div className="absolute top-1.5 right-1.5">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
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

                  {/* Delete button - visible on hover */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 bottom-2 z-10 h-8 w-8 rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          location: 'BookGrid.tsx:125',
                          message: 'Delete button clicked (grid)',
                          data: { userBookId: userBook.id },
                          timestamp: Date.now(),
                          sessionId: 'debug-session',
                          runId: 'run1',
                          hypothesisId: 'A',
                        }),
                      }).catch(() => {});
                      // #endregion
                      handleDelete(e, userBook.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-tight font-medium">
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {books.map((userBook) => (
        <motion.div key={userBook.id} variants={item}>
          <Link href={`/book/${userBook.id}`}>
            <div className="group bg-card active:bg-secondary/50 flex gap-4 rounded-2xl p-4 shadow-sm transition-colors">
              <div className="bg-muted relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                {getCoverImageUrl(userBook) ? (
                  <Image
                    src={getCoverImageUrl(userBook) || ''}
                    alt={userBook.book?.title || ''}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookMarked className="text-muted-foreground h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-[15px] font-semibold">{userBook.book?.title}</h3>
                  <div className="flex items-center gap-2">
                    {userBook.favorite && (
                      <Star className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                    )}
                    {/* Delete button - visible on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 z-10 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            location: 'BookGrid.tsx:182',
                            message: 'Delete button clicked (list)',
                            data: { userBookId: userBook.id },
                            timestamp: Date.now(),
                            sessionId: 'debug-session',
                            runId: 'run1',
                            hypothesisId: 'A',
                          }),
                        }).catch(() => {});
                        // #endregion
                        handleDelete(e, userBook.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {userBook.book?.authors?.join(', ')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', STATUS_CONFIG[userBook.status].className)}
                  >
                    {STATUS_CONFIG[userBook.status].label}
                  </Badge>
                  {userBook.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground text-xs">{userBook.rating}</span>
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
