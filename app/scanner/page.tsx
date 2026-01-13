'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Keyboard,
  Search,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  BookMarked,
} from 'lucide-react';
import { BarcodeScanner } from '@/components/scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BookPreview } from '@/components/books/BookPreview';
import { cn } from '@/lib/utils';
import type { AggregatedBook } from '@/lib/book-aggregator';
import type { BookSearchResult } from '@/types';

interface ScanHistory {
  isbn: string;
  title?: string;
  timestamp: Date;
  added: boolean;
}

export default function ScannerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('manual');
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aggregatedBook, setAggregatedBook] = useState<AggregatedBook | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const searchBook = useCallback(async (searchIsbn: string) => {
    if (!searchIsbn.trim()) return;

    setLoading(true);
    setError('');
    setAggregatedBook(null);

    try {
      // Nettoyer l'ISBN (retirer tirets et espaces)
      const cleanIsbn = searchIsbn.replace(/[-\s]/g, '');

      // Appeler l'API d'agrégation côté serveur
      const response = await fetch(`/api/books/aggregate?isbn=${encodeURIComponent(cleanIsbn)}`);
      const data = await response.json();

      if (response.ok && data.book) {
        setAggregatedBook(data.book);

        // Ajouter à l'historique
        setScanHistory((prev) => [
          { isbn: cleanIsbn, title: data.book.title, timestamp: new Date(), added: false },
          ...prev.filter((h) => h.isbn !== cleanIsbn).slice(0, 9),
        ]);
      } else {
        setError(data.error || "Livre non trouvé. Vérifiez l'ISBN.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScan = useCallback(
    (code: string) => {
      // Vérifier si c'est un ISBN valide (10 ou 13 chiffres)
      const cleanCode = code.replace(/[-\s]/g, '');
      if (/^\d{10}$|^\d{13}$/.test(cleanCode)) {
        setIsbn(cleanCode);
        searchBook(cleanCode);
      }
    },
    [searchBook]
  );

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBook(isbn);
  };

  const handleSaveBook = async (editedBook: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedBook),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour l'historique
        setScanHistory((prev) =>
          prev.map((h) =>
            h.isbn === editedBook.isbn || h.isbn === editedBook.isbn13 ? { ...h, added: true } : h
          )
        );

        setSuccessMessage('Livre ajouté avec succès !');
        setAggregatedBook(null);
        setIsbn('');

        // Vibration de succès
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => {
          setSuccessMessage('');
          router.push('/library');
        }, 2000);
      } else {
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch {
      setError("Erreur lors de l'ajout du livre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background sticky top-0 z-40 px-5 pt-4 pb-3">
        <h1 className="title-large">Scanner</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Scannez ou entrez un ISBN pour ajouter un livre
        </p>
      </header>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 left-4 z-50"
          >
            <Card className="bg-success text-success-foreground border-0 shadow-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{successMessage}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="px-5">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'camera' | 'manual')}>
          <TabsList className="bg-secondary grid h-12 w-full grid-cols-2 rounded-2xl p-1">
            <TabsTrigger
              value="camera"
              className="data-[state=active]:bg-card h-10 rounded-xl data-[state=active]:shadow-sm"
            >
              <Scan className="mr-2 h-4 w-4" />
              Caméra
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="data-[state=active]:bg-card h-10 rounded-xl data-[state=active]:shadow-sm"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Manuel
            </TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="camera" className="mt-4">
            <Card className="card-ios overflow-hidden">
              <div className="relative aspect-[4/3]">
                <BarcodeScanner
                  onScan={handleScan}
                  onError={setError}
                  isActive={activeTab === 'camera' && !aggregatedBook}
                />
              </div>
            </Card>

            {loading && (
              <div className="text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Recherche en cours...</span>
              </div>
            )}

            {error && !aggregatedBook && (
              <Card className="bg-destructive/10 border-destructive/20 mt-4">
                <CardContent className="text-destructive p-4 text-sm">{error}</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="mt-4">
            <Card className="card-ios">
              <CardContent className="p-5">
                <form onSubmit={handleManualSearch} className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-2 block text-sm font-medium">
                      Code ISBN
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="978-2-1234-5678-9"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        disabled={loading}
                        className="h-12 flex-1 rounded-xl text-base"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !isbn}
                        size="icon"
                        className="h-12 w-12 rounded-xl"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Search className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-4 text-sm">
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Preview */}
      {aggregatedBook && !successMessage && (
        <div className="mt-6 px-5">
          <BookPreview
            book={aggregatedBook}
            onSave={handleSaveBook}
            onCancel={() => {
              setAggregatedBook(null);
              setIsbn('');
              setError('');
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && !aggregatedBook && (
        <div className="mt-6 px-5">
          <h2 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" />
            Historique des scans
          </h2>
          <div className="space-y-2">
            {scanHistory.slice(0, 5).map((item, index) => (
              <motion.div
                key={`${item.isbn}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn('card-ios haptic-light cursor-pointer', item.added && 'opacity-60')}
                  onClick={() => {
                    if (!item.added) {
                      setIsbn(item.isbn);
                      searchBook(item.isbn);
                    }
                  }}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title || item.isbn}</p>
                      <p className="text-muted-foreground text-xs">{item.isbn}</p>
                    </div>
                    {item.added && <CheckCircle2 className="text-success h-4 w-4 flex-shrink-0" />}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
