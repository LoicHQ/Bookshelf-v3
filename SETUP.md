# Guide d'installation BookShelf v3

## PrÃ©requis

- Node.js 20+ installÃ©
- Compte Supabase avec projet crÃ©Ã©
- Git installÃ©

## Ã‰tapes d'installation

### 1. Cloner le repository

```bash
git clone https://github.com/LoicHQ/Bookshelf-v3.git
cd Bookshelf-v3
```

### 2. Installer les dÃ©pendances

```bash
npm install
```

### 3. Configuration Supabase

1. CrÃ©ez un projet sur [Supabase](https://supabase.com)
2. Allez dans Settings > Database
3. Copiez la connection string (URI)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 4. Variables d'environnement

CrÃ©ez un fichier `.env.local` Ã  la racine du projet :

```bash
cp .env.example .env.local
```

Remplissez les variables :

- **DATABASE_URL** : Connection string Supabase (ex: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`)
- **NEXTAUTH_SECRET** : GÃ©nÃ©rez avec `openssl rand -base64 32`
- **NEXTAUTH_URL** : `http://localhost:3000` (en dÃ©veloppement)

### 5. Initialiser la base de donnÃ©es

```bash
npm run db:push
```

Cette commande va crÃ©er toutes les tables nÃ©cessaires dans votre base Supabase.

### 6. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Configuration OAuth (optionnel)

Pour activer la connexion Google/GitHub :

1. CrÃ©ez des applications OAuth sur Google Cloud Console / GitHub
2. Ajoutez les credentials dans `.env.local` :
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

## Configuration Google Books API (optionnel)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. CrÃ©ez un projet et activez l'API Google Books
3. CrÃ©ez une clÃ© API
4. Ajoutez `GOOGLE_BOOKS_API_KEY` dans `.env.local`

Sans cette clÃ©, l'application utilisera Open Library comme fallback.
