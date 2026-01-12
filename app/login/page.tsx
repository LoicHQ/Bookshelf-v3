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
      }
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            BookShelf
          </h1>
          <p className="text-muted-foreground text-lg">
            Votre bibliothèque personnelle
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? 'Créer un compte' : 'Connexion'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp
                ? 'Créez votre compte BookShelf'
                : 'Connectez-vous à votre bibliothèque BookShelf'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 p-4 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[15px] font-medium text-foreground/80">
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
                <label htmlFor="email" className="text-[15px] font-medium text-foreground/80">
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

            <div className="space-y-4">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-primary text-[15px] font-medium hover:opacity-80 transition-opacity"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">Ou continuer avec</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => signIn('google')}>
                  Continuer avec Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => signIn('github')}>
                  Continuer avec GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
