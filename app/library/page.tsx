'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Heart, BookMarked, Plus, FolderPlus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SearchBar, BookGrid } from '@/components/library';
import { cn } from '@/lib/utils';
import type { UserBook, BookStatus, Collection } from '@/types';

type FilterStatus = 'ALL' | BookStatus;
type TabValue = 'all' | 'collections' | 'wishlist';

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'TO_READ', label: 'À lire' },
  { value: 'READING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Lu' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'ABANDONED', label: 'Abandonné' },
];

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  useEffect(() => {
    const filter = searchParams.get('filter') as BookStatus | null;
    const tab = searchParams.get('tab') as TabValue | null;
    if (filter && STATUS_FILTERS.some((f) => f.value === filter)) setSelectedFilter(filter);
    if (tab && ['all', 'collections', 'wishlist'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      } else if (response.status === 401) router.push('/login');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extraire auteurs uniques triés par nom de famille
  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Set<string>();
    books.forEach((b) => {
      b.book?.authors?.forEach((author) => authorsSet.add(author));
    });

    return Array.from(authorsSet).sort((a, b) => {
      // Tri par nom de famille (dernier mot)
      const lastNameA = a.split(' ').pop() || '';
      const lastNameB = b.split(' ').pop() || '';
      return lastNameA.localeCompare(lastNameB, 'fr', { sensitivity: 'base' });
    });
  }, [books]);

  const filteredBooks = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'library/page.tsx:78',
        message: 'filteredBooks recalculated',
        data: { booksCount: books.length, selectedFilter, activeTab },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion
    let result = books;

    // Filtre tab
    if (activeTab === 'wishlist') result = result.filter((b) => b.isWishlist);
    else if (activeTab === 'all') result = result.filter((b) => !b.isWishlist);

    // Filtre statut
    if (selectedFilter !== 'ALL') result = result.filter((b) => b.status === selectedFilter);

    // Filtre auteur
    if (selectedAuthor) {
      result = result.filter((b) => b.book?.authors?.includes(selectedAuthor));
    }

    // Recherche texte
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.book?.title?.toLowerCase().includes(q) ||
          b.book?.authors?.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Tri alphabétique par nom de famille du premier auteur
    const sorted = result.sort((a, b) => {
      const authorA = a.book?.authors?.[0] || a.book?.author || '';
      const authorB = b.book?.authors?.[0] || b.book?.author || '';

      const lastNameA = authorA.split(' ').pop() || '';
      const lastNameB = authorB.split(' ').pop() || '';

      return lastNameA.localeCompare(lastNameB, 'fr', { sensitivity: 'base' });
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'library/page.tsx:114',
        message: 'filteredBooks result',
        data: { inputCount: books.length, outputCount: sorted.length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion

    return sorted;
  }, [books, selectedFilter, searchQuery, activeTab, selectedAuthor]);

  const stats = useMemo(
    () => ({
      total: books.filter((b) => !b.isWishlist).length,
      wishlist: books.filter((b) => b.isWishlist).length,
    }),
    [books]
  );

  const handleFilterChange = useCallback((filter: FilterStatus) => {
    setSelectedFilter(filter);
    setShowFilterSheet(false);
  }, []);

  const handleDeleteBook = useCallback(
    (userBookId: string) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'library/page.tsx:126',
          message: 'handleDeleteBook called',
          data: { userBookId, booksCount: books.length },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'D',
        }),
      }).catch(() => {});
      // #endregion
      setBooks((prevBooks) => {
        const filtered = prevBooks.filter((b) => b.id !== userBookId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'library/page.tsx:129',
            message: 'setBooks state update',
            data: {
              userBookId,
              prevCount: prevBooks.length,
              newCount: filtered.length,
              removed: prevBooks.length - filtered.length,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }).catch(() => {});
        // #endregion
        return filtered;
      });
    },
    [books.length]
  );

  if (loading) return <LibrarySkeleton />;

  return (
    <div className="bg-background min-h-screen pb-4">
      <header className="bg-background/80 backdrop-blur-ios border-border/50 sticky top-0 z-40 border-b">
        <div className="px-5 pt-4 pb-3">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="title-large">Bibliothèque</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
              className="h-9 w-9 rounded-full"
            >
              {viewMode === 'grid' ? (
                <List className="h-5 w-5" />
              ) : (
                <LayoutGrid className="h-5 w-5" />
              )}
            </Button>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher..."
            onFilterClick={() => setShowFilterSheet(true)}
          />
        </div>
        <div className="px-5 pb-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-secondary/50 grid h-10 w-full grid-cols-3 rounded-xl p-1">
              <TabsTrigger value="all" className="rounded-lg text-sm">
                Livres ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="collections" className="rounded-lg text-sm">
                Collections
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="rounded-lg text-sm">
                Wishlist ({stats.wishlist})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Filtre par auteur */}
        {activeTab === 'all' && uniqueAuthors.length > 0 && (
          <div className="px-5 pb-3">
            <Select
              value={selectedAuthor || 'all'}
              onValueChange={(v) => setSelectedAuthor(v === 'all' ? null : v)}
            >
              <SelectTrigger className="bg-secondary/30 w-full rounded-xl">
                <SelectValue>
                  <span className="text-sm">{selectedAuthor || 'Tous les auteurs'}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les auteurs</SelectItem>
                <Separator className="my-2" />
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </header>
      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="scrollbar-hide -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-2">
                {STATUS_FILTERS.map((f) => {
                  const count =
                    f.value === 'ALL'
                      ? stats.total
                      : books.filter((b) => b.status === f.value && !b.isWishlist).length;
                  const isActive = selectedFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => handleFilterChange(f.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all active:scale-95',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border-border/50 border'
                      )}
                    >
                      {f.label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs',
                          isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <BookGrid books={filteredBooks} viewMode={viewMode} onDelete={handleDeleteBook} />
              {/* #region agent log */}
              {/* Log: filteredBooks count = {filteredBooks.length}, books count = {books.length} */}
              {/* #endregion */}
            </motion.div>
          )}
          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="py-16 text-center">
                <div className="bg-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <FolderPlus className="text-muted-foreground h-10 w-10" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Pas encore de collection</h3>
                <p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
                  Créez des collections pour organiser vos livres
                </p>
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une collection
                </Button>
              </div>
            </motion.div>
          )}
          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {stats.wishlist === 0 ? (
                <div className="py-16 text-center">
                  <div className="bg-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <Heart className="text-muted-foreground h-10 w-10" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Wishlist vide</h3>
                  <p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
                    Ajoutez des livres à votre wishlist
                  </p>
                  <Button onClick={() => router.push('/scanner')} className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Scanner un livre
                  </Button>
                </div>
              ) : (
                <BookGrid books={filteredBooks} viewMode={viewMode} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Filtrer par statut</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 py-4">
            {STATUS_FILTERS.map((f) => {
              const count =
                f.value === 'ALL'
                  ? stats.total
                  : books.filter((b) => b.status === f.value && !b.isWishlist).length;
              const isActive = selectedFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl p-4',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <span className="font-medium">{f.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-sm',
                      isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed right-5 bottom-24 z-40"
      >
        <Button
          size="icon"
          onClick={() => router.push('/scanner')}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <header className="px-5 pt-4 pb-3">
        <Skeleton className="mb-4 h-9 w-32" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </header>
      <div className="px-5 pt-4">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
