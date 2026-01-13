/**
 * @agent tests
 * Tests unitaires pour le scraper web de couvertures légales
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWebCovers, clearCache } from '@/lib/web-cover-scraper';

// Mock de fetch global
global.fetch = vi.fn();

describe('web-cover-scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
    // Configurer les variables d'environnement pour les tests
    process.env.BABELIO_API_KEY = 'test-babelio-key';
  });

  afterEach(() => {
    clearCache();
  });

  describe('fetchWebCovers', () => {
    it('devrait retourner un tableau vide si titre ou auteur manquant', async () => {
      const result1 = await fetchWebCovers('', 'Author');
      const result2 = await fetchWebCovers('Title', '');
      const result3 = await fetchWebCovers('', '');

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('devrait appeler les 3 sources en parallèle', async () => {
      // Mock des réponses
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('babelio.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  couverture_url: 'https://babelio.com/cover1.jpg',
                },
              ]),
          });
        }
        if (url.includes('archive.org/advancedsearch')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                response: {
                  docs: [{ identifier: 'book123' }],
                },
              }),
          });
        }
        if (url.includes('openlibrary.org/search.json')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                docs: [{ cover_i: 12345 }],
              }),
          });
        }
        // Pour les requêtes GET de validation Open Library (avec Range header)
        if (url.includes('covers.openlibrary.org')) {
          return Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(10000)),
            headers: {
              get: (name: string) => (name === 'content-length' ? '10000' : null),
            },
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
        });
      });

      const result = await fetchWebCovers('Fourth Wing', 'Rebecca Yarros');

      expect(result).toHaveLength(3);
      expect(result[0].source).toBe('babelio');
      expect(result[1].source).toBe('archive');
      expect(result[2].source).toBe('openlibrary-search');
      expect(result.every((c) => c.fetchMethod === 'title-author')).toBe(true);
    });

    it('devrait gérer les erreurs individuelles sans bloquer les autres sources', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('babelio.com')) {
          return Promise.reject(new Error('Babelio error'));
        }
        if (url.includes('archive.org')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                response: {
                  docs: [{ identifier: 'book456' }],
                },
              }),
          });
        }
        if (url.includes('openlibrary.org')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Test Book', 'Test Author');

      // Seule Internet Archive devrait réussir
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('archive');
    });

    it('devrait limiter les résultats à 3 couvertures maximum', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('babelio.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                { couverture_url: 'https://babelio.com/cover1.jpg' },
                { couverture_url: 'https://babelio.com/cover2.jpg' },
              ]),
          });
        }
        if (url.includes('archive.org/advancedsearch')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                response: {
                  docs: [{ identifier: 'book1' }, { identifier: 'book2' }],
                },
              }),
          });
        }
        if (url.includes('openlibrary.org/search.json')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                docs: [{ cover_i: 123 }, { cover_i: 456 }],
              }),
          });
        }
        if (url.includes('covers.openlibrary.org')) {
          return Promise.resolve({
            ok: true,
            headers: {
              get: (name: string) => (name === 'content-length' ? '10000' : null),
            },
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Test Book', 'Test Author');

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('devrait utiliser le cache pour les requêtes identiques', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              couverture_url: 'https://babelio.com/cover.jpg',
            },
          ]),
      });

      const result1 = await fetchWebCovers('Cached Book', 'Cached Author');
      const result2 = await fetchWebCovers('Cached Book', 'Cached Author');

      // Le cache devrait éviter le second appel
      expect(result1).toEqual(result2);
      // Les appels fetch devraient être faits seulement lors du premier appel (3 sources)
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('devrait dédupliquer les URLs identiques', async () => {
      (fetch as any).mockImplementation((url: string) => {
        // Toutes les sources retournent la même URL
        if (url.includes('babelio.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  couverture_url: 'https://same.url/cover.jpg',
                },
              ]),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Test Book', 'Test Author');

      // Devrait n'avoir qu'une seule couverture malgré les doublons
      const uniqueUrls = new Set(result.map((c) => c.url));
      expect(uniqueUrls.size).toBe(result.length);
    });

    it('ne devrait pas appeler Babelio si la clé API est absente', async () => {
      delete process.env.BABELIO_API_KEY;

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: { docs: [] } }),
      });

      await fetchWebCovers('Test Book', 'Test Author');

      // Vérifier qu'aucun appel à Babelio n'a été fait
      const babelioCalls = (fetch as any).mock.calls.filter((call: any[]) =>
        call[0].includes('babelio.com')
      );
      expect(babelioCalls).toHaveLength(0);
    });
  });

  describe('Babelio API', () => {
    it('devrait extraire correctement les couvertures Babelio', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('babelio.com')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  titre: 'Fourth Wing',
                  auteur: 'Rebecca Yarros',
                  couverture_url: 'https://babelio.com/couv/fourth-wing.jpg',
                },
              ]),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Fourth Wing', 'Rebecca Yarros');

      const babelioCover = result.find((c) => c.source === 'babelio');
      expect(babelioCover).toBeDefined();
      expect(babelioCover?.url).toBe('https://babelio.com/couv/fourth-wing.jpg');
      expect(babelioCover?.quality).toBe('high');
    });
  });

  describe('Internet Archive API', () => {
    it('devrait extraire correctement les couvertures Internet Archive', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('archive.org/advancedsearch')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                response: {
                  docs: [
                    {
                      identifier: 'isbn_9781649374042',
                      title: 'Fourth Wing',
                      creator: 'Rebecca Yarros',
                    },
                  ],
                },
              }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Fourth Wing', 'Rebecca Yarros');

      const archiveCover = result.find((c) => c.source === 'archive');
      expect(archiveCover).toBeDefined();
      expect(archiveCover?.url).toBe('https://archive.org/services/img/isbn_9781649374042');
    });
  });

  describe('Open Library Search', () => {
    it('devrait valider la taille des images avant de les ajouter', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('openlibrary.org/search.json')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                docs: [{ cover_i: 12345 }],
              }),
          });
        }
        if (url.includes('covers.openlibrary.org')) {
          return Promise.resolve({
            ok: true,
            headers: {
              get: (name: string) => (name === 'content-length' ? '3000' : null), // Trop petit
            },
          });
        }
        return Promise.resolve({ ok: false });
      });

      const result = await fetchWebCovers('Test Book', 'Test Author');

      const olCover = result.find((c) => c.source === 'openlibrary-search');
      // Ne devrait pas être ajouté car l'image est trop petite (< 5KB)
      expect(olCover).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('devrait effacer le cache correctement', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              couverture_url: 'https://test.com/cover.jpg',
            },
          ]),
      });

      // Premier appel
      await fetchWebCovers('Book', 'Author');
      expect(fetch).toHaveBeenCalled();

      vi.clearAllMocks();

      // Second appel (devrait utiliser le cache)
      await fetchWebCovers('Book', 'Author');
      expect(fetch).not.toHaveBeenCalled();

      // Effacer le cache
      clearCache();

      // Troisième appel (devrait refetch)
      await fetchWebCovers('Book', 'Author');
      expect(fetch).toHaveBeenCalled();
    });
  });
});
