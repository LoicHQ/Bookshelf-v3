/**
 * @agent backend-logic
 * Orchestrateur d'agrégation de métadonnées et couvertures de livres
 */
import { searchGoogleBooks } from './books-api';
import { fetchCoverOptions, type CoverOption } from './cover-aggregator';
import { fetchWebCovers } from './web-cover-scraper';
import { normalizeISBN } from './isbn-utils';
import { searchBookInDatabase } from './db-book-search';
import type { BookSearchResult } from '@/types';

export interface AggregatedBook extends BookSearchResult {
  coverOptions: CoverOption[];
  source: 'database' | 'google' | 'openlibrary';
  existingUserBookImages?: Array<{
    id: string;
    imageUrl: string;
    source: string;
    createdAt: Date;
  }>;
}

/**
 * Agrège métadonnées et couvertures depuis toutes les sources
 * 1. Recherche en BDD locale (prioritaire)
 * 2. Google Books pour métadonnées
 * 3. Open Library en fallback
 * 4. Agrège 4 couvertures depuis différentes sources
 */
export async function aggregateBookData(isbn: string): Promise<AggregatedBook | null> {
  const { isbn10, isbn13, isValid } = normalizeISBN(isbn);

  if (!isValid) {
    throw new Error(`ISBN invalide: "${isbn}"`);
  }

  // 1. Recherche en BDD d'abord
  const dbBook = await searchBookInDatabase(isbn10, isbn13);
  if (dbBook) {
    // Récupérer les couvertures depuis toutes les sources (même si le livre est en BDD)
    // 1. Couverture de la BDD si disponible
    const allCovers: CoverOption[] = [];
    if (dbBook.coverImage) {
      allCovers.push({
        url: dbBook.coverImage,
        source: 'database' as const,
        quality: 'high' as const,
        fetchMethod: 'isbn' as const,
      });
    }

    // 2. Essayer Google Books pour obtenir une couverture
    try {
      const googleResults = await searchGoogleBooks(`isbn:${isbn13 || isbn10}`, 1);
      if (googleResults[0]?.coverImage) {
        allCovers.push({
          url: googleResults[0].coverImage,
          source: 'google' as const,
          quality: 'medium' as const,
          fetchMethod: 'isbn' as const,
        });
      }
    } catch (error) {
      // Erreur silencieuse - on continue avec les autres sources
    }

    // 3. Récupérer les couvertures alternatives (Open Library, etc.)
    const coverOptions = await fetchCoverOptions(isbn13, isbn10, dbBook.title);
    allCovers.push(...coverOptions);

    // 4. Fallback web scraping si < 4 couvertures (on veut 4 max, mais on garde 1 place pour upload user)
    if (allCovers.length < 4 && dbBook.title && dbBook.authors?.[0]) {
      const targetCount = 4 - allCovers.length; // Nombre de couvertures manquantes pour atteindre 4
      const webCovers = await fetchWebCovers(dbBook.title, dbBook.authors[0], targetCount);
      allCovers.push(...webCovers);
    }

    // Prioriser : 3 web + 2 API (ratio souhaité)
    const webSources = ['babelio', 'archive', 'openlibrary-search'];
    const webCovers = allCovers.filter((c) => webSources.includes(c.source)).slice(0, 3);
    const apiCovers = allCovers.filter((c) => !webSources.includes(c.source)).slice(0, 2);

    // Combiner en donnant priorité aux couvertures web
    const prioritizedCovers = [...webCovers, ...apiCovers];

    // Si on a moins de 5 couvertures, compléter avec les restantes
    if (prioritizedCovers.length < 5) {
      const remaining = allCovers.filter((c) => !prioritizedCovers.includes(c));
      prioritizedCovers.push(...remaining.slice(0, 5 - prioritizedCovers.length));
    }

    // Dédupliquer par URL
    const uniqueCovers = Array.from(
      new Map(prioritizedCovers.map((c) => [c.url, c])).values()
    ).slice(0, 4); // Garder 4 (1 place pour upload user)

    return {
      ...dbBook,
      coverOptions: uniqueCovers,
      source: 'database',
    };
  }

  // 2. Recherche Google Books (métadonnées prioritaires)
  let bookData: BookSearchResult | null = null;
  try {
    const results = await searchGoogleBooks(`isbn:${isbn13 || isbn10}`, 1);
    bookData = results[0] || null;
  } catch (error) {
    // Erreur silencieuse - on continue avec Open Library
  }

  // 3. Fallback Open Library si Google Books échoue
  if (!bookData) {
    try {
      // On utilise directement l'API Open Library
      const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13 || isbn10}&format=json&jscmd=data`;
      const response = await fetch(olUrl);
      if (response.ok) {
        const data = await response.json();
        const olBook = data[`ISBN:${isbn13 || isbn10}`];
        if (olBook) {
          // Extraire publisher (peut être string ou objet avec name)
          const publisher = olBook.publishers?.[0];
          const publisherString =
            typeof publisher === 'string' ? publisher : publisher?.name || undefined;

          // Extraire categories (peut être string[] ou objet[] avec name)
          const categories =
            olBook.subjects
              ?.slice(0, 5)
              .map((subj: any) =>
                typeof subj === 'string' ? subj : subj?.name || subj?.value || String(subj)
              ) || [];

          bookData = {
            id: `ol-${isbn13 || isbn10}`,
            title: olBook.title,
            authors: olBook.authors?.map((a: any) => a.name) || [],
            description:
              typeof olBook.description === 'string'
                ? olBook.description
                : olBook.description?.value,
            publishedDate: olBook.publish_date,
            publisher: publisherString,
            pageCount: olBook.number_of_pages,
            categories,
            isbn: isbn10 || undefined,
            isbn13: isbn13 || undefined,
            coverImage: olBook.covers?.[0]
              ? `https://covers.openlibrary.org/b/id/${olBook.covers[0]}-L.jpg`
              : undefined,
            thumbnail: olBook.covers?.[0]
              ? `https://covers.openlibrary.org/b/id/${olBook.covers[0]}-M.jpg`
              : undefined,
          };
        }
      }
    } catch (error) {
      // Erreur silencieuse - on retourne null
    }
  }

  if (!bookData) return null;

  // 4. Récupérer toutes les options de couvertures
  const coverOptions = await fetchCoverOptions(isbn13, isbn10, bookData.title);

  // 5. Ajouter couverture Google Books si disponible (et valide)
  const allCovers: CoverOption[] = [];

  if (bookData.coverImage) {
    // Vérifier que l'image Google Books n'est pas un placeholder blanc
    try {
      const imageCheckResponse = await fetch(bookData.coverImage, {
        method: 'GET',
        headers: { Range: 'bytes=0-1023' },
      });
      if (imageCheckResponse.ok) {
        const buffer = await imageCheckResponse.arrayBuffer();
        const size = buffer.byteLength;
        const contentLength = imageCheckResponse.headers.get('content-length');
        const totalSize = contentLength ? parseInt(contentLength, 10) : size;
        // Les vraies images font généralement plus de 2KB
        if (totalSize > 2000 || size > 1000) {
          allCovers.push({
            url: bookData.coverImage,
            source: 'google',
            quality: 'medium',
            fetchMethod: 'isbn',
          });
        }
      }
    } catch (error) {
      // Si la validation échoue, on n'ajoute pas l'image (peut être un placeholder)
    }
  }

  allCovers.push(...coverOptions);

  // 6. Fallback web scraping si < 5 couvertures (on veut 5 max, mais on garde 1 place pour upload user = 4)
  if (allCovers.length < 4 && bookData.title && bookData.authors?.[0]) {
    const targetCount = 4 - allCovers.length; // Nombre de couvertures manquantes pour atteindre 4
    const webCovers = await fetchWebCovers(bookData.title, bookData.authors[0], targetCount);
    allCovers.push(...webCovers);
  }

  // 7. Prioriser : 3 web + 2 API (ratio souhaité)
  const webSources = ['babelio', 'archive', 'openlibrary-search'];
  const webCovers = allCovers.filter((c) => webSources.includes(c.source)).slice(0, 3);
  const apiCovers = allCovers.filter((c) => !webSources.includes(c.source)).slice(0, 2);

  // Combiner en donnant priorité aux couvertures web
  const prioritizedCovers = [...webCovers, ...apiCovers];

  // Si on a moins de 5 couvertures, compléter avec les restantes
  if (prioritizedCovers.length < 5) {
    const remaining = allCovers.filter((c) => !prioritizedCovers.includes(c));
    prioritizedCovers.push(...remaining.slice(0, 5 - prioritizedCovers.length));
  }

  // Dédupliquer par URL
  const uniqueCovers = Array.from(new Map(prioritizedCovers.map((c) => [c.url, c])).values()).slice(
    0,
    4
  ); // Garder 4 (1 place pour upload user)

  return {
    ...bookData,
    coverOptions: uniqueCovers,
    source: bookData.coverImage ? 'google' : 'openlibrary',
  };
}
