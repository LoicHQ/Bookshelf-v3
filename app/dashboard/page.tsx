import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Library } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const quickActions = [
    {
      title: 'Ma bibliothèque',
      description: 'Consultez tous vos livres',
      href: '/library',
      icon: Library,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      hoverIconBg: 'group-hover:bg-primary/20',
    },
    {
      title: 'Ajouter un livre',
      description: 'Ajoutez un nouveau livre par ISBN',
      href: '/add-book',
      icon: Plus,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-500/10',
      hoverIconBg: 'group-hover:bg-green-500/20',
    },
    {
      title: 'Mon profil',
      description: 'Gérez votre profil utilisateur',
      href: '/profile',
      icon: BookOpen,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10',
      hoverIconBg: 'group-hover:bg-purple-500/20',
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl p-6 pb-24 safe-area-inset-top">
      {/* Header iOS-like */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-spring-in">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bienvenue, {session.user.name || session.user.email?.split('@')[0]} !
          </h1>
          <p className="text-muted-foreground text-[17px] leading-relaxed">
            Gérez votre bibliothèque personnelle
          </p>
        </div>
        <LogoutButton variant="outline" className="h-12" />
      </div>

      {/* Quick Actions Grid iOS-like */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className={cn(
                'group glass-card shadow-ios-sm cursor-pointer transition-ios',
                'hover:shadow-ios-md active:scale-[0.97]',
                'animate-spring-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link href={action.href} className="block">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4">
                    <div
                      className={cn(
                        'rounded-2xl p-3.5 transition-ios',
                        action.iconBg,
                        action.hoverIconBg
                      )}
                    >
                      <Icon className={cn('h-7 w-7 transition-ios', action.iconColor)} />
                    </div>
                    <span className="text-xl font-bold">{action.title}</span>
                  </CardTitle>
                  <CardDescription className="text-[15px] mt-2">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold glass-card border-border/40"
                  >
                    Accéder
                  </Button>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
