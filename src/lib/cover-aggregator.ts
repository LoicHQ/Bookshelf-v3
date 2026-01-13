/**
 * @agent backend-logic
 * Agrégateur de couvertures depuis multiples sources légales
 */

export interface CoverOption {
  url: string;
  source:
    | 'openlibrary'
    | 'librarything'
    | 'google'
    | 'isbndb'
    | 'database'
    | 'user'
    | 'babelio'
    | 'archive'
    | 'openlibrary-search';
  quality: 'low' | 'medium' | 'high';
  fetchMethod?: 'isbn' | 'title-author';
  width?: number;
  height?: number;
}

/**
 * Récupère jusqu'à 4 options de couvertures depuis différentes sources
 * (On garde 1 slot pour upload utilisateur)
 */
export async function fetchCoverOptions(
  isbn13: string | null,
  isbn10: string | null,
  title?: string
): Promise<CoverOption[]> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'cover-aggregator.ts:20',
      message: 'fetchCoverOptions entry',
      data: { isbn13, isbn10, title },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion
  const covers: CoverOption[] = [];
  const targetISBN = isbn13 || isbn10;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'cover-aggregator.ts:26',
      message: 'targetISBN determined',
      data: { targetISBN },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion

  if (!targetISBN) {
    return covers;
  }

  // 1. Open Library (priorité 1 - toujours des couvertures plates)
  // Note: Open Library retourne parfois des placeholders blancs
  // On vérifie que l'image est valide avant de l'ajouter
  try {
    // Utiliser l'API Open Library directement pour obtenir l'ID de couverture
    const olApiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${targetISBN}&format=json&jscmd=data`;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'cover-aggregator.ts:37',
        message: 'Before Open Library API call',
        data: { olApiUrl },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    const apiResponse = await fetch(olApiUrl);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'cover-aggregator.ts:39',
        message: 'Open Library API response',
        data: { ok: apiResponse.ok, status: apiResponse.status },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      const olBook = data[`ISBN:${targetISBN}`];
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'cover-aggregator.ts:42',
          message: 'Open Library book data',
          data: { hasOlBook: !!olBook, hasCovers: !!olBook?.covers, coverId: olBook?.covers?.[0] },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A',
        }),
      }).catch(() => {});
      // #endregion
      if (olBook?.covers?.[0]) {
        // Utiliser l'ID de couverture de l'API plutôt que l'ISBN (évite les placeholders blancs)
        const coverIdUrl = `https://covers.openlibrary.org/b/id/${olBook.covers[0]}-L.jpg`;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'cover-aggregator.ts:45',
            message: 'Before image validation',
            data: { coverIdUrl },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        }).catch(() => {});
        // #endregion
        // Vérifier que l'image n'est pas un placeholder blanc en téléchargeant les premiers bytes
        const imageCheckResponse = await fetch(coverIdUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-1023' },
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'cover-aggregator.ts:47',
            message: 'Image check response',
            data: { ok: imageCheckResponse.ok, status: imageCheckResponse.status },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        }).catch(() => {});
        // #endregion
        if (imageCheckResponse.ok) {
          const buffer = await imageCheckResponse.arrayBuffer();
          const size = buffer.byteLength;
          const contentLength = imageCheckResponse.headers.get('content-length');
          const totalSize = contentLength ? parseInt(contentLength, 10) : size;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'cover-aggregator.ts:52',
              message: 'Image size validation',
              data: {
                size,
                totalSize,
                contentLength,
                passesValidation: size > 5000 || totalSize > 5000,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'B',
            }),
          }).catch(() => {});
          // #endregion
          // Les placeholders blancs font généralement moins de 2KB, les vraies images font au moins 5KB
          // Si la taille est raisonnable (> 5KB) ou si on a récupéré au moins 1KB, c'est probablement valide
          if (
            size > 5000 ||
            (imageCheckResponse.headers.get('content-length') &&
              parseInt(imageCheckResponse.headers.get('content-length') || '0', 10) > 5000)
          ) {
            covers.push({
              url: coverIdUrl,
              source: 'openlibrary',
              quality: 'high',
              fetchMethod: 'isbn',
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'cover-aggregator.ts:58',
                message: 'Open Library cover added',
                data: { coverIdUrl, coversCount: covers.length },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'B',
              }),
            }).catch(() => {});
            // #endregion
          }
        }
      }
      // Note: On ne fait plus de fallback avec l'ISBN directement car cela retourne souvent des placeholders blancs
    }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'cover-aggregator.ts:65',
        message: 'Open Library error',
        data: { error: String(error) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    console.error('Open Library cover fetch failed:', error);
  }

  // 2. LibraryThing (priorité 2 - nécessite clé API)
  try {
    const ltKey = process.env.LIBRARYTHING_API_KEY;
    if (ltKey) {
      const ltUrl = `http://covers.librarything.com/devkey/${ltKey}/large/isbn/${targetISBN}`;
      const response = await fetch(ltUrl, { method: 'HEAD' });
      if (response.ok) {
        covers.push({
          url: ltUrl,
          source: 'librarything',
          quality: 'high',
          fetchMethod: 'isbn',
        });
      }
    }
  } catch (error) {
    console.error('LibraryThing cover fetch failed:', error);
  }

  // 3. Google Books (déjà dans fetchBookByISBN, sera ajouté depuis les résultats existants)

  // 4. ISBNdb (si quota disponible et clé API présente)
  try {
    const isbndbKey = process.env.ISBNDB_API_KEY;
    if (isbndbKey) {
      const response = await fetch(`https://api2.isbndb.com/book/${targetISBN}`, {
        headers: { Authorization: isbndbKey },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.book?.image) {
          covers.push({
            url: data.book.image,
            source: 'isbndb',
            quality: 'high',
            fetchMethod: 'isbn',
          });
        }
      }
    }
  } catch (error) {
    console.error('ISBNdb cover fetch failed:', error);
  }

  // Limiter à 4 options max (on garde 1 place pour upload user)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'cover-aggregator.ts:114',
      message: 'fetchCoverOptions exit',
      data: {
        coversCount: covers.length,
        covers: covers.map((c) => ({ source: c.source, url: c.url })),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion
  return covers.slice(0, 4);
}

/**
 * Filtre pour garder uniquement les couvertures plates (ratio 1.4-1.65)
 * Les couvertures en perspective 3D ont généralement des ratios différents
 */
export function filterFlatCovers(covers: CoverOption[]): CoverOption[] {
  return covers.filter((cover) => {
    if (!cover.width || !cover.height) return true; // Garder si dimensions inconnues
    const ratio = cover.height / cover.width;
    return ratio >= 1.4 && ratio <= 1.65;
  });
}
