'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  BookOpen,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  MoreHorizontal,
  BookMarked,
  Quote,
  StickyNote,
  Highlighter,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { UserBook, BookStatus, BookNote, NoteType } from '@/types';

const STATUS_OPTIONS: { value: BookStatus; label: string; color: string }[] = [
  { value: 'TO_READ', label: 'À lire', color: 'bg-muted' },
  { value: 'READING', label: 'En cours', color: 'bg-warning' },
  { value: 'COMPLETED', label: 'Lu', color: 'bg-success' },
  { value: 'ON_HOLD', label: 'En pause', color: 'bg-info' },
  { value: 'ABANDONED', label: 'Abandonné', color: 'bg-destructive' },
];

const NOTE_TYPES: { value: NoteType; label: string; icon: typeof StickyNote }[] = [
  { value: 'NOTE', label: 'Note', icon: StickyNote },
  { value: 'QUOTE', label: 'Citation', icon: Quote },
  { value: 'HIGHLIGHT', label: 'Passage', icon: Highlighter },
];

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  const [newNote, setNewNote] = useState('');
  const [newNotePage, setNewNotePage] = useState('');
  const [newNoteType, setNewNoteType] = useState<NoteType>('NOTE');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [editingProgress, setEditingProgress] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBookDetails();
    }
  }, [params.id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserBook(data);
        setCurrentPage(data.currentPage?.toString() || '');
      } else if (response.status === 401) {
        router.push('/login');
      } else if (response.status === 404) {
        router.push('/library');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: BookStatus) => {
    if (!userBook) return;
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setUserBook({ ...userBook, status });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!userBook) return;
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (response.ok) {
        setUserBook({ ...userBook, rating });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!userBook) return;
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !userBook.favorite }),
      });
      if (response.ok) {
        setUserBook({ ...userBook, favorite: !userBook.favorite });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleProgressUpdate = async () => {
    if (!userBook || !currentPage) return;
    const page = parseInt(currentPage);
    if (isNaN(page) || page < 0) return;

    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPage: page }),
      });
      if (response.ok) {
        setUserBook({ ...userBook, currentPage: page });
        setEditingProgress(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce livre de votre bibliothèque ?')) return;
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/library');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleShare = async () => {
    if (!userBook?.book) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: userBook.book.title,
          text: `Je lis "${userBook.book.title}" par ${userBook.book.authors?.join(', ')}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (!userBook || !userBook.book) {
    return null;
  }

  const book = userBook.book;
  const progress = userBook.currentPage && book.pageCount
    ? Math.min((userBook.currentPage / book.pageCount) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header with Blur Background */}
      <div className="relative">
        {/* Blurred Background */}
        <div className="absolute inset-0 h-72 overflow-hidden">
          {book.coverImage || book.thumbnail ? (
            <Image
              src={book.coverImage || book.thumbnail || ''}
              alt=""
              fill
              className="object-cover scale-110 blur-3xl opacity-30"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-primary/20 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm"
            >
              <Heart className={cn('h-5 w-5', userBook.favorite && 'fill-red-500 text-red-500')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit3 className="h-4 w-4 mr-2" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Book Cover and Info */}
        <div className="relative z-10 px-5 pb-6">
          <div className="flex gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-48 w-32 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl"
            >
              {book.coverImage || book.thumbnail ? (
                <Image
                  src={book.coverImage || book.thumbnail || ''}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <BookMarked className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </motion.div>
            <div className="flex-1 min-w-0 pt-4">
              <h1 className="text-xl font-bold line-clamp-3 mb-1">{book.title}</h1>
              <p className="text-muted-foreground mb-3">{book.authors?.join(', ')}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        'h-5 w-5 transition-colors',
                        star <= (userBook.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Status Selector */}
              <Select value={userBook.status} onValueChange={(v) => handleStatusChange(v as BookStatus)}>
                <SelectTrigger className="w-full h-9 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Progress */}
      {userBook.status === 'READING' && book.pageCount && (
        <div className="px-5 mb-6">
          <Card className="card-ios">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              {editingProgress ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(e.target.value)}
                    placeholder="Page actuelle"
                    className="h-9 flex-1"
                    min={0}
                    max={book.pageCount}
                  />
                  <span className="text-sm text-muted-foreground">/ {book.pageCount}</span>
                  <Button size="sm" onClick={handleProgressUpdate}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingProgress(true)}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Page {userBook.currentPage || 0} sur {book.pageCount}
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-secondary/50 rounded-xl mb-4">
            <TabsTrigger value="info" className="rounded-lg text-sm">Infos</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-lg text-sm">Notes</TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg text-sm">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Description */}
            {book.description && (
              <Card className="card-ios">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="rounded-full">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              {book.pageCount && (
                <Card className="card-ios">
                  <CardContent className="p-4 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pages</p>
                      <p className="font-semibold">{book.pageCount}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {book.publishedDate && (
                <Card className="card-ios">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Publication</p>
                      <p className="font-semibold">{book.publishedDate}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {/* Add Note Button */}
            {!showNoteForm ? (
              <Button
                onClick={() => setShowNoteForm(true)}
                variant="outline"
                className="w-full rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter une note
              </Button>
            ) : (
              <Card className="card-ios">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-2">
                    {NOTE_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setNewNoteType(type.value)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors',
                            newNoteType === type.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Écrivez votre note..."
                    className="min-h-24 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newNotePage}
                      onChange={(e) => setNewNotePage(e.target.value)}
                      placeholder="Page (optionnel)"
                      className="w-32"
                    />
                    <div className="flex-1" />
                    <Button variant="ghost" onClick={() => setShowNoteForm(false)}>
                      Annuler
                    </Button>
                    <Button disabled={!newNote.trim()}>
                      Enregistrer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes List */}
            {notes.length === 0 && !showNoteForm ? (
              <div className="text-center py-12">
                <StickyNote className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Aucune note pour ce livre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => {
                  const TypeIcon = NOTE_TYPES.find(t => t.value === note.type)?.icon || StickyNote;
                  return (
                    <Card key={note.id} className="card-ios">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            {note.page && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Page {note.page}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-3">
            <Card className="card-ios">
              <CardContent className="p-0 divide-y divide-border">
                {book.publisher && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">Éditeur</span>
                    <span className="font-medium">{book.publisher}</span>
                  </div>
                )}
                {book.isbn13 && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">ISBN-13</span>
                    <span className="font-medium font-mono">{book.isbn13}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">ISBN-10</span>
                    <span className="font-medium font-mono">{book.isbn}</span>
                  </div>
                )}
                {book.language && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">Langue</span>
                    <span className="font-medium">{book.language}</span>
                  </div>
                )}
                {userBook.startDate && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">Début lecture</span>
                    <span className="font-medium">
                      {new Date(userBook.startDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {userBook.endDate && (
                  <div className="flex justify-between p-4">
                    <span className="text-muted-foreground">Fin lecture</span>
                    <span className="font-medium">
                      {new Date(userBook.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-72 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <header className="relative z-10 flex items-center justify-between p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <div className="relative z-10 px-5 pb-6">
          <div className="flex gap-5">
            <Skeleton className="h-48 w-32 rounded-2xl" />
            <div className="flex-1 pt-4 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
