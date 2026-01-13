'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Sparkles,
  Calendar,
  BookMarked
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserBook } from '@/types';

interface DashboardData {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  currentlyReading: UserBook[];
  recentlyAdded: UserBook[];
  stats: {
    totalBooks: number;
    booksThisYear: number;
    pagesRead: number;
    readingStreak: number;
  };
  goal: {
    target: number;
    current: number;
  } | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const result = await response.json();
        const books: UserBook[] = result.books || [];
        
        const currentYear = new Date().getFullYear();
        const booksThisYear = books.filter(
          (b: UserBook) => b.status === 'COMPLETED' && 
          b.endDate && new Date(b.endDate).getFullYear() === currentYear
        ).length;

        setData({
          user: {
            name: 'Lecteur',
            email: '',
            image: null,
          },
          currentlyReading: books.filter((b: UserBook) => b.status === 'READING').slice(0, 3),
          recentlyAdded: books.slice(0, 5),
          stats: {
            totalBooks: books.length,
            booksThisYear,
            pagesRead: books.reduce((acc: number, b: UserBook) => acc + (b.book?.pageCount || 0), 0),
            readingStreak: 0,
          },
          goal: {
            target: 24,
            current: booksThisYear,
          },
        });
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return null;
  }

  const goalProgress = data.goal ? (data.goal.current / data.goal.target) * 100 : 0;

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header 
        variants={item}
        className="px-5 pt-safe-area-top pt-4 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-sm">{getGreeting()}</p>
            <h1 className="title-large">{data.user.name || 'Lecteur'}</h1>
          </div>
          <Link href="/profile">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={data.user.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {(data.user.name || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </motion.header>

      <div className="px-5 space-y-6 pb-6">
        {/* Reading Goal Card */}
        {data.goal && (
          <motion.div variants={item}>
            <Card className="card-ios overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Objectif {new Date().getFullYear()}</h3>
                      <p className="text-sm text-muted-foreground">
                        {data.goal.current} / {data.goal.target} livres
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(goalProgress)}%
                  </span>
                </div>
                <Progress value={goalProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Plus que {data.goal.target - data.goal.current} livres pour atteindre votre objectif !
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Currently Reading */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-warning" />
              En cours de lecture
            </h2>
            <Link 
              href="/library?filter=READING" 
              className="text-sm text-primary flex items-center"
            >
              Tout voir
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {data.currentlyReading.length > 0 ? (
            <div className="space-y-3">
              {data.currentlyReading.map((userBook, index) => (
                <Link key={userBook.id} href={`/book/${userBook.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-ios haptic-light">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {userBook.book?.coverImage || userBook.book?.thumbnail ? (
                              <Image
                                src={userBook.book.coverImage || userBook.book.thumbnail || ''}
                                alt={userBook.book?.title || ''}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <BookMarked className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-1">
                              {userBook.book?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {userBook.book?.authors?.join(', ')}
                            </p>
                            {userBook.currentPage && userBook.book?.pageCount && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Page {userBook.currentPage}</span>
                                  <span>{Math.round((userBook.currentPage / userBook.book.pageCount) * 100)}%</span>
                                </div>
                                <Progress 
                                  value={(userBook.currentPage / userBook.book.pageCount) * 100} 
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="card-ios">
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucun livre en cours</p>
                <Link 
                  href="/library" 
                  className="text-sm text-primary mt-2 inline-block"
                >
                  Commencer à lire
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Quick Stats */}
        <motion.section variants={item}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Statistiques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="card-ios">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {data.stats.totalBooks}
                </div>
                <p className="text-sm text-muted-foreground">Livres total</p>
              </CardContent>
            </Card>
            <Card className="card-ios">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-success">
                  {data.stats.booksThisYear}
                </div>
                <p className="text-sm text-muted-foreground">Cette année</p>
              </CardContent>
            </Card>
            <Card className="card-ios">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-warning">
                  {data.stats.pagesRead.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Pages lues</p>
              </CardContent>
            </Card>
            <Card className="card-ios">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-info">
                  {data.stats.readingStreak}
                </div>
                <p className="text-sm text-muted-foreground">Jours consécutifs</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Recently Added */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Ajoutés récemment
            </h2>
            <Link 
              href="/library" 
              className="text-sm text-primary flex items-center"
            >
              Tout voir
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {data.recentlyAdded.map((userBook, index) => (
              <Link key={userBook.id} href={`/book/${userBook.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-28"
                >
                  <div className="relative h-40 w-28 overflow-hidden rounded-xl bg-muted shadow-md">
                    {userBook.book?.coverImage || userBook.book?.thumbnail ? (
                      <Image
                        src={userBook.book.coverImage || userBook.book.thumbnail || ''}
                        alt={userBook.book?.title || ''}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookMarked className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2 line-clamp-2">
                    {userBook.book?.title}
                  </p>
                </motion.div>
              </Link>
            ))}
            {data.recentlyAdded.length === 0 && (
              <Card className="card-ios w-full">
                <CardContent className="py-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Aucun livre ajouté</p>
                  <Link 
                    href="/scanner" 
                    className="text-sm text-primary mt-2 inline-block"
                  >
                    Scanner un livre
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={item}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/scanner">
              <Card className="card-ios haptic-light hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Scanner un livre</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/library?tab=wishlist">
              <Card className="card-ios haptic-light hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-warning" />
                  </div>
                  <span className="font-medium">Ma wishlist</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </header>
      <div className="px-5 space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
