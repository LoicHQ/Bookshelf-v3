'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
            password,
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
        try {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError('Erreur de connexion. Veuillez vous connecter manuellement.');
            setLoading(false);
          } else {
            setLoading(false);
            router.push('/dashboard');
          }
        } catch (signInError) {
          console.error('Sign in error:', signInError);
          setError('Erreur de connexion. Veuillez vous connecter manuellement.');
          setLoading(false);
        }
      } else {
        // Connexion
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Email ou mot de passe incorrect');
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4 safe-area-inset-top safe-area-inset-bottom">
      <div className="w-full max-w-md space-y-8 animate-spring-in">
        {/* Header iOS-like */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-2">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            BookShelf
          </h1>
          <p className="text-muted-foreground text-[17px] leading-relaxed">
            Votre bibliothèque personnelle
          </p>
        </div>

        {/* Card iOS-like avec glassmorphism */}
        <Card className="glass-card shadow-ios-lg border-border/40">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center">
              {isSignUp ? 'Créer un compte' : 'Connexion'}
            </CardTitle>
            <CardDescription className="text-center text-[15px]">
              {isSignUp
                ? 'Créez votre compte pour commencer'
                : 'Connectez-vous à votre bibliothèque'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Messages d'erreur/succès iOS-like */}
              {error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/30 p-4 text-[15px] text-red-600 dark:text-red-400 animate-spring-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200/50 dark:border-green-900/30 p-4 text-[15px] text-green-600 dark:text-green-400 animate-spring-in">
                  {success}
                </div>
              )}

              {/* Champ Nom (inscription uniquement) */}
              {isSignUp && (
                <div className="space-y-2.5">
                  <label htmlFor="name" className="text-[15px] font-semibold text-foreground/90">
                    Nom (optionnel)
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="h-14 text-[17px]"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Champ Email */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-[15px] font-semibold text-foreground/90">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="h-14 text-[17px]"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Champ Password avec toggle */}
              <div className="space-y-2.5">
                <label htmlFor="password" className="text-[15px] font-semibold text-foreground/90">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isSignUp ? 'Minimum 8 caractères' : 'Votre mot de passe'}
                    className="h-14 text-[17px] pr-12"
                    disabled={loading}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl active:scale-95"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-[13px] text-muted-foreground">
                    Au moins 8 caractères avec majuscule, minuscule et chiffre
                  </p>
                )}
              </div>

              {/* Bouton Submit iOS-like */}
              <Button
                type="submit"
                className="w-full h-14 text-[17px] font-semibold shadow-ios-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignUp ? 'Création...' : 'Connexion...'}
                  </>
                ) : isSignUp ? (
                  'Créer le compte'
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Séparateur iOS-like */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-4 text-muted-foreground text-[13px]">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Boutons OAuth iOS-like */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 text-[17px] font-medium glass-card border-border/40"
                onClick={() => signIn('google')}
                disabled={loading}
              >
                Continuer avec Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 text-[17px] font-medium glass-card border-border/40"
                onClick={() => signIn('github')}
                disabled={loading}
              >
                Continuer avec GitHub
              </Button>
            </div>

            {/* Toggle Inscription/Connexion */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setPassword('');
                }}
                className="text-primary text-[15px] font-semibold hover:opacity-80 transition-opacity active:scale-95"
                disabled={loading}
              >
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : "Pas de compte ? S'inscrire"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
