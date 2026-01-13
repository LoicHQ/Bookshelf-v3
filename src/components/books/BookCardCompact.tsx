/**
 * @agent frontend-ux-ui
 * Composant de carte livre minimaliste pour affichage en bibliothèque
 * Affiche uniquement : couverture + titre + auteur
 */
'use client';

import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserBook, Book } from '@/types';

interface BookCardCompactProps {
  book: UserBook & { book?: Book };
  onClick?: () => void;
}

export function BookCardCompact({ book, onClick }: BookCardCompactProps) {
  const bookData = book.book;

  if (!bookData) return null;

  const coverImage = bookData.coverImage || bookData.thumbnail;
  const author = bookData.authors?.[0] || bookData.author || 'Auteur inconnu';

  return (
    <button onClick={onClick} className={cn('group w-full text-left', onClick && 'cursor-pointer')}>
      <div className="space-y-2">
        {/* Couverture */}
        <div className="bg-secondary/50 shadow-ios-sm border-border/30 group-hover:shadow-ios-md relative aspect-[2/3] w-full overflow-hidden rounded-xl border transition-all group-active:scale-[0.97]">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={bookData.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="from-secondary to-secondary/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <BookOpen className="text-muted-foreground/30 h-10 w-10" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-0.5 px-1">
          <h3 className="line-clamp-2 text-sm leading-tight font-semibold tracking-tight">
            {bookData.title}
          </h3>
          <p className="text-muted-foreground line-clamp-1 text-xs">{author}</p>
        </div>
      </div>
    </button>
  );
}
