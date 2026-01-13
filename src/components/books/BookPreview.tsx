/**
 * @agent frontend-ux-ui
 * Composant de prévisualisation et édition des métadonnées d'un livre
 * avec 2 sections de couvertures : Recherche web (5 options) et Mes photos (max 3)
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, BookOpen, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoverUploader } from './CoverUploader';
import type { AggregatedBook } from '@/lib/book-aggregator';
import type { CoverOption } from '@/lib/cover-aggregator';

interface BookPreviewProps {
  book: AggregatedBook;
  onSave: (editedBook: CreateBookInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface CreateBookInput {
  isbn?: string;
  isbn13?: string;
  title: string;
  authors: string[];
  author: string;
  description?: string;
  coverImage?: string;
  thumbnail?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
  status?: 'TO_READ' | 'READING' | 'COMPLETED' | 'ABANDONED' | 'ON_HOLD';
  selectedImageSource?: 'web' | 'user'; // Pour distinguer la source de l'image sélectionnée
  selectedUserImageUrl?: string; // URL de l'image utilisateur si sélectionnée
}

const SOURCE_LABELS: Record<string, string> = {
  openlibrary: 'Open Library',
  librarything: 'LibraryThing',
  google: 'Google Books',
  isbndb: 'ISBNdb',
  database: 'Ma bibliothèque',
  user: 'Ma photo',
  babelio: 'Babelio',
  archive: 'Archive.org',
  'openlibrary-search': 'Open Library (recherche)',
};

const SOURCE_COLORS: Record<string, string> = {
  openlibrary:
    'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
  librarything:
    'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30',
  google:
    'bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30',
  isbndb:
    'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
  database:
    'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900/30',
  user: 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/30',
  babelio:
    'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
  archive:
    'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30',
  'openlibrary-search':
    'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30',
};

export function BookPreview({ book, onSave, onCancel, loading = false }: BookPreviewProps) {
  // Séparer les couvertures web et utilisateur
  const webCovers = book.coverOptions.filter((c) => c.source !== 'user').slice(0, 5);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'BookPreview.tsx:74',
      message: 'BookPreview initialized',
      data: {
        bookTitle: book.title,
        webCoversCount: webCovers.length,
        hasIsbn: !!book.isbn,
        hasIsbn13: !!book.isbn13,
        existingImagesCount: book.existingUserBookImages?.length || 0,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'H2',
    }),
  }).catch(() => {});
  // #endregion

  // Initialiser userImages avec les images existantes du livre (si le livre est déjà dans la bibliothèque)
  const initialUserImages: CoverOption[] = book.existingUserBookImages
    ? book.existingUserBookImages.slice(0, 3).map((img) => ({
        url: img.imageUrl,
        source: 'user' as const,
        quality: 'high' as const,
      }))
    : [];

  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>(webCovers[0]?.url || '');
  const [selectedSource, setSelectedSource] = useState<'web' | 'user'>('web');
  const [userImages, setUserImages] = useState<CoverOption[]>(initialUserImages);
  const [title, setTitle] = useState(book.title);
  const [authors, setAuthors] = useState<string[]>(book.authors);
  const [description, setDescription] = useState(book.description || '');
  const [publisher, setPublisher] = useState(book.publisher || '');
  const [publishedDate, setPublishedDate] = useState(book.publishedDate || '');
  const [pageCount, setPageCount] = useState(book.pageCount?.toString() || '');
  const [showUploader, setShowUploader] = useState(false);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:95',
        message: 'BookPreview useEffect - initial user images',
        data: {
          initialUserImagesCount: initialUserImages.length,
          userImagesCount: userImages.length,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H2',
      }),
    }).catch(() => {});
  }, []);
  // #endregion

  const handleSelectWebCover = (url: string) => {
    setSelectedCoverUrl(url);
    setSelectedSource('web');
  };

  const handleSelectUserCover = (url: string) => {
    setSelectedCoverUrl(url);
    setSelectedSource('user');
  };

  const handleUserUpload = (url: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:100',
        message: 'handleUserUpload called',
        data: { url, currentUserImagesCount: userImages.length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
    if (userImages.length >= 3) {
      alert('Limite de 3 images atteinte');
      return;
    }

    const userCover: CoverOption = {
      url,
      source: 'user',
      quality: 'high',
    };
    const newUserImages = [...userImages, userCover];
    setUserImages(newUserImages);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:112',
        message: 'handleUserUpload - userImages updated',
        data: { url, newUserImagesCount: newUserImages.length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
    setSelectedCoverUrl(url);
    setSelectedSource('user');
    setShowUploader(false);
  };

  const handleDeleteUserImage = (url: string) => {
    setUserImages(userImages.filter((img) => img.url !== url));
    // Si l'image supprimée était sélectionnée, sélectionner une autre image
    if (selectedCoverUrl === url && selectedSource === 'user') {
      if (userImages.length > 1) {
        const remainingImage = userImages.find((img) => img.url !== url);
        if (remainingImage) {
          setSelectedCoverUrl(remainingImage.url);
        } else if (webCovers.length > 0) {
          setSelectedCoverUrl(webCovers[0].url);
          setSelectedSource('web');
        }
      } else if (webCovers.length > 0) {
        setSelectedCoverUrl(webCovers[0].url);
        setSelectedSource('web');
      } else {
        setSelectedCoverUrl('');
      }
    }
  };

  const handleSave = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:138',
        message: 'handleSave called',
        data: {
          selectedSource,
          selectedCoverUrl,
          userImagesCount: userImages.length,
          hasSelectedUserImage: selectedSource === 'user',
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
    // Nettoyer publisher et categories avant envoi (au cas où ils seraient des objets)
    const cleanedPublisher =
      typeof book.publisher === 'string'
        ? book.publisher
        : (book.publisher as { name?: string } | undefined)?.name ||
          (book.publisher as any)?.[0]?.name ||
          undefined;

    const cleanedCategories = Array.isArray(book.categories)
      ? book.categories.map((cat: unknown) =>
          typeof cat === 'string'
            ? cat
            : (cat as { name?: string })?.name || (cat as { value?: string })?.value || String(cat)
        )
      : [];

    const bookData: CreateBookInput = {
      isbn: book.isbn,
      isbn13: book.isbn13,
      title,
      authors,
      author: authors[0] || 'Auteur inconnu',
      description: description || undefined,
      // Si image web, on la stocke dans coverImage. Si image user, on ne stocke pas dans Book
      coverImage: selectedSource === 'web' ? selectedCoverUrl : undefined,
      thumbnail: selectedSource === 'web' ? selectedCoverUrl : undefined,
      publisher: cleanedPublisher || publisher || undefined,
      publishedDate: publishedDate || undefined,
      pageCount: pageCount ? parseInt(pageCount) : undefined,
      categories: cleanedCategories.length > 0 ? cleanedCategories : undefined,
      selectedImageSource: selectedSource,
      selectedUserImageUrl: selectedSource === 'user' ? selectedCoverUrl : undefined,
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:163',
        message: 'handleSave - calling onSave',
        data: {
          selectedImageSource: bookData.selectedImageSource,
          selectedUserImageUrl: bookData.selectedUserImageUrl,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
    await onSave(bookData);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'BookPreview.tsx:166',
        message: 'handleSave - onSave completed',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="glass-card shadow-ios-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Aperçu du livre</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Vérifiez et modifiez les informations
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {SOURCE_LABELS[book.source] || book.source}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section Recherche web */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Recherche web ({webCovers.length}/5)</h3>

            <div className="grid grid-cols-5 gap-3">
              {webCovers.length === 0 ? (
                <div className="text-muted-foreground col-span-5 py-8 text-center text-sm">
                  Aucune couverture trouvée
                </div>
              ) : (
                webCovers.map((cover, index) => (
                  <motion.button
                    key={`web-${cover.url}-${index}`}
                    onClick={() => handleSelectWebCover(cover.url)}
                    className={cn(
                      'relative aspect-[2/3] min-h-[120px] overflow-hidden rounded-xl border-2 transition-all',
                      selectedCoverUrl === cover.url && selectedSource === 'web'
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'border-border/50 hover:border-border'
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={cover.url}
                      alt="Cover option"
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized
                      priority={index === 0}
                      onError={(e) => {
                        console.error('Image load error:', cover.url);
                      }}
                    />

                    {selectedCoverUrl === cover.url && selectedSource === 'web' && (
                      <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <Check className="text-primary-foreground h-5 w-5" />
                        </div>
                      </div>
                    )}

                    {/* Badge de provenance amélioré */}
                    <div className="absolute top-1.5 right-1.5 left-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
                          SOURCE_COLORS[cover.source] ||
                            'bg-muted/80 text-muted-foreground border-border'
                        )}
                        title={`Source: ${SOURCE_LABELS[cover.source] || cover.source}\nURL: ${cover.url}`}
                      >
                        {SOURCE_LABELS[cover.source] || cover.source}
                      </Badge>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Section Mes photos */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Mes photos ({userImages.length}/3)</h3>

            <div className="grid grid-cols-4 gap-3">
              {userImages.map((image, index) => (
                <motion.div
                  key={`user-${image.url}-${index}`}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <button
                    onClick={() => handleSelectUserCover(image.url)}
                    className={cn(
                      'relative aspect-[2/3] min-h-[120px] w-full overflow-hidden rounded-xl border-2 transition-all',
                      selectedCoverUrl === image.url && selectedSource === 'user'
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt="Ma photo"
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized
                    />

                    {selectedCoverUrl === image.url && selectedSource === 'user' && (
                      <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <Check className="text-primary-foreground h-5 w-5" />
                        </div>
                      </div>
                    )}

                    {/* Badge Ma photo */}
                    <div className="absolute top-1.5 right-1.5 left-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
                          SOURCE_COLORS.user
                        )}
                      >
                        Ma photo
                      </Badge>
                    </div>
                  </button>

                  {/* Bouton supprimer */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUserImage(image.url);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}

              {/* Slot pour upload user */}
              {userImages.length < 3 && !showUploader && (
                <button
                  onClick={() => setShowUploader(true)}
                  className="border-border/50 hover:border-primary/50 flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
                >
                  <Plus className="text-muted-foreground h-6 w-6" />
                  <span className="text-muted-foreground text-[10px]">Ajouter</span>
                </button>
              )}
            </div>

            {/* Uploader inline */}
            <AnimatePresence>
              {showUploader && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-secondary/30 mt-4 rounded-xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Ajouter votre couverture</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowUploader(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CoverUploader onUploadComplete={handleUserUpload} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator />

          {/* Section métadonnées éditables */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informations du livre</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Titre</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du livre"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Auteur(s)</label>
              <Input
                value={authors.join(', ')}
                onChange={(e) =>
                  setAuthors(
                    e.target.value
                      .split(',')
                      .map((a) => a.trim())
                      .filter((a) => a)
                  )
                }
                placeholder="Prénom Nom"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du livre..."
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Éditeur</label>
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Nom de l'éditeur"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Année</label>
                <Input
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  placeholder="2024"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre de pages</label>
              <Input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="432"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !title || authors.length === 0}
              className="flex-1 rounded-xl"
            >
              {loading ? (
                <>Ajout en cours...</>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ajouter à ma bibliothèque
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
