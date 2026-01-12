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
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            Bienvenue, {session.user.name || session.user.email} !
          </h1>
          <p className="text-muted-foreground">Gérez votre bibliothèque personnelle</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Ma bibliothèque
            </CardTitle>
            <CardDescription>Consultez tous vos livres</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/library">
              <Button variant="outline" className="w-full">
                Voir ma bibliothèque
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter un livre
            </CardTitle>
            <CardDescription>Ajoutez un nouveau livre par ISBN</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/add-book">
              <Button variant="outline" className="w-full">
                Ajouter un livre
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mon profil
            </CardTitle>
            <CardDescription>Gérez votre profil utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Voir mon profil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
