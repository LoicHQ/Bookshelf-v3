/**
 * @agent tests
 * Tests unitaires pour l'agrégateur de couvertures
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCoverOptions, filterFlatCovers } from '@/lib/cover-aggregator';

describe('Cover Aggregator', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  describe('fetchCoverOptions', () => {
    it('should fetch covers from Open Library', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        url: 'https://covers.openlibrary.org/b/isbn/9782755671490-L.jpg',
      });

      const covers = await fetchCoverOptions('9782755671490', null);

      expect(covers.length).toBeGreaterThan(0);
      expect(covers[0].source).toBe('openlibrary');
      expect(covers[0].quality).toBe('high');
      expect(covers[0].fetchMethod).toBe('isbn');
    });

    it('should return empty array if no ISBN provided', async () => {
      const covers = await fetchCoverOptions(null, null);
      expect(covers).toEqual([]);
    });

    it('should limit results to 4 covers', async () => {
      // Mock multiple successful responses
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        url: 'https://example.com/cover.jpg',
      });

      const covers = await fetchCoverOptions('9782755671490', '2755671490');

      // Even if all sources succeed, should be limited to 4
      expect(covers.length).toBeLessThanOrEqual(4);
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const covers = await fetchCoverOptions('9782755671490', null);

      // Should return empty array on error, not throw
      expect(covers).toEqual([]);
    });

    it('should use ISBN-13 if available, fallback to ISBN-10', async () => {
      let calledWith = '';
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledWith = url;
        return Promise.resolve({ ok: true });
      });

      await fetchCoverOptions('9782755671490', '2755671490');

      // Should use ISBN-13 in the URL
      expect(calledWith).toContain('9782755671490');
    });
  });

  describe('filterFlatCovers', () => {
    it('should filter covers by aspect ratio (keep flat covers)', () => {
      const covers = [
        {
          url: 'a',
          source: 'openlibrary' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 264,
          height: 432,
        }, // ratio 1.636 ✅
        {
          url: 'b',
          source: 'google' as const,
          quality: 'medium' as const,
          fetchMethod: 'isbn' as const,
          width: 300,
          height: 200,
        }, // ratio 0.66 ❌
        {
          url: 'c',
          source: 'librarything' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 400,
          height: 600,
        }, // ratio 1.5 ✅
        {
          url: 'd',
          source: 'isbndb' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 200,
          height: 400,
        }, // ratio 2.0 ❌
      ];

      const filtered = filterFlatCovers(covers);

      expect(filtered.length).toBe(2);
      expect(filtered[0].url).toBe('a');
      expect(filtered[1].url).toBe('c');
    });

    it('should keep covers without dimensions', () => {
      const covers = [
        {
          url: 'a',
          source: 'openlibrary' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
        }, // No dimensions
        {
          url: 'b',
          source: 'google' as const,
          quality: 'medium' as const,
          fetchMethod: 'isbn' as const,
          width: 300,
          height: 200,
        }, // ratio 0.66 ❌
      ];

      const filtered = filterFlatCovers(covers);

      // Should keep the one without dimensions
      expect(filtered.length).toBe(1);
      expect(filtered[0].url).toBe('a');
    });

    it('should handle empty array', () => {
      const filtered = filterFlatCovers([]);
      expect(filtered).toEqual([]);
    });

    it('should accept ratio between 1.4 and 1.65', () => {
      const covers = [
        {
          url: 'a',
          source: 'openlibrary' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 100,
          height: 140,
        }, // ratio 1.4 ✅
        {
          url: 'b',
          source: 'google' as const,
          quality: 'medium' as const,
          fetchMethod: 'isbn' as const,
          width: 100,
          height: 165,
        }, // ratio 1.65 ✅
        {
          url: 'c',
          source: 'librarything' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 100,
          height: 139,
        }, // ratio 1.39 ❌
        {
          url: 'd',
          source: 'isbndb' as const,
          quality: 'high' as const,
          fetchMethod: 'isbn' as const,
          width: 100,
          height: 166,
        }, // ratio 1.66 ❌
      ];

      const filtered = filterFlatCovers(covers);

      expect(filtered.length).toBe(2);
      expect(filtered.map((c) => c.url)).toEqual(['a', 'b']);
    });
  });
});
