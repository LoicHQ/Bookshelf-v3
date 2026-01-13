'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { Library, Loader2, BookOpen, BookCheck, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserBook, BookStatus } from '@/types';

type FilterStatus = 'ALL' | BookStatus;

const STATUS_FILTERS: { value: FilterStatus; label: string; icon: typeof Library; color: string }[] = [
  { value: 'ALL', label: 'Tous', icon: Library, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'TO_READ', label: 'À lire', icon: BookOpen, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
  { value: 'READING', label: 'En cours', icon: Clock, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { value: 'COMPLETED', label: 'Lu', icon: BookCheck, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { value: 'ABANDONED', label: 'Abandonné', icon: XCircle, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
];

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = useMemo(() => {
    if (selectedFilter === 'ALL') return books;
    return books.filter((book) => book.status === selectedFilter);
  }, [books, selectedFilter]);

  const stats = useMemo(() => {
    return {
      total: books.length,
      toRead: books.filter((b) => b.status === 'TO_READ').length,
      reading: books.filter((b) => b.status === 'READING').length,
      completed: books.filter((b) => b.status === 'COMPLETED').length,
      abandoned: books.filter((b) => b.status === 'ABANDONED').length,
    };
  }, [books]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6 pb-24">
        <div className="flex flex-col items-center gap-4 animate-spring-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-[17px] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 pb-24 safe-area-inset-top">
      {/* Header iOS-like */}
      <div className="mb-8 space-y-6 animate-spring-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight flex items-center gap-4">
              <div className="rounded-2xl bg-primary/10 p-3.5 shadow-ios-sm">
                <Library className="h-8 w-8 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Ma bibliothèque
              </span>
            </h1>
            <p className="text-muted-foreground text-[17px] leading-relaxed">
              {stats.total} livre{stats.total > 1 ? 's' : ''} dans votre bibliothèque
            </p>
          </div>
        </div>

        {/* Statistics Cards iOS-like */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="glass-card shadow-ios-sm border-border/40">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-[13px] text-muted-foreground font-semibold">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-ios-sm border-border/40">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.toRead}</p>
                  <p className="text-[13px] text-muted-foreground font-semibold">À lire</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-ios-sm border-border/40">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.reading}</p>
                  <p className="text-[13px] text-muted-foreground font-semibold">En cours</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-ios-sm border-border/40">
              <CardContent className="p-5">
                <div className="space-y-1.5">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  <p className="text-[13px] text-muted-foreground font-semibold">Lu</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Buttons iOS Segmented Control-like */}
        {stats.total > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {STATUS_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedFilter === filter.value;
              const count =
                filter.value === 'ALL'
                  ? stats.total
                  : books.filter((b) => b.status === filter.value).length;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={cn(
                    'flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[15px] font-semibold transition-ios whitespace-nowrap',
                    'active:scale-95',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-ios-sm'
                      : 'glass-card border border-border/40 text-foreground/70 hover:bg-card/80 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 transition-ios', isActive && 'scale-110')} />
                  <span>{filter.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-bold min-w-[24px] text-center',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {stats.total === 0 ? (
        <Card className="glass-card shadow-ios-lg border-border/40 animate-spring-in">
          <CardContent className="py-24 text-center space-y-6">
            <div className="mx-auto w-32 h-32 rounded-full bg-secondary/30 flex items-center justify-center shadow-ios-sm">
              <Library className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-foreground text-3xl font-bold">Votre bibliothèque est vide</p>
              <p className="text-muted-foreground text-[17px] leading-relaxed">
                Commencez à ajouter des livres pour créer votre collection personnelle
              </p>
            </div>
            <Button
              onClick={() => router.push('/add-book')}
              size="lg"
              className="mt-6 h-14 text-[17px] font-semibold shadow-ios-sm"
            >
              Ajouter votre premier livre
            </Button>
          </CardContent>
        </Card>
      ) : filteredBooks.length === 0 ? (
        <Card className="glass-card shadow-ios-lg border-border/40 animate-spring-in">
          <CardContent className="py-20 text-center space-y-4">
            <p className="text-foreground text-2xl font-bold">Aucun livre trouvé</p>
            <p className="text-muted-foreground text-[17px]">
              Aucun livre avec ce filtre dans votre bibliothèque
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedFilter('ALL')}
              className="mt-6 h-12 text-[15px] font-semibold glass-card border-border/40"
            >
              Voir tous les livres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
          {filteredBooks.map((userBook, index) => (
            <div
              key={userBook.id}
              className="animate-spring-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BookCard book={userBook} showStatus showRating />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
