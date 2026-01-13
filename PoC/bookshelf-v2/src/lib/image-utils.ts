/**
 * Utilitaires pour la gestion des images de couverture de livres
 */

export type ImageSource = 'google' | 'openlibrary' | 'isbndb' | 'default';

/**
 * Améliore l'URL d'image Google Books pour obtenir une qualité maximale
 * @param url URL de l'image Google Books
 * @param zoom Niveau de zoom (0-5, 2 = haute qualité recommandée)
 * @returns URL optimisée
 */
export function enhanceGoogleBooksImage(url: string, zoom: number = 2): string {
  if (!url) return url;

  // Remplace les paramètres de zoom existants ou ajoute zoom=2 pour haute qualité
  const urlObj = new URL(url);
  urlObj.searchParams.set('zoom', zoom.toString());

  // Force HTTPS
  urlObj.protocol = 'https:';

  return urlObj.toString();
}

/**
 * Génère l'URL Open Library avec la taille souhaitée
 * @param coverId ID de la couverture Open Library
 * @param size Taille: 'S' (small), 'M' (medium), 'L' (large)
 * @returns URL de l'image
 */
export function getOpenLibraryImageUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

/**
 * Valide qu'une URL d'image est accessible
 * @param url URL à valider
 * @returns true si l'image est accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Récupère la meilleure URL d'image disponible parmi plusieurs options
 * @param urls Liste d'URLs à tester (par ordre de préférence)
 * @returns URL de la première image accessible, ou undefined
 */
export async function getBestImageUrl(urls: (string | undefined)[]): Promise<string | undefined> {
  for (const url of urls) {
    if (!url) continue;
    if (await validateImageUrl(url)) {
      return url;
    }
  }
  return undefined;
}

/**
 * URL de l'image par défaut (placeholder)
 */
export function getDefaultBookCover(): string {
  return '/images/book-placeholder.svg';
}
