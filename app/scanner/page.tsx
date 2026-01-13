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
  BookMarked
} from 'lucide-react';
import { BarcodeScanner } from '@/components/scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
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
  const [book, setBook] = useState<BookSearchResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const searchBook = useCallback(async (searchIsbn: string) => {
    if (!searchIsbn.trim()) return;
    
    setLoading(true);
    setError('');
    setBook(null);

    try {
      // Nettoyer l'ISBN (retirer tirets et espaces)
      const cleanIsbn = searchIsbn.replace(/[-\s]/g, '');
      
      const response = await fetch(`/api/books/search?isbn=${encodeURIComponent(cleanIsbn)}`);
      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        setBook(data.results[0]);
        setShowResult(true);
        
        // Ajouter à l'historique
        setScanHistory(prev => [
          { isbn: cleanIsbn, title: data.results[0].title, timestamp: new Date(), added: false },
          ...prev.filter(h => h.isbn !== cleanIsbn).slice(0, 9)
        ]);
      } else {
        setError(data.error || "Livre non trouvé. Vérifiez l'ISBN.");
      }
    } catch {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScan = useCallback((code: string) => {
    // Vérifier si c'est un ISBN valide (10 ou 13 chiffres)
    const cleanCode = code.replace(/[-\s]/g, '');
    if (/^\d{10}$|^\d{13}$/.test(cleanCode)) {
      setIsbn(cleanCode);
      searchBook(cleanCode);
    }
  }, [searchBook]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBook(isbn);
  };

  const handleAddBook = async () => {
    if (!book) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour l'historique
        setScanHistory(prev => 
          prev.map(h => h.isbn === book.isbn || h.isbn === book.isbn13 
            ? { ...h, added: true } 
            : h
          )
        );
        
        setSuccessMessage('Livre ajouté avec succès !');
        setShowResult(false);
        setBook(null);
        setIsbn('');
        
        // Vibration de succès
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch {
      setError("Erreur lors de l'ajout du livre");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!book) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...book, isWishlist: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Ajouté à la wishlist !');
        setShowResult(false);
        setBook(null);
        setIsbn('');
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch {
      setError("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-4 pb-3 bg-background sticky top-0 z-40">
        <h1 className="title-large">Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
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
            className="fixed top-4 left-4 right-4 z-50"
          >
            <Card className="bg-success text-success-foreground border-0 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
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
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-secondary rounded-2xl">
            <TabsTrigger 
              value="camera" 
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm h-10"
            >
              <Scan className="h-4 w-4 mr-2" />
              Caméra
            </TabsTrigger>
            <TabsTrigger 
              value="manual"
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm h-10"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manuel
            </TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="camera" className="mt-4">
            <Card className="card-ios overflow-hidden">
              <div className="aspect-[4/3] relative">
                <BarcodeScanner
                  onScan={handleScan}
                  onError={setError}
                  isActive={activeTab === 'camera' && !showResult}
                />
              </div>
            </Card>
            
            {loading && (
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Recherche en cours...</span>
              </div>
            )}
            
            {error && !showResult && (
              <Card className="mt-4 bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 text-destructive text-sm">
                  {error}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="mt-4">
            <Card className="card-ios">
              <CardContent className="p-5">
                <form onSubmit={handleManualSearch} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Code ISBN
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="978-2-1234-5678-9"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        disabled={loading}
                        className="flex-1 h-12 text-base rounded-xl"
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
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
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
                  className={cn(
                    "card-ios haptic-light cursor-pointer",
                    item.added && "opacity-60"
                  )}
                  onClick={() => {
                    if (!item.added) {
                      setIsbn(item.isbn);
                      searchBook(item.isbn);
                    }
                  }}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title || item.isbn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.isbn}
                      </p>
                    </div>
                    {item.added && (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Book Result Sheet */}
      <Sheet open={showResult} onOpenChange={setShowResult}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Livre trouvé</SheetTitle>
          </SheetHeader>
          
          {book && (
            <div className="space-y-6 overflow-y-auto pb-safe-area-bottom">
              {/* Book Preview */}
              <div className="flex gap-4">
                <div className="relative h-48 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg">
                  {book.coverImage || book.thumbnail ? (
                    <Image
                      src={book.coverImage || book.thumbnail || ''}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookMarked className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-xl font-bold line-clamp-3">{book.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {book.authors?.join(', ') || 'Auteur inconnu'}
                  </p>
                  {book.publishedDate && (
                    <p className="text-sm text-muted-foreground">
                      {book.publishedDate}
                    </p>
                  )}
                  {book.pageCount && (
                    <p className="text-sm text-muted-foreground">
                      {book.pageCount} pages
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Categories */}
              {book.categories && book.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.categories.slice(0, 4).map((cat) => (
                    <span 
                      key={cat}
                      className="px-3 py-1 bg-secondary rounded-full text-xs font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardContent className="p-4 text-destructive text-sm">
                    {error}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddBook}
                  disabled={loading}
                  className="w-full h-14 text-base rounded-2xl"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Ajouter à ma bibliothèque
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl"
                >
                  Ajouter à la wishlist
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResult(false);
                    setBook(null);
                    setError('');
                  }}
                  className="w-full h-12 rounded-2xl"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
