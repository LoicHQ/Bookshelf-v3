# Démarrage Rapide - Bookshelf v2

## 📋 Checklist de configuration

### ✅ 1. Dépendances installées

```bash
npm install
```

✅ **FAIT**

### ⏳ 2. Configuration de la base de données

**Option A : Supabase (Recommandé - 5 minutes)**

1. Créez un compte gratuit sur https://supabase.com
2. Créez un nouveau projet
3. Allez dans **Settings** > **Database**
4. Copiez la **Connection string** (URI)
5. Collez-la dans `.env.local` comme `DATABASE_URL`

**Option B : PostgreSQL local**

Si vous avez PostgreSQL installé localement :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/bookshelf_v2"
```

Puis créez la base de données :

```sql
CREATE DATABASE bookshelf_v2;
```

**Option C : Docker**

```bash
docker run --name bookshelf-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bookshelf_v2 \
  -p 5432:5432 \
  -d postgres
```

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bookshelf_v2"
```

### ⏳ 3. Générer le client Prisma

Une fois `DATABASE_URL` configuré :

```bash
npm run db:generate
```

### ⏳ 4. Appliquer les migrations

```bash
npm run db:migrate
```

### ⏳ 5. Ouvrir Prisma Studio

```bash
npm run db:studio
```

Ouvre http://localhost:5555 dans votre navigateur.

---

## 🚀 Commandes utiles

| Commande              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Lancer le serveur de développement             |
| `npm run db:studio`   | Ouvrir Prisma Studio                           |
| `npm run db:migrate`  | Appliquer les migrations                       |
| `npm run db:generate` | Régénérer le client Prisma                     |
| `npm run db:push`     | Push le schéma sans migration (dev uniquement) |

## 📝 Fichiers de configuration

- **.env.local** : Variables d'environnement (à créer depuis .env.example)
- **prisma/schema.prisma** : Schéma de la base de données
- **DATABASE_SCHEMA.md** : Documentation complète du schéma

## ❓ Besoin d'aide ?

Consultez `SETUP_DATABASE.md` pour plus de détails sur la configuration de la base de données.
