'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateTestEmail = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test-${timestamp}-${random}@test.com`;
  };

  const createTestAccount = async () => {
    const testEmail = generateTestEmail();
    setEmail(testEmail);
    setName(`Test User ${Date.now()}`);
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          name: `Test User ${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création du compte de test');
        setLoading(false);
        return;
      }

      setSuccess(`Compte de test créé : ${testEmail}`);
      setIsSignUp(false);
      
      // Connexion automatique après création
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: testEmail,
          password: 'dev',
          redirect: false,
        });

        if (result?.error) {
          setError('Erreur de connexion');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue lors de la création du compte de test');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Inscription
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name: name || email.split('@')[0],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur lors de la création du compte');
          setLoading(false);
          return;
        }

        setSuccess('Compte créé avec succès ! Connexion en cours...');
        
        // Connexion automatique après inscription
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email,
            password: 'dev',
            redirect: false,
          });

          if (result?.error) {
            setError('Erreur de connexion');
          } else {
            router.push('/dashboard');
            router.refresh();
          }
          setLoading(false);
        }, 1000);
      } else {
        // Connexion
        const result = await signIn('credentials', {
          email,
          password: 'dev', // Mot de passe factice pour le développement
          redirect: false,
        });

        if (result?.error) {
          setError('Erreur de connexion');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
        setLoading(false);
      }
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Créez votre compte BookShelf'
              : 'Connectez-vous à votre bibliothèque BookShelf'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </div>
            )}
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom (optionnel)
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isSignUp
                  ? 'Création...'
                  : 'Connexion...'
                : isSignUp
                  ? 'Créer le compte'
                  : 'Se connecter'}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-primary hover:underline"
              >
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : "Pas de compte ? S'inscrire"}
              </button>
            </div>
            {!isSignUp && (
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={createTestAccount}
                disabled={loading}
              >
                Créer un compte de test
              </Button>
            )}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => signIn('google')}>
              Continuer avec Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => signIn('github')}>
              Continuer avec GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
