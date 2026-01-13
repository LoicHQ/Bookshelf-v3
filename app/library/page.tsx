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
  { value: 'ALL', label: 'Tous', icon: Library, color: 'bg-blue-500/10 text-blue-500' },
  { value: 'TO_READ', label: 'À lire', icon: BookOpen, color: 'bg-gray-500/10 text-gray-500' },
  { value: 'READING', label: 'En cours', icon: Clock, color: 'bg-orange-500/10 text-orange-500' },
  { value: 'COMPLETED', label: 'Lu', icon: BookCheck, color: 'bg-green-500/10 text-green-500' },
  { value: 'ABANDONED', label: 'Abandonné', icon: XCircle, color: 'bg-red-500/10 text-red-500' },
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-[15px]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 pb-24">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Library className="h-8 w-8 text-primary" />
              </div>
              Ma bibliothèque
            </h1>
            <p className="text-muted-foreground text-lg">
              {stats.total} livre{stats.total > 1 ? 's' : ''} dans votre bibliothèque
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-500">{stats.toRead}</p>
                  <p className="text-xs text-muted-foreground font-medium">À lire</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-orange-500">{stats.reading}</p>
                  <p className="text-xs text-muted-foreground font-medium">En cours</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground font-medium">Lu</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Buttons */}
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
                    'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[15px] font-medium transition-all duration-200 whitespace-nowrap',
                    'active:scale-95',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card/50 border border-border/50 text-foreground/70 hover:bg-card hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filter.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
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
        <Card className="shadow-lg border-border/50">
          <CardContent className="py-20 text-center space-y-6">
            <div className="mx-auto w-28 h-28 rounded-full bg-secondary/50 flex items-center justify-center">
              <Library className="h-14 w-14 text-muted-foreground/50" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-foreground text-2xl font-bold">Votre bibliothèque est vide</p>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Commencez à ajouter des livres pour créer votre collection personnelle
              </p>
            </div>
            <Button onClick={() => router.push('/add-book')} size="lg" className="mt-4">
              Ajouter votre premier livre
            </Button>
          </CardContent>
        </Card>
      ) : filteredBooks.length === 0 ? (
        <Card className="shadow-lg border-border/50">
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-foreground text-xl font-semibold">Aucun livre trouvé</p>
            <p className="text-muted-foreground text-[15px]">
              Aucun livre avec ce filtre dans votre bibliothèque
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedFilter('ALL')}
              className="mt-4"
            >
              Voir tous les livres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
          {filteredBooks.map((userBook) => (
            <BookCard key={userBook.id} book={userBook} showStatus showRating />
          ))}
        </div>
      )}
    </div>
  );
}
