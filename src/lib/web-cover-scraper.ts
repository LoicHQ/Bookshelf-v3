/**
 * @agent backend-logic
 * Scraper web légal de couvertures via APIs officielles
 * Sources : Babelio, Internet Archive, Open Library Search
 */

import type { CoverOption } from './cover-aggregator';

// Cache en mémoire avec TTL de 24h
interface CacheEntry {
  data: CoverOption[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Récupère une entrée du cache si elle est valide
 */
function getCachedCovers(key: string): CoverOption[] | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Sauvegarde une entrée dans le cache
 */
function setCachedCovers(key: string, data: CoverOption[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Nettoie le titre pour améliorer les recherches
 * Enlève les numéros de tome, volumes, etc.
 */
function cleanTitleForSearch(title: string): string {
  // Enlever les patterns comme "Tome 1", "Tome 2", "Volume 1", etc.
  return title
    .replace(/\s*(?:Tome|tome|TOME)\s*\d+/gi, '')
    .replace(/\s*(?:Volume|volume|VOLUME)\s*\d+/gi, '')
    .replace(/\s*(?:Vol\.|vol\.)\s*\d+/gi, '')
    .replace(/\s*(?:Part|part|PART)\s*\d+/gi, '')
    .replace(/\s*(?:Book|book|BOOK)\s*\d+/gi, '')
    .trim();
}

/**
 * Crée une clé de cache normalisée
 */
function createCacheKey(title: string, author: string): string {
  return `${title.toLowerCase().trim()}-${author.toLowerCase().trim()}`;
}

/**
 * Helper pour fetch avec timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Babelio API - Communauté française spécialisée en fantasy/romantasy
 * API officielle : https://www.babelio.com/api
 */
async function fetchBabelioCovers(title: string, author: string): Promise<CoverOption[]> {
  const apiKey = process.env.BABELIO_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.babelio.com/api/livres?q=${query}&key=${apiKey}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Babelio retourne un tableau de livres
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Prendre la première correspondance et extraire la couverture
    const book = data[0];
    if (!book.couverture_url) {
      return [];
    }

    return [
      {
        url: book.couverture_url,
        source: 'babelio',
        quality: 'high',
        fetchMethod: 'title-author',
      },
    ];
  } catch (error) {
    // Erreur silencieuse - on continue avec les autres sources
    return [];
  }
}

/**
 * Internet Archive API - Archive légale de millions de livres
 * API officielle : https://archive.org/services/docs/api/
 */
async function fetchArchiveCovers(title: string, author: string): Promise<CoverOption[]> {
  try {
    // Nettoyer les titres pour la recherche
    const cleanTitle = title.replace(/[:"]/g, '');
    const cleanAuthor = author.replace(/[:"]/g, '');

    // Construire la requête de recherche avancée
    const query = encodeURIComponent(`title:"${cleanTitle}" AND creator:"${cleanAuthor}"`);
    const url = `https://archive.org/advancedsearch.php?q=${query}&fl=identifier,title,creator&rows=3&output=json`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.response?.docs || data.response.docs.length === 0) {
      return [];
    }

    // Prendre le premier résultat et construire l'URL de la couverture
    const doc = data.response.docs[0];
    if (!doc.identifier) {
      return [];
    }

    return [
      {
        url: `https://archive.org/services/img/${doc.identifier}`,
        source: 'archive',
        quality: 'high',
        fetchMethod: 'title-author',
      },
    ];
  } catch (error) {
    // Erreur silencieuse - on continue avec les autres sources
    return [];
  }
}

/**
 * Open Library Search - Recherche améliorée par titre/auteur
 * Complète la recherche par ISBN existante
 * API officielle : https://openlibrary.org/dev/docs/api/search
 */
async function fetchOpenLibrarySearchCovers(
  title: string,
  author: string,
  maxResults: number = 3,
  targetCount: number = 1
): Promise<CoverOption[]> {
  try {
    const titleParam = encodeURIComponent(title);
    const authorParam = encodeURIComponent(author);
    const url = `https://openlibrary.org/search.json?title=${titleParam}&author=${authorParam}&limit=${maxResults}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    const covers: CoverOption[] = [];

    // Parcourir les résultats pour trouver des couvertures (jusqu'à targetCount)
    for (const doc of data.docs.slice(0, maxResults)) {
      if (doc.cover_i && covers.length < targetCount) {
        // Vérifier que l'image n'est pas un placeholder
        const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;

        try {
          // Utiliser GET avec Range pour vérifier la taille réelle (comme dans cover-aggregator.ts)
          // Certains serveurs ne retournent pas Content-Length dans HEAD requests
          const imageCheckResponse = await fetchWithTimeout(
            coverUrl,
            { method: 'GET', headers: { Range: 'bytes=0-1023' } },
            3000
          );

          if (imageCheckResponse.ok) {
            const buffer = await imageCheckResponse.arrayBuffer();
            const size = buffer.byteLength;
            const contentLength = imageCheckResponse.headers.get('content-length');
            const totalSize = contentLength ? parseInt(contentLength, 10) : size;

            // Les vraies images font généralement plus de 5KB
            // Si on a récupéré au moins 1KB de données, c'est probablement valide
            if (totalSize > 5000 || size > 1000) {
              covers.push({
                url: coverUrl,
                source: 'openlibrary-search',
                quality: 'high',
                fetchMethod: 'title-author',
              });

              // Si on a atteint le nombre de couvertures souhaité, on s'arrête
              if (covers.length >= targetCount) {
                break;
              }
            }
          }
        } catch (error) {
          // Si la validation échoue, continuer avec le prochain résultat
          continue;
        }
      }
    }

    return covers;
  } catch (error) {
    // Erreur silencieuse - on continue avec les autres sources
    return [];
  }
}

/**
 * Fonction principale d'orchestration
 * Récupère jusqu'à targetCount couvertures depuis les sources web légales
 */
export async function fetchWebCovers(
  title: string,
  author: string,
  targetCount: number = 3
): Promise<CoverOption[]> {
  if (!title || !author) {
    return [];
  }

  // Nettoyer le titre pour améliorer les recherches
  const cleanedTitle = cleanTitleForSearch(title);

  // Vérifier le cache d'abord (avec titre original et nettoyé)
  const cacheKey = createCacheKey(title, author);
  const cleanedCacheKey = createCacheKey(cleanedTitle, author);
  const cachedCovers = getCachedCovers(cacheKey) || getCachedCovers(cleanedCacheKey);

  if (cachedCovers) {
    return cachedCovers;
  }

  // Essayer d'abord avec le titre nettoyé, puis avec le titre original si différent
  const titlesToTry = cleanedTitle !== title ? [cleanedTitle, title] : [title];
  const allCovers: CoverOption[] = [];

  for (const searchTitle of titlesToTry) {
    // Calculer combien de couvertures on cherche encore
    const remainingCount = targetCount - allCovers.length;

    // Si on cherche plus de couvertures, augmenter le nombre de résultats Open Library
    const openLibraryMaxResults = remainingCount > 1 ? Math.min(remainingCount * 3, 20) : 3;
    const openLibraryTargetCount = remainingCount;

    // Appeler toutes les sources en parallèle
    const results = await Promise.allSettled([
      fetchBabelioCovers(searchTitle, author),
      fetchArchiveCovers(searchTitle, author),
      fetchOpenLibrarySearchCovers(
        searchTitle,
        author,
        openLibraryMaxResults,
        openLibraryTargetCount
      ),
    ]);

    // Collecter toutes les couvertures réussies pour ce titre
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allCovers.push(...result.value);
      }
    }

    // Si on a trouvé assez de couvertures, on s'arrête
    if (allCovers.length >= targetCount) {
      break;
    }
  }

  // Dédupliquer par URL
  const uniqueCovers = Array.from(new Map(allCovers.map((c) => [c.url, c])).values());

  // Limiter à targetCount couvertures max
  const finalCovers = uniqueCovers.slice(0, targetCount);

  // Mettre en cache
  setCachedCovers(cacheKey, finalCovers);

  return finalCovers;
}

/**
 * Nettoie le cache (utile pour les tests)
 */
export function clearCache(): void {
  cache.clear();
}
