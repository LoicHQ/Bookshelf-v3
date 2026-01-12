import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Library } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 pb-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">
            Bienvenue, {session.user.name || session.user.email} !
          </h1>
          <p className="text-muted-foreground text-lg">Gérez votre bibliothèque personnelle</p>
        </div>
        <LogoutButton variant="outline" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
          <Link href="/library" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                Ma bibliothèque
              </CardTitle>
              <CardDescription>Consultez tous vos livres</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Voir ma bibliothèque
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
          <Link href="/add-book" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-2xl bg-green-500/10 p-3 group-hover:bg-green-500/20 transition-colors">
                  <Plus className="h-6 w-6 text-green-500" />
                </div>
                Ajouter un livre
              </CardTitle>
              <CardDescription>Ajoutez un nouveau livre par ISBN</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ajouter un livre
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg">
          <Link href="/profile" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-2xl bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                Mon profil
              </CardTitle>
              <CardDescription>Gérez votre profil utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Voir mon profil
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
