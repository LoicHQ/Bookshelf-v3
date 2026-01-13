'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  BookCheck,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserBook } from '@/types';

const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];
const CHART_COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5ac8fa'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StatsPage() {
  const router = useRouter();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
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
    const completedBooks = books.filter((b) => b.status === 'COMPLETED' && !b.isWishlist);
    const readingBooks = books.filter((b) => b.status === 'READING' && !b.isWishlist);
    const allBooks = books.filter((b) => !b.isWishlist);

    const booksThisYear = completedBooks.filter((b) => {
      const endDate = b.endDate ? new Date(b.endDate) : null;
      return endDate && endDate.getFullYear() === selectedYear;
    });

    const totalPages = allBooks.reduce((sum, b) => sum + (b.book?.pageCount || 0), 0);
    const pagesRead = completedBooks.reduce((sum, b) => sum + (b.book?.pageCount || 0), 0);

    // Monthly data
    const monthlyData = MONTHS.map((month, index) => {
      const count = booksThisYear.filter((b) => {
        const endDate = b.endDate ? new Date(b.endDate) : null;
        return endDate && endDate.getMonth() === index;
      }).length;
      return { month, count };
    });

    // Category distribution
    const categoryCount: Record<string, number> = {};
    completedBooks.forEach((b) => {
      b.book?.categories?.forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });
    const categoryData = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Rating distribution
    const ratingData = [1, 2, 3, 4, 5].map((rating) => ({
      rating: `${rating}★`,
      count: completedBooks.filter((b) => b.rating === rating).length,
    }));

    // Average reading time (estimated)
    const avgPagesPerBook = completedBooks.length > 0 ? pagesRead / completedBooks.length : 0;

    return {
      totalBooks: allBooks.length,
      completedBooks: completedBooks.length,
      readingBooks: readingBooks.length,
      booksThisYear: booksThisYear.length,
      totalPages,
      pagesRead,
      monthlyData,
      categoryData,
      ratingData,
      avgPagesPerBook: Math.round(avgPagesPerBook),
      goal: { target: 24, current: booksThisYear.length },
    };
  }, [books, selectedYear]);

  if (loading) {
    return <StatsSkeleton />;
  }

  const goalProgress = (stats.goal.current / stats.goal.target) * 100;

  return (
    <motion.div
      className="bg-background min-h-screen pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <header className="px-5 pt-4 pb-2">
        <h1 className="title-large">Statistiques</h1>
        <p className="text-muted-foreground">Vos habitudes de lecture</p>
      </header>

      <div className="space-y-6 px-5">
        {/* Year Selector */}
        <motion.div
          variants={item}
          className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 pb-2"
        >
          {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                year === selectedYear
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {year}
            </button>
          ))}
        </motion.div>

        {/* Goal Progress */}
        <motion.div variants={item}>
          <Card className="card-ios from-primary/10 overflow-hidden border-0 bg-gradient-to-br to-transparent">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                    <Target className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Objectif {selectedYear}</h3>
                    <p className="text-muted-foreground text-sm">
                      {stats.goal.current} / {stats.goal.target} livres
                    </p>
                  </div>
                </div>
                <span className="text-primary text-3xl font-bold">{Math.round(goalProgress)}%</span>
              </div>
              <Progress value={Math.min(goalProgress, 100)} className="h-3" />
              {stats.goal.current < stats.goal.target && (
                <p className="text-muted-foreground mt-3 text-xs">
                  Encore {stats.goal.target - stats.goal.current} livres pour atteindre votre
                  objectif !
                </p>
              )}
              {stats.goal.current >= stats.goal.target && (
                <p className="text-success mt-3 flex items-center gap-1 text-xs">
                  <Award className="h-3 w-3" /> Objectif atteint ! Félicitations !
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <Card className="card-ios">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <BookCheck className="text-success h-5 w-5" />
                <span className="text-muted-foreground text-sm">Livres lus</span>
              </div>
              <p className="text-3xl font-bold">{stats.completedBooks}</p>
            </CardContent>
          </Card>
          <Card className="card-ios">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <BookOpen className="text-warning h-5 w-5" />
                <span className="text-muted-foreground text-sm">En cours</span>
              </div>
              <p className="text-3xl font-bold">{stats.readingBooks}</p>
            </CardContent>
          </Card>
          <Card className="card-ios">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <TrendingUp className="text-primary h-5 w-5" />
                <span className="text-muted-foreground text-sm">Pages lues</span>
              </div>
              <p className="text-3xl font-bold">{stats.pagesRead.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="card-ios">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <Clock className="text-info h-5 w-5" />
                <span className="text-muted-foreground text-sm">Moy. pages</span>
              </div>
              <p className="text-3xl font-bold">{stats.avgPagesPerBook}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Chart */}
        <motion.div variants={item}>
          <Card className="card-ios">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="text-muted-foreground h-5 w-5" />
                Livres par mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      name="Livres"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories */}
        {stats.categoryData.length > 0 && (
          <motion.div variants={item}>
            <Card className="card-ios">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Genres préférés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-32 w-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryData}
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.categoryData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {stats.categoryData.map((cat, index) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="flex-1 truncate text-sm">{cat.name}</span>
                        <span className="text-muted-foreground text-sm">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rating Distribution */}
        <motion.div variants={item}>
          <Card className="card-ios">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribution des notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.ratingData.reverse().map((data) => {
                  const maxCount = Math.max(...stats.ratingData.map((d) => d.count));
                  const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                  return (
                    <div key={data.rating} className="flex items-center gap-3">
                      <span className="text-muted-foreground w-8 text-sm">{data.rating}</span>
                      <div className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full bg-yellow-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right text-sm">
                        {data.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reading Streak Placeholder */}
        <motion.div variants={item}>
          <Card className="card-ios from-warning/10 border-0 bg-gradient-to-br to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-warning/20 flex h-14 w-14 items-center justify-center rounded-full">
                  <Flame className="text-warning h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Streak de lecture</h3>
                  <p className="text-muted-foreground text-sm">
                    Commencez à tracker vos sessions de lecture
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatsSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <header className="px-5 pt-4 pb-2">
        <Skeleton className="mb-2 h-9 w-32" />
        <Skeleton className="h-4 w-48" />
      </header>
      <div className="space-y-6 px-5">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
