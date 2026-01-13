# Configuration des variables d'environnement

## Instructions

1. Copiez le fichier `.env.example` vers `.env.local` :

   ```bash
   cp .env.example .env.local
   ```

2. Éditez `.env.local` et remplissez toutes les variables requises.

## Variables requises

### Base de données (Supabase)

1. Connectez-vous à votre projet Supabase
2. Allez dans **Settings** > **Database**
3. Copiez la **Connection string** (URI) dans `DATABASE_URL`
4. `DIRECT_URL` est généralement identique à `DATABASE_URL` pour Supabase

### NextAuth

1. Générez un secret aléatoire :
   ```bash
   openssl rand -base64 32
   ```
2. Collez le résultat dans `NEXTAUTH_SECRET`
3. Définissez `NEXTAUTH_URL` :
   - Développement : `http://localhost:3000`
   - Production : `https://votre-domaine.com`

### OAuth Providers

#### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (si nécessaire)
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URI de redirection :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)
6. Copiez le **Client ID** et **Client Secret**

#### GitHub OAuth

1. Allez sur [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Cliquez sur **New OAuth App**
3. Remplissez :
   - **Application name** : BookShelf
   - **Homepage URL** : `http://localhost:3000` (dev) ou votre domaine (prod)
   - **Authorization callback URL** : `http://localhost:3000/api/auth/callback/github`
4. Copiez le **Client ID** et générez un **Client Secret**

### Google Books API (Optionnel)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Activez l'API **Books API**
3. Créez une clé API
4. Collez la clé dans `GOOGLE_BOOKS_API_KEY`

### APIs de couvertures légales (Recommandé pour fantasy/romantasy)

#### Babelio API (Recommandé)

1. Créez un compte sur [Babelio](https://www.babelio.com)
2. Demandez une clé API gratuite sur [Babelio API](https://www.babelio.com/api)
3. Collez la clé dans `BABELIO_API_KEY`
4. **Avantage** : Spécialisé dans les livres français, excellent pour fantasy et romantasy

#### Internet Archive (Gratuit, sans clé requise)

1. Aucune configuration nécessaire
2. L'API est publique : [Internet Archive API](https://archive.org/services/docs/api/)
3. `INTERNET_ARCHIVE_API_KEY` peut rester vide

#### LibraryThing API (Optionnel)

1. Créez un compte sur [LibraryThing](https://www.librarything.com)
2. Demandez une clé développeur gratuite
3. Collez la clé dans `LIBRARYTHING_API_KEY`

#### ISBNdb (Optionnel, quota limité)

1. Créez un compte sur [ISBNdb](https://isbndb.com)
2. Générez une clé API (plan gratuit limité à 500 requêtes/mois)
3. Collez la clé dans `ISBNDB_API_KEY`

### Cloudinary (Optionnel, pour upload de couvertures)

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Copiez votre **Cloud Name** dans `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Créez un **Upload Preset** (non signé) et collez son nom dans `NEXT_PUBLIC_CLOUDINARY_PRESET`

## Vérification

Après configuration, vérifiez que toutes les variables sont définies :

```bash
# Vérifier que .env.local existe
ls -la .env.local

# Vérifier le contenu (sans afficher les secrets)
grep -v "SECRET\|KEY" .env.local
```

## Sécurité

⚠️ **IMPORTANT** :

- Ne commitez **JAMAIS** `.env.local` dans Git
- Le fichier `.env.local` est déjà dans `.gitignore`
- Utilisez des secrets différents pour chaque environnement
- Ne partagez jamais vos secrets publiquement

## Prochaines étapes

Une fois les variables configurées :

1. Générez le client Prisma : `npm run db:generate`
2. Appliquez les migrations : `npm run db:migrate` (ou `npm run db:push` pour dev)
3. Démarrez le serveur : `npm run dev`
