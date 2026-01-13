'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { Loader2, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookSearchResult } from '@/types';

export default function AddBookPage() {
  const router = useRouter();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [book, setBook] = useState<BookSearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBook(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/books/search?isbn=${encodeURIComponent(isbn)}`);
      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        setBook(data.results[0]);
      } else {
        setError(
          data.error || "Livre non trouvé. Vérifiez l'ISBN (doit contenir 10 ou 13 chiffres)."
        );
      }
    } catch {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
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
        router.push('/library');
      } else {
        setError(data.error || "Erreur lors de l'ajout du livre");
      }
    } catch {
      setError("Erreur lors de l'ajout du livre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="safe-area-inset-top container mx-auto max-w-2xl p-6 pb-24">
      {/* Header iOS-like */}
      <div className="animate-spring-in mb-8 space-y-3">
        <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          Ajouter un livre
        </h1>
        <p className="text-muted-foreground text-[17px] leading-relaxed">
          Recherchez un livre par son code ISBN
        </p>
      </div>

      {/* Card iOS-like avec glassmorphism */}
      <Card className="glass-card shadow-ios-lg border-border/40 animate-spring-in">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold">Recherche par ISBN</CardTitle>
          <CardDescription className="text-[15px]">
            Entrez le code ISBN-10 ou ISBN-13 du livre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Input avec bouton de recherche iOS-like */}
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="978-2-1234-5678-9"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={loading}
                className="h-14 flex-1 text-[17px]"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !isbn}
                size="icon"
                className="shadow-ios-sm h-14 w-14"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Message d'erreur iOS-like */}
            {error && (
              <div className="animate-spring-in rounded-2xl border border-red-200/50 bg-red-50 p-4 text-[15px] text-red-600 dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}
          </form>

          {/* Résultat de recherche iOS-like */}
          {book && (
            <div className="border-border/30 animate-spring-in space-y-6 border-t pt-6">
              <div>
                <h3 className="mb-5 text-xl font-bold">Livre trouvé :</h3>
                <BookCard book={book} showStatus={false} showRating={false} />
              </div>
              <Button
                onClick={handleAdd}
                disabled={loading}
                className="shadow-ios-sm h-14 w-full text-[17px] font-semibold"
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
