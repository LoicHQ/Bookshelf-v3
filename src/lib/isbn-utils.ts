/**
 * @agent backend-logic
 * Utilitaires pour la conversion et validation ISBN-10 ⟷ ISBN-13
 */

/**
 * Calcule le checksum ISBN-10
 */
function calculateISBN10Checksum(isbn9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn9[i]) * (10 - i);
  }
  const checksum = (11 - (sum % 11)) % 11;
  return checksum === 10 ? 'X' : checksum.toString();
}

/**
 * Calcule le checksum ISBN-13
 */
function calculateISBN13Checksum(isbn12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return ((10 - (sum % 10)) % 10).toString();
}

/**
 * Convertit ISBN-10 vers ISBN-13 (ajoute préfixe 978)
 */
export function convertISBN10to13(isbn10: string): string {
  const cleanISBN = isbn10.replace(/[-\s]/g, '');
  const isbn12 = '978' + cleanISBN.substring(0, 9);
  return isbn12 + calculateISBN13Checksum(isbn12);
}

/**
 * Convertit ISBN-13 vers ISBN-10 (uniquement si préfixe 978)
 */
export function convertISBN13to10(isbn13: string): string | null {
  const cleanISBN = isbn13.replace(/[-\s]/g, '');

  if (!cleanISBN.startsWith('978')) {
    return null; // ISBN-13 avec 979 n'ont pas d'équivalent ISBN-10
  }

  const isbn9 = cleanISBN.substring(3, 12);
  return isbn9 + calculateISBN10Checksum(isbn9);
}

/**
 * Normalise et retourne les deux formats
 */
export function normalizeISBN(input: string): {
  isbn10: string | null;
  isbn13: string | null;
  isValid: boolean;
} {
  let clean = input.replace(/[-\s]/g, '');

  // Correction erreur courante : ISBN-13 avec 0 en trop
  if (clean.length === 14 && clean.endsWith('0')) {
    clean = clean.slice(0, 13);
  }

  // Vérifier que ce sont uniquement des chiffres (ou X pour ISBN-10)
  if (!/^[\dX]+$/i.test(clean)) {
    return { isbn10: null, isbn13: null, isValid: false };
  }

  if (clean.length === 10) {
    return {
      isbn10: clean,
      isbn13: convertISBN10to13(clean),
      isValid: true,
    };
  }

  if (clean.length === 13) {
    return {
      isbn10: convertISBN13to10(clean),
      isbn13: clean,
      isValid: true,
    };
  }

  return { isbn10: null, isbn13: null, isValid: false };
}
