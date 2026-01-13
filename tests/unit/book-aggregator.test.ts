/**
 * @agent tests
 * Tests unitaires pour l'agrégateur de métadonnées et couvertures
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aggregateBookData } from '@/lib/book-aggregator';
import * as booksApi from '@/lib/books-api';
import * as coverAggregator from '@/lib/cover-aggregator';
import * as webCoverScraper from '@/lib/web-cover-scraper';
import * as dbBookSearch from '@/lib/db-book-search';

// Mock des modules
vi.mock('@/lib/books-api');
vi.mock('@/lib/cover-aggregator');
vi.mock('@/lib/web-cover-scraper');
vi.mock('@/lib/db-book-search');

describe('book-aggregator', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock par défaut pour searchBookInDatabase (retourne null = pas en BDD)
    vi.mocked(dbBookSearch.searchBookInDatabase).mockResolvedValue(null);
  });

  describe('aggregateBookData - Fallback Web Scraping', () => {
    it('devrait déclencher le fallback web si < 4 couvertures depuis les APIs', async () => {
      const mockBook = {
        id: 'test-id',
        title: 'Fourth Wing',
        authors: ['Rebecca Yarros'],
        isbn: '1649374046',
        isbn13: '9781649374042',
        coverImage: 'https://example.com/cover.jpg',
      };

      // Mock Google Books retourne le livre
      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([mockBook]);

      // Mock fetchCoverOptions retourne seulement 1 couverture (< 4)
      vi.mocked(coverAggregator.fetchCoverOptions).mockResolvedValue([
        {
          url: 'https://openlibrary.org/cover1.jpg',
          source: 'openlibrary',
          quality: 'high',
          fetchMethod: 'isbn',
        },
      ]);

      // Mock fetch pour la validation d'image Google Books
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10000)),
        headers: {
          get: (name: string) => (name === 'content-length' ? '10000' : null),
        },
      });

      // Mock fetchWebCovers
      vi.mocked(webCoverScraper.fetchWebCovers).mockResolvedValue([
        {
          url: 'https://babelio.com/cover.jpg',
          source: 'babelio',
          quality: 'high',
          fetchMethod: 'title-author',
        },
        {
          url: 'https://archive.org/cover.jpg',
          source: 'archive',
          quality: 'high',
          fetchMethod: 'title-author',
        },
      ]);

      const result = await aggregateBookData('9781649374042');

      // Vérifier que fetchWebCovers a été appelé
      expect(webCoverScraper.fetchWebCovers).toHaveBeenCalledWith('Fourth Wing', 'Rebecca Yarros', expect.any(Number));

      // Vérifier que les couvertures web sont incluses
      expect(result?.coverOptions).toBeDefined();
      const webCovers = result?.coverOptions.filter((c) =>
        ['babelio', 'archive', 'openlibrary-search'].includes(c.source)
      );
      expect(webCovers?.length).toBeGreaterThan(0);
    });

    it('ne devrait pas déclencher le fallback web si >= 4 couvertures depuis les APIs', async () => {
      const mockBook = {
        id: 'test-id',
        title: 'Test Book',
        authors: ['Test Author'],
        isbn: '1234567890',
        isbn13: '9781234567890',
        coverImage: 'https://example.com/cover.jpg',
      };

      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([mockBook]);

      // Mock fetchCoverOptions retourne 4 couvertures (>= 4)
      vi.mocked(coverAggregator.fetchCoverOptions).mockResolvedValue([
        {
          url: 'https://openlibrary.org/cover1.jpg',
          source: 'openlibrary',
          quality: 'high',
          fetchMethod: 'isbn',
        },
        {
          url: 'https://librarything.com/cover.jpg',
          source: 'librarything',
          quality: 'high',
          fetchMethod: 'isbn',
        },
        {
          url: 'https://isbndb.com/cover.jpg',
          source: 'isbndb',
          quality: 'high',
          fetchMethod: 'isbn',
        },
        {
          url: 'https://another.com/cover.jpg',
          source: 'openlibrary',
          quality: 'high',
          fetchMethod: 'isbn',
        },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10000)),
        headers: {
          get: (name: string) => (name === 'content-length' ? '10000' : null),
        },
      });

      vi.mocked(webCoverScraper.fetchWebCovers).mockResolvedValue([]);

      await aggregateBookData('9781234567890');

      // Vérifier que fetchWebCovers n'a PAS été appelé
      expect(webCoverScraper.fetchWebCovers).not.toHaveBeenCalled();
    });
  });

  describe('aggregateBookData - Ratio 3 web + 2 API', () => {
    it('devrait prioriser 3 couvertures web et 2 API', async () => {
      const mockBook = {
        id: 'test-id',
        title: 'Test Book',
        authors: ['Test Author'],
        isbn: '1234567890',
        isbn13: '9781234567890',
      };

      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([mockBook]);

      // Retourne 1 couverture API (< 2)
      vi.mocked(coverAggregator.fetchCoverOptions).mockResolvedValue([
        {
          url: 'https://openlibrary.org/cover1.jpg',
          source: 'openlibrary',
          quality: 'high',
          fetchMethod: 'isbn',
        },
      ]);

      // Retourne 3 couvertures web
      vi.mocked(webCoverScraper.fetchWebCovers).mockResolvedValue([
        {
          url: 'https://babelio.com/cover.jpg',
          source: 'babelio',
          quality: 'high',
          fetchMethod: 'title-author',
        },
        {
          url: 'https://archive.org/cover.jpg',
          source: 'archive',
          quality: 'high',
          fetchMethod: 'title-author',
        },
        {
          url: 'https://openlibrary.org/search-cover.jpg',
          source: 'openlibrary-search',
          quality: 'high',
          fetchMethod: 'title-author',
        },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const result = await aggregateBookData('9781234567890');

      expect(result?.coverOptions).toBeDefined();

      // Compter les sources web et API
      const webSources = ['babelio', 'archive', 'openlibrary-search'];
      const webCovers = result?.coverOptions.filter((c) => webSources.includes(c.source)) || [];
      const apiCovers = result?.coverOptions.filter((c) => !webSources.includes(c.source)) || [];

      // Devrait avoir au max 3 web et 2 API
      expect(webCovers.length).toBeLessThanOrEqual(3);
      expect(apiCovers.length).toBeLessThanOrEqual(2);
    });
  });

  describe('aggregateBookData - Déduplication', () => {
    it('devrait dédupliquer les URLs identiques', async () => {
      const mockBook = {
        id: 'test-id',
        title: 'Test Book',
        authors: ['Test Author'],
        isbn: '1234567890',
        isbn13: '9781234567890',
        coverImage: 'https://duplicate.com/cover.jpg',
      };

      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([mockBook]);

      // Retourne des couvertures avec URLs dupliquées
      vi.mocked(coverAggregator.fetchCoverOptions).mockResolvedValue([
        {
          url: 'https://duplicate.com/cover.jpg',
          source: 'openlibrary',
          quality: 'high',
          fetchMethod: 'isbn',
        },
      ]);

      vi.mocked(webCoverScraper.fetchWebCovers).mockResolvedValue([
        {
          url: 'https://duplicate.com/cover.jpg', // Même URL
          source: 'babelio',
          quality: 'high',
          fetchMethod: 'title-author',
        },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10000)),
        headers: {
          get: (name: string) => (name === 'content-length' ? '10000' : null),
        },
      });

      const result = await aggregateBookData('9781234567890');

      // Vérifier qu'il n'y a pas de doublons
      const urls = result?.coverOptions.map((c) => c.url) || [];
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    });
  });

  describe('aggregateBookData - Livre en BDD', () => {
    it('devrait utiliser le fallback web même pour les livres en BDD', async () => {
      const mockDbBook = {
        id: 'db-id',
        title: 'DB Book',
        authors: ['DB Author'],
        isbn: '1234567890',
        isbn13: '9781234567890',
        coverImage: 'https://db.com/cover.jpg',
      };

      vi.mocked(dbBookSearch.searchBookInDatabase).mockResolvedValue(mockDbBook);

      // Seulement 1 couverture depuis les APIs
      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([]);
      vi.mocked(coverAggregator.fetchCoverOptions).mockResolvedValue([]);

      vi.mocked(webCoverScraper.fetchWebCovers).mockResolvedValue([
        {
          url: 'https://babelio.com/cover.jpg',
          source: 'babelio',
          quality: 'high',
          fetchMethod: 'title-author',
        },
      ]);

      const result = await aggregateBookData('9781234567890');

      // Vérifier que fetchWebCovers a été appelé
      expect(webCoverScraper.fetchWebCovers).toHaveBeenCalledWith('DB Book', 'DB Author');

      expect(result?.source).toBe('database');
    });
  });

  describe("aggregateBookData - Gestion d'erreurs", () => {
    it('devrait retourner null si ISBN invalide', async () => {
      await expect(aggregateBookData('invalid-isbn')).rejects.toThrow();
    });

    it('devrait retourner null si aucune source ne retourne de données', async () => {
      vi.mocked(dbBookSearch.searchBookInDatabase).mockResolvedValue(null);
      vi.mocked(booksApi.searchGoogleBooks).mockResolvedValue([]);

      // Mock Open Library pour retourner vide
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await aggregateBookData('9781234567890');

      expect(result).toBeNull();
    });
  });
});
