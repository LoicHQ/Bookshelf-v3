/**
 * @agent frontend-ux-ui
 * Composant de carte livre avec design iOS-like
 * Affiche les informations du livre avec statut, note et catégories
 */
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookSearchResult, UserBook, Book } from '@/types';

interface BookCardProps {
  book: BookSearchResult | (UserBook & { book?: BookSearchResult | Book });
  onClick?: () => void;
  showRating?: boolean;
  showStatus?: boolean;
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline'; color: string }
> = {
  TO_READ: {
    label: 'À lire',
    variant: 'outline',
    color:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
  },
  READING: {
    label: 'En cours',
    variant: 'default',
    color:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
  },
  COMPLETED: {
    label: 'Lu',
    variant: 'secondary',
    color:
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30',
  },
  ABANDONED: {
    label: 'Abandonné',
    variant: 'outline',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30',
  },
  ON_HOLD: {
    label: 'En pause',
    variant: 'outline',
    color:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900/30',
  },
};

export function BookCard({ book, onClick, showRating = true, showStatus = true }: BookCardProps) {
  const isUserBook = 'status' in book;
  const userBookData = isUserBook ? (book as UserBook & { book?: BookSearchResult | Book }) : null;

  let bookData: BookSearchResult | Book | undefined;
  if (isUserBook && userBookData?.book) {
    bookData = userBookData.book;
  } else if (!isUserBook) {
    bookData = book as BookSearchResult;
  }

  if (!bookData) {
    return null;
  }

  const bookInfo: BookSearchResult =
    'author' in bookData
      ? {
          id: bookData.id,
          title: bookData.title,
          authors: bookData.authors,
          description: bookData.description || undefined,
          coverImage: bookData.coverImage || undefined,
          thumbnail: bookData.thumbnail || undefined,
          publishedDate: bookData.publishedDate || undefined,
          publisher: bookData.publisher || undefined,
          pageCount: bookData.pageCount || undefined,
          categories: bookData.categories,
          isbn: bookData.isbn || undefined,
          isbn13: bookData.isbn13 || undefined,
        }
      : bookData;

  const coverImage = bookInfo.coverImage || bookInfo.thumbnail;
  const authors =
    Array.isArray(bookInfo.authors) && bookInfo.authors.length > 0
      ? bookInfo.authors.join(', ')
      : 'Auteur inconnu';

  return (
    <Card
      className={cn(
        'transition-ios glass-card shadow-ios-sm overflow-hidden',
        onClick && 'hover:shadow-ios-md cursor-pointer active:scale-[0.97]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-5">
          {/* Cover Image iOS-like */}
          <div className="bg-secondary/50 shadow-ios-sm border-border/30 relative h-36 w-28 flex-shrink-0 overflow-hidden rounded-2xl border">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={bookInfo.title}
                fill
                className="transition-ios object-cover"
                sizes="112px"
              />
            ) : (
              <div className="from-secondary to-secondary/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                <BookOpen className="text-muted-foreground/50 h-12 w-12" />
              </div>
            )}
            {/* Overlay gradient iOS-like */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          </div>

          {/* Book Info */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-[18px] leading-tight font-bold tracking-tight">
                {bookInfo.title}
              </h3>
              <p className="text-muted-foreground line-clamp-1 text-[15px] font-medium">
                {authors}
              </p>
            </div>

            {/* Status Badge iOS-like */}
            {showStatus && userBookData && (
              <div>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full border px-3 py-1 text-[12px] font-semibold',
                    STATUS_LABELS[userBookData.status]?.color || ''
                  )}
                >
                  {STATUS_LABELS[userBookData.status]?.label || userBookData.status}
                </Badge>
              </div>
            )}

            {/* Rating iOS-like */}
            {showRating && userBookData?.rating && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      star <= userBookData.rating!
                        ? 'fill-yellow-500 text-yellow-500 drop-shadow-sm'
                        : 'text-muted-foreground/20'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Categories iOS-like */}
            {bookInfo.categories && bookInfo.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {bookInfo.categories.slice(0, 2).map((category: string) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="bg-secondary/30 border-border/40 text-muted-foreground rounded-full px-2.5 py-1 text-[11px] font-medium"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BookCard;
