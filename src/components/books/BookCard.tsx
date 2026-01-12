'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen } from 'lucide-react';
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
  // DÃ©terminer si c'est un UserBook ou un BookSearchResult
  const isUserBook = 'status' in book;
  const userBookData = isUserBook ? (book as UserBook & { book?: BookSearchResult | Book }) : null;

  // Extraire les donnÃ©es du livre
  let bookData: BookSearchResult | Book | undefined;
  if (isUserBook && userBookData?.book) {
    bookData = userBookData.book;
  } else if (!isUserBook) {
    bookData = book as BookSearchResult;
  }

  // Si pas de donnÃ©es de livre, ne rien afficher
  if (!bookData) {
    return null;
  }

  // Convertir Book en BookSearchResult si nÃ©cessaire
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
      className={`overflow-hidden transition-all hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Cover Image */}
          <div className="bg-muted relative h-28 w-20 flex-shrink-0 overflow-hidden rounded">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={bookInfo.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="text-muted-foreground h-8 w-8" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold">{bookInfo.title}</h3>
            <p className="text-muted-foreground line-clamp-1 text-xs">{authors}</p>

            {/* Status Badge */}
            {showStatus && userBookData && (
              <Badge variant={STATUS_LABELS[userBookData.status]?.variant || 'outline'}>
                {STATUS_LABELS[userBookData.status]?.label || userBookData.status}
              </Badge>
            )}

            {/* Rating */}
            {showRating && userBookData?.rating && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= userBookData.rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Categories */}
            {bookInfo.categories && bookInfo.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {bookInfo.categories.slice(0, 2).map((category: string) => (
                  <Badge key={category} variant="outline" className="px-1.5 py-0 text-xs">
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
