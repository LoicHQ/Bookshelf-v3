# BookShelf v3 ðŸ“š

Votre bibliothÃ¨que personnelle - GÃ©rez, notez et partagez vos lectures.

## FonctionnalitÃ©s

- **Gestion de bibliothÃ¨que** - Ajoutez, organisez et notez vos livres
- **Recherche par ISBN** - Ajoutez des livres via leur code ISBN depuis les APIs web
- **Interface simple** - UI moderne et intuitive
- **Authentification** - Connexion via Google, GitHub ou email

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Base de donnÃ©es**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui
- **Tests**: Vitest + Testing Library

## PrÃ©requis

- Node.js 20+
- npm ou yarn
- Compte Supabase avec base de donnÃ©es PostgreSQL

## Installation

1. **Cloner le repository**

```bash
git clone https://github.com/LoicHQ/Bookshelf-v3.git
cd Bookshelf-v3
```

2. **Installer les dÃ©pendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.example .env.local
```

Remplissez les valeurs dans `.env.local` :

- `DATABASE_URL` : Connection string Supabase PostgreSQL
- `NEXTAUTH_SECRET` : GÃ©nÃ©rez avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : URL de l'application (http://localhost:3000 en dev)
- OAuth providers (optionnel)
- `GOOGLE_BOOKS_API_KEY` (optionnel mais recommandÃ©)

4. **Initialiser la base de donnÃ©es**

```bash
npm run db:push
```

5. **Lancer le serveur de dÃ©veloppement**

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

| Commande             | Description                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Serveur de dÃ©veloppement (Turbopack) |
| `npm run build`      | Build de production                   |
| `npm run start`      | DÃ©marrer en production               |
| `npm run lint`       | Linter ESLint                         |
| `npm run type-check` | VÃ©rification des types TypeScript    |
| `npm run format`     | Formater avec Prettier                |
| `npm run test`       | Lancer les tests                      |
| `npm run db:studio`  | Ouvrir Prisma Studio                  |

## Structure du projet

```
bookshelf-v3/
â”œâ”€â”€ app/                    # Routes Next.js (App Router)
â”‚   â”œâ”€â”€ api/                # Routes API
â”‚   â”œâ”€â”€ dashboard/          # Page dashboard
â”‚   â”œâ”€â”€ login/              # Page de connexion
â”‚   â”œâ”€â”€ add-book/           # Page d'ajout de livre
â”‚   â””â”€â”€ library/            # Page bibliothÃ¨que
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/         # Composants React
â”‚   â”‚   â”œâ”€â”€ ui/             # Composants shadcn/ui
â”‚   â”‚   â””â”€â”€ books/          # Composants livres
â”‚   â”œâ”€â”€ lib/                # Utilitaires et configurations
â”‚   â””â”€â”€ types/              # Types TypeScript
â”œâ”€â”€ prisma/                 # SchÃ©ma Prisma
â””â”€â”€ tests/                  # Tests
```

## DÃ©ploiement

### Vercel (recommandÃ©)

1. Connectez votre repository GitHub Ã  Vercel
2. Configurez les variables d'environnement
3. DÃ©ployez !

## Licence

MIT
