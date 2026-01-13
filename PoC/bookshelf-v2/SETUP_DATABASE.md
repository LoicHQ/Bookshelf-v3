# Configuration de la Base de Données - Bookshelf v2

## Options disponibles

### Option A : Supabase (Recommandé pour démarrer rapidement)

1. **Créer un compte Supabase** (gratuit) :
   - Allez sur https://supabase.com
   - Créez un compte ou connectez-vous
   - Créez un nouveau projet

2. **Récupérer la connection string** :
   - Dans votre projet Supabase, allez dans **Settings** > **Database**
   - Copiez la **Connection string** (URI) sous "Connection string"
   - Format : `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Configurer dans .env.local** :
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Option B : PostgreSQL Local

1. **Installer PostgreSQL** :
   - Windows : Télécharger depuis https://www.postgresql.org/download/windows/
   - Ou utiliser le gestionnaire de paquets (Chocolatey : `choco install postgresql`)

2. **Créer une base de données** :

   ```sql
   CREATE DATABASE bookshelf_v2;
   ```

3. **Configurer dans .env.local** :
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/bookshelf_v2"
   ```

### Option C : Docker PostgreSQL

1. **Lancer PostgreSQL avec Docker** :

   ```bash
   docker run --name bookshelf-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bookshelf_v2 -p 5432:5432 -d postgres
   ```

2. **Configurer dans .env.local** :
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/bookshelf_v2"
   ```

## Après avoir configuré DATABASE_URL

1. **Générer le client Prisma** :

   ```bash
   npm run db:generate
   ```

2. **Créer les migrations** :

   ```bash
   npm run db:migrate
   ```

3. **Ouvrir Prisma Studio** :
   ```bash
   npm run db:studio
   ```

## Variables d'environnement complètes

Créez un fichier `.env.local` avec :

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# API Keys (optionnel)
GOOGLE_BOOKS_API_KEY=""
ISBNDB_API_KEY=""

# Node Environment
NODE_ENV="development"
```

Pour générer `NEXTAUTH_SECRET` :

```bash
openssl rand -base64 32
```
