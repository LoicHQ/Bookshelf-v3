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

  useEffect(() => {
    const filter = searchParams.get('filter') as BookStatus | null;
    const tab = searchParams.get('tab') as TabValue | null;
    if (filter && STATUS_FILTERS.some(f => f.value === filter)) setSelectedFilter(filter);
    if (tab && ['all', 'collections', 'wishlist'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      } else if (response.status === 401) router.push('/login');
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeTab === 'wishlist') result = result.filter(b => b.isWishlist);
    else if (activeTab === 'all') result = result.filter(b => !b.isWishlist);
    if (selectedFilter !== 'ALL') result = result.filter(b => b.status === selectedFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.book?.title?.toLowerCase().includes(q) || b.book?.authors?.some(a => a.toLowerCase().includes(q)));
    }
    return result;
  }, [books, selectedFilter, searchQuery, activeTab]);

  const stats = useMemo(() => ({
    total: books.filter(b => !b.isWishlist).length,
    wishlist: books.filter(b => b.isWishlist).length,
  }), [books]);

  const handleFilterChange = useCallback((filter: FilterStatus) => {
    setSelectedFilter(filter);
    setShowFilterSheet(false);
  }, []);

  if (loading) return <LibrarySkeleton />;

  return (
    <div className="min-h-screen bg-background pb-4">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-ios border-b border-border/50">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="title-large">Bibliothèque</h1>
            <Button variant="ghost" size="icon" onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="h-9 w-9 rounded-full">
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </Button>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher..." onFilterClick={() => setShowFilterSheet(true)} />
        </div>
        <div className="px-5 pb-3">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabValue)}>
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-secondary/50 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-sm">Livres ({stats.total})</TabsTrigger>
              <TabsTrigger value="collections" className="rounded-lg text-sm">Collections</TabsTrigger>
              <TabsTrigger value="wishlist" className="rounded-lg text-sm">Wishlist ({stats.wishlist})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'all' && (
            <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {STATUS_FILTERS.map(f => {
                  const count = f.value === 'ALL' ? stats.total : books.filter(b => b.status === f.value && !b.isWishlist).length;
                  const isActive = selectedFilter === f.value;
                  return (
                    <button key={f.value} onClick={() => handleFilterChange(f.value)}
                      className={cn('flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50')}>
                      {f.label}<span className={cn('px-1.5 py-0.5 rounded-full text-xs', isActive ? 'bg-primary-foreground/20' : 'bg-muted')}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <BookGrid books={filteredBooks} viewMode={viewMode} />
            </motion.div>
          )}
          {activeTab === 'collections' && (
            <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4"><FolderPlus className="h-10 w-10 text-muted-foreground" /></div>
                <h3 className="text-lg font-semibold mb-2">Pas encore de collection</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Créez des collections pour organiser vos livres</p>
                <Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />Créer une collection</Button>
              </div>
            </motion.div>
          )}
          {activeTab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {stats.wishlist === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4"><Heart className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold mb-2">Wishlist vide</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Ajoutez des livres à votre wishlist</p>
                  <Button onClick={() => router.push('/scanner')} className="rounded-full"><Plus className="h-4 w-4 mr-2" />Scanner un livre</Button>
                </div>
              ) : <BookGrid books={filteredBooks} viewMode={viewMode} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Filtrer par statut</SheetTitle></SheetHeader>
          <div className="space-y-2 py-4">
            {STATUS_FILTERS.map(f => {
              const count = f.value === 'ALL' ? stats.total : books.filter(b => b.status === f.value && !b.isWishlist).length;
              const isActive = selectedFilter === f.value;
              return (
                <button key={f.value} onClick={() => handleFilterChange(f.value)}
                  className={cn('w-full flex items-center justify-between p-4 rounded-xl', isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                  <span className="font-medium">{f.label}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-sm', isActive ? 'bg-primary-foreground/20' : 'bg-muted')}>{count}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-24 right-5 z-40">
        <Button size="icon" onClick={() => router.push('/scanner')} className="h-14 w-14 rounded-full shadow-lg"><Plus className="h-6 w-6" /></Button>
      </motion.div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-4 pb-3">
        <Skeleton className="h-9 w-32 mb-4" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-xl mt-4" />
      </header>
      <div className="px-5 pt-4">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
