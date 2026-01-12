'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { Loader2, Search, Plus } from 'lucide-react';
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
        setError(data.error || "Livre non trouvé. Vérifiez l'ISBN (doit contenir 10 ou 13 chiffres).");
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
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Ajouter un livre</h1>
        <p className="text-muted-foreground">Recherchez un livre par son code ISBN</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche par ISBN</CardTitle>
          <CardDescription>Entrez le code ISBN-10 ou ISBN-13 du livre</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="978-2-1234-5678-9"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !isbn}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
          </form>

          {book && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="mb-4 text-lg font-semibold">Livre trouvé :</h3>
                <BookCard book={book} showStatus={false} showRating={false} />
              </div>
              <Button onClick={handleAdd} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
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
