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
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  TO_READ: { label: 'À lire', variant: 'outline' },
  READING: { label: 'En cours', variant: 'default' },
  COMPLETED: { label: 'Lu', variant: 'secondary' },
  ABANDONED: { label: 'Abandonné', variant: 'outline' },
  ON_HOLD: { label: 'En pause', variant: 'outline' },
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
        'overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-5">
          {/* Cover Image */}
          <div className="bg-secondary relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={bookInfo.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="text-muted-foreground h-10 w-10" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight">
                {bookInfo.title}
              </h3>
              <p className="text-muted-foreground line-clamp-1 text-[15px]">{authors}</p>
            </div>

            {/* Status Badge */}
            {showStatus && userBookData && (
              <div>
                <Badge variant={STATUS_LABELS[userBookData.status]?.variant || 'outline'}>
                  {STATUS_LABELS[userBookData.status]?.label || userBookData.status}
                </Badge>
              </div>
            )}

            {/* Rating */}
            {showRating && userBookData?.rating && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4 transition-colors',
                      star <= userBookData.rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Categories */}
            {bookInfo.categories && bookInfo.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bookInfo.categories.slice(0, 2).map((category: string) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="px-2 py-0.5 text-[11px] font-medium"
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
