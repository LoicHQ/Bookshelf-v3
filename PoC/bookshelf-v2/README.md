# Bookshelf v2 📚

Application de bibliothèque professionnelle avec recherche de livres par ISBN, images haute qualité et déploiement PWA pour iOS.

## Fonctionnalités

- **Gestion de bibliothèque** - Ajoutez, organisez et notez vos livres
- **Recherche par ISBN** - Recherche de livres via code ISBN avec images haute qualité
- **Images multi-sources** - Récupération d'images depuis Google Books, Open Library et ISBNdb
- **PWA iOS** - Installation sur l'écran d'accueil iOS
- **Tests unitaires** - Couverture de tests complète
- **CI/CD** - Pipeline automatisé avec GitHub Actions

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Langage**: TypeScript 5+
- **Base de données**: PostgreSQL (Supabase ou PostgreSQL autonome)
- **ORM**: Prisma 7+
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Tests**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **PWA**: next-pwa

## Prérequis

- Node.js 20+
- npm ou yarn
- PostgreSQL (via Supabase ou installation locale)
- Compte Google Books API (optionnel mais recommandé)

## Installation

1. **Cloner le repository**

```bash
git clone <repository-url>
cd bookshelf-v2
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.example .env.local
```

Remplissez les valeurs dans `.env.local` :

- `DATABASE_URL` : URL de connexion PostgreSQL
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `GOOGLE_BOOKS_API_KEY` : Clé API Google Books (optionnel)
- `ISBNDB_API_KEY` : Clé API ISBNdb (optionnel)

4. **Initialiser la base de données**

```bash
npm run db:migrate
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

| Commande                | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Serveur de développement (Turbopack) |
| `npm run build`         | Build de production                  |
| `npm run start`         | Démarrer en production               |
| `npm run lint`          | Linter ESLint                        |
| `npm run type-check`    | Vérification des types TypeScript    |
| `npm run format`        | Formater avec Prettier               |
| `npm run test`          | Lancer les tests                     |
| `npm run test:coverage` | Tests avec couverture                |
| `npm run db:studio`     | Ouvrir Prisma Studio                 |

## Structure du projet

```
bookshelf-v2/
├── .github/
│   └── workflows/        # CI/CD workflows
├── prisma/
│   └── schema.prisma     # Schéma Prisma
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Composants React
│   ├── lib/              # Utilitaires et services
│   ├── hooks/            # Custom hooks
│   └── types/            # Types TypeScript
├── tests/
│   └── setup.ts          # Configuration tests
└── public/               # Fichiers statiques
```

## Recherche de livres

L'application utilise plusieurs sources pour récupérer les informations et images de livres :

1. **Google Books API** (priorité 1) - Images haute résolution
2. **Open Library** (priorité 2) - Pas de limite de taux
3. **ISBNdb API** (priorité 3) - Optionnel, nécessite clé API

Le système utilise automatiquement la source avec la meilleure qualité disponible.

## Tests

```bash
# Lancer les tests
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

## CI/CD

Le pipeline CI/CD est configuré avec GitHub Actions :

- Lint et type-check
- Tests unitaires
- Build de production
- Déploiement automatique (optionnel)

## Déploiement

### Vercel (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez !

### PWA sur iOS

L'application est configurée comme Progressive Web App :

1. Ouvrez l'app sur Safari iOS
2. Appuyez sur "Partager" → "Sur l'écran d'accueil"

## Licence

MIT
