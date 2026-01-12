'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookCard } from '@/components/books/BookCard';
import { Library, Loader2 } from 'lucide-react';
import type { UserBook } from '@/types';

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Library className="h-8 w-8" />
          Ma bibliothèque
        </h1>
        <p className="text-muted-foreground">
          {books.length} livre{books.length > 1 ? 's' : ''} dans votre bibliothèque
        </p>
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Votre bibliothèque est vide</p>
            <Button onClick={() => router.push('/add-book')}>Ajouter votre premier livre</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((userBook) => (
            <BookCard key={userBook.id} book={userBook} showStatus showRating />
          ))}
        </div>
      )}
    </div>
  );
}
