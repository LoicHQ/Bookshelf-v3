# Guide : Trouver l'URI de connexion dans Supabase

## 📍 Étapes pour trouver la Connection String (URI)

### 1. Connectez-vous à Supabase

- Allez sur https://supabase.com
- Connectez-vous à votre compte

### 2. Sélectionnez votre projet

- Dans le dashboard, cliquez sur votre projet (ou créez-en un nouveau si nécessaire)

### 3. Accédez aux paramètres de la base de données

- Dans la barre latérale gauche, cliquez sur **⚙️ Settings** (Paramètres)
- Puis cliquez sur **Database** dans le menu

### 4. Trouvez la Connection String

Vous devriez voir plusieurs options :

#### Option A : Connection string (URI) - RECOMMANDÉ

- Cherchez la section **Connection string** ou **Connection URI**
- Vous verrez quelque chose comme :
  ```
  postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```
- Cliquez sur le bouton **Copy** (copier) à côté

#### Option B : Connection string (Session mode)

- Il y a aussi une option "Session mode" qui est différente
- Utilisez la première option (URI) pour Prisma

### 5. Remplacez le mot de passe

L'URI copiée contient `[YOUR-PASSWORD]` que vous devez remplacer :

- Dans l'URI, trouvez `:YOUR-PASSWORD@` ou `:[PASSWORD]@`
- Remplacez `YOUR-PASSWORD` ou `[PASSWORD]` par le mot de passe de votre base de données

**Où trouver le mot de passe ?**

- Dans **Settings** > **Database**
- Section **Database password** (Mot de passe de la base de données)
- Si vous ne l'avez pas, vous pouvez le réinitialiser

### 6. Format final attendu

L'URI devrait ressembler à :

```
postgresql://postgres.[PROJECT-REF]:VOTRE_MOT_DE_PASSE@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Ou avec le port 5432 :

```
postgresql://postgres.[PROJECT-REF]:VOTRE_MOT_DE_PASSE@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 🔍 Si vous ne voyez pas l'option Connection String

1. **Vérifiez que vous êtes dans le bon projet**
2. **Vérifiez les permissions** : vous devez être le propriétaire ou avoir les droits d'administration
3. **Essayez une autre section** :
   - Parfois elle se trouve dans **Settings** > **API**
   - Ou dans **Database** > **Connection string**

## 💡 Alternative : Connection Pooling URL

Supabase propose aussi une URL de pooling :

- Cherchez **Connection pooling**
- Format : `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- Fonctionne également avec Prisma

## ⚠️ Important

- **Ne partagez jamais votre URI publiquement** (elle contient votre mot de passe)
- Gardez-la dans `.env.local` qui est dans `.gitignore`
- Pour la production, utilisez les variables d'environnement de votre plateforme
