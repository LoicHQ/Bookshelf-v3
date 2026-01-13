# Comment trouver la DATABASE_URL dans Supabase

## ⚠️ Différence importante

Vous avez donné les **clés API** (anon et service_role), mais pour Prisma nous avons besoin de la **DATABASE_URL** (URI de connexion PostgreSQL).

## 📍 Où trouver la DATABASE_URL

Dans Supabase, allez à :

**Settings (⚙️) > Database**

Ensuite, cherchez une des sections suivantes :

### Option 1 : Connection string

- Section **"Connection string"**
- Cherchez **"Connection URI"** ou **"URI"**
- Format : `postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### Option 2 : Connection pooling

- Section **"Connection pooling"**
- Cherchez **"Connection URI"**
- Format : `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### Option 3 : Direct connection

- Section **"Database URL"** ou **"Direct connection"**
- Format : `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

## 🔑 Votre PROJECT_REF

D'après vos clés API, votre PROJECT_REF est : **`bygcssubmggopchetnciu`**

Votre URI devrait donc ressembler à :

```
postgresql://postgres.bygcssubmggopchetnciu:[PASSWORD]@db.bygcssubmggopchetnciu.supabase.co:5432/postgres
```

## 🔐 Le mot de passe

L'URI contient `[PASSWORD]` ou `[YOUR-PASSWORD]` qu'il faut remplacer.

**Où trouver le mot de passe :**

1. Toujours dans **Settings > Database**
2. Section **"Database password"**
3. Si vous ne l'avez pas, cliquez sur **"Reset database password"**
4. Copiez le mot de passe et remplacez `[PASSWORD]` dans l'URI

## 📋 Exemple complet

1. URI copiée de Supabase :

   ```
   postgresql://postgres.bygcssubmggopchetnciu:[YOUR-PASSWORD]@db.bygcssubmggopchetnciu.supabase.co:5432/postgres
   ```

2. Mot de passe trouvé : `monMotDePasse123`

3. URI finale :

   ```
   postgresql://postgres.bygcssubmggopchetnciu:monMotDePasse123@db.bygcssubmggopchetnciu.supabase.co:5432/postgres
   ```

4. À mettre dans `.env.local` :
   ```env
   DATABASE_URL="postgresql://postgres.bygcssubmggopchetnciu:monMotDePasse123@db.bygcssubmggopchetnciu.supabase.co:5432/postgres"
   ```

## 💡 Astuce

Si vous ne trouvez toujours pas :

1. Dans **Settings > Database**, faites défiler toute la page
2. Cherchez tous les champs qui contiennent "postgresql://"
3. L'URI est souvent dans une boîte avec un bouton "Copy" à côté
