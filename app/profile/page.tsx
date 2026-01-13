'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  MessageSquare,
  Download,
  Share2,
  Award,
  BookOpen,
  Target,
  Flame,
  Star,
  BookCheck,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { UserBook } from '@/types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Award;
  color: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const router = useRouter();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetchData();
    // Check dark mode
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const completed = books.filter((b) => b.status === 'COMPLETED' && !b.isWishlist).length;
    const pagesRead = books
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.book?.pageCount || 0), 0);
    const avgRating = books
      .filter((b) => b.rating)
      .reduce((sum, b, _, arr) => sum + (b.rating || 0) / arr.length, 0);

    return { completed, pagesRead, avgRating: avgRating.toFixed(1) };
  }, [books]);

  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: 'first-book',
        name: 'Premier pas',
        description: 'Ajouter votre premier livre',
        icon: BookOpen,
        color: 'text-primary bg-primary/10',
        unlocked: books.length > 0,
      },
      {
        id: 'bookworm',
        name: 'Rat de bibliothèque',
        description: 'Lire 10 livres',
        icon: BookCheck,
        color: 'text-success bg-success/10',
        unlocked: stats.completed >= 10,
        progress: stats.completed,
        target: 10,
      },
      {
        id: 'voracious',
        name: 'Lecteur vorace',
        description: 'Lire 50 livres',
        icon: Trophy,
        color: 'text-warning bg-warning/10',
        unlocked: stats.completed >= 50,
        progress: stats.completed,
        target: 50,
      },
      {
        id: 'page-turner',
        name: 'Tourne-pages',
        description: 'Lire 5000 pages',
        icon: Sparkles,
        color: 'text-info bg-info/10',
        unlocked: stats.pagesRead >= 5000,
        progress: stats.pagesRead,
        target: 5000,
      },
      {
        id: 'critic',
        name: 'Critique littéraire',
        description: 'Noter 20 livres',
        icon: Star,
        color: 'text-yellow-500 bg-yellow-500/10',
        unlocked: books.filter((b) => b.rating).length >= 20,
        progress: books.filter((b) => b.rating).length,
        target: 20,
      },
      {
        id: 'streak',
        name: 'En feu',
        description: '7 jours de lecture consécutifs',
        icon: Flame,
        color: 'text-orange-500 bg-orange-500/10',
        unlocked: false,
      },
    ],
    [books, stats]
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleExport = async () => {
    const data = {
      exportDate: new Date().toISOString(),
      books: books.map((b) => ({
        title: b.book?.title,
        authors: b.book?.authors,
        status: b.status,
        rating: b.rating,
        startDate: b.startDate,
        endDate: b.endDate,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookshelf-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma bibliothèque BookShelf',
          text: `J'ai lu ${stats.completed} livres sur BookShelf ! Rejoignez-moi !`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.div
      className="bg-background min-h-screen pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Profile Header */}
      <motion.header variants={item} className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-4">
          <Avatar className="ring-primary/20 h-20 w-20 ring-4">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Lecteur</h1>
            <p className="text-muted-foreground">Membre depuis 2024</p>
          </div>
        </div>
      </motion.header>

      {/* Quick Stats */}
      <motion.div variants={item} className="mb-6 px-5">
        <Card className="card-ios">
          <CardContent className="p-0">
            <div className="divide-border grid grid-cols-3 divide-x">
              <div className="p-4 text-center">
                <p className="text-primary text-2xl font-bold">{stats.completed}</p>
                <p className="text-muted-foreground text-xs">Livres lus</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-success text-2xl font-bold">
                  {stats.pagesRead.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs">Pages</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-warning text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-muted-foreground text-xs">Note moy.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.section variants={item} className="mb-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Award className="text-warning h-5 w-5" />
            Badges
          </h2>
          <span className="text-muted-foreground text-sm">
            {unlockedCount}/{achievements.length} débloqués
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative rounded-2xl p-4 text-center transition-all',
                  achievement.unlocked ? 'bg-card shadow-sm' : 'bg-muted/50 opacity-50'
                )}
              >
                <div
                  className={cn(
                    'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full',
                    achievement.unlocked ? achievement.color : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn('h-6 w-6', achievement.unlocked ? '' : 'text-muted-foreground')}
                  />
                </div>
                <p className="line-clamp-1 text-xs font-medium">{achievement.name}</p>
                {achievement.progress !== undefined &&
                  achievement.target &&
                  !achievement.unlocked && (
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {achievement.progress}/{achievement.target}
                    </p>
                  )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Actions */}
      <motion.section variants={item} className="mb-6 px-5">
        <h2 className="mb-3 font-semibold">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="h-auto flex-col gap-2 rounded-2xl py-4"
          >
            <Share2 className="text-primary h-5 w-5" />
            <span className="text-sm">Partager</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-auto flex-col gap-2 rounded-2xl py-4"
          >
            <Download className="text-success h-5 w-5" />
            <span className="text-sm">Exporter</span>
          </Button>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section variants={item} className="px-5">
        <h2 className="mb-3 font-semibold">Paramètres</h2>
        <Card className="card-ios">
          <CardContent className="divide-border divide-y p-0">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="text-muted-foreground h-5 w-5" />
                ) : (
                  <Sun className="text-muted-foreground h-5 w-5" />
                )}
                <span>Mode sombre</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="text-muted-foreground h-5 w-5" />
                <span>Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <Separator />

            {/* Links */}
            <button className="hover:bg-secondary/50 flex w-full items-center justify-between p-4 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="text-muted-foreground h-5 w-5" />
                <span>Confidentialité</span>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </button>

            <button className="hover:bg-secondary/50 flex w-full items-center justify-between p-4 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-muted-foreground h-5 w-5" />
                <span>Aide & Support</span>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </button>

            <button className="hover:bg-secondary/50 flex w-full items-center justify-between p-4 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-muted-foreground h-5 w-5" />
                <span>Nous contacter</span>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-4 h-12 w-full rounded-2xl"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>

        {/* Version */}
        <p className="text-muted-foreground mt-6 text-center text-xs">
          BookShelf v2.0.0 • Made with ❤️
        </p>
      </motion.section>
    </motion.div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <header className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </header>
      <div className="space-y-6 px-5">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div>
          <Skeleton className="mb-3 h-5 w-20" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
