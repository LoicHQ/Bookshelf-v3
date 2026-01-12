import { describe, it, expect } from 'vitest';
import { fetchBookByISBN } from '@/lib/books-api';

describe('Books API', () => {
  it('should fetch a book by ISBN', async () => {
    // Test avec un ISBN connu
    const isbn = '9782070360028'; // L'Ã‰tranger de Camus
    const book = await fetchBookByISBN(isbn);

    expect(book).toBeTruthy();
    expect(book?.title).toBeDefined();
    expect(book?.authors).toBeDefined();
  }, 10000);
});
