# Guide des migrations Prisma

## Créer une migration initiale

Si vous démarrez le projet pour la première fois, créez la migration initiale :

```bash
# Générer le client Prisma
npm run db:generate

# Créer la migration initiale
npm run db:migrate
# Nommez-la : init
```

Cela créera un dossier `prisma/migrations/` avec l'historique des migrations.

## Commandes disponibles

### Développement

```bash
# Générer le client Prisma (après modification du schema)
npm run db:generate

# Push le schéma directement (sans migration)
npm run db:push

# Créer une nouvelle migration
npm run db:migrate
```

### Production

```bash
# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

## Workflow recommandé

### 1. Modifier le schéma

Éditez `prisma/schema.prisma` pour ajouter/modifier des modèles.

### 2. Créer une migration

```bash
npm run db:migrate
```

Nommez votre migration de manière descriptive :

- `add_user_avatar`
- `create_book_categories`
- `add_reading_stats`

### 3. Vérifier la migration

La migration est créée dans `prisma/migrations/[timestamp]_[name]/migration.sql`

Vérifiez le fichier SQL généré pour vous assurer qu'il correspond à vos attentes.

### 4. Appliquer en développement

```bash
# La migration est appliquée automatiquement avec db:migrate
# Ou utilisez db:push pour un reset complet
npm run db:push
```

### 5. Tester

Lancez les tests pour vérifier que tout fonctionne :

```bash
npm test
```

## Rollback

Prisma ne supporte pas nativement le rollback. Pour annuler une migration :

1. Créez une nouvelle migration qui inverse les changements
2. Ou restaurez depuis un backup de base de données

## Migrations en production

⚠️ **IMPORTANT** : En production, utilisez toujours `prisma migrate deploy` :

```bash
# Dans votre pipeline CI/CD ou manuellement
npx prisma migrate deploy
```

Cette commande :

- Applique uniquement les migrations non appliquées
- Ne crée pas de nouvelles migrations
- Est sûre pour la production

## Vérifier l'état des migrations

```bash
# Voir les migrations appliquées
npx prisma migrate status
```

## Résoudre les conflits

Si vous avez des conflits de migration :

1. Vérifiez l'état : `npx prisma migrate status`
2. Résolvez les conflits dans le schéma
3. Créez une nouvelle migration : `npm run db:migrate`
4. Appliquez : `npm run db:push` (dev) ou `npx prisma migrate deploy` (prod)

## Bonnes pratiques

1. **Une migration par changement** : Ne regroupez pas plusieurs changements non liés
2. **Noms descriptifs** : Utilisez des noms clairs pour vos migrations
3. **Testez localement** : Toujours tester les migrations en développement
4. **Backup avant migration** : Faites un backup avant d'appliquer en production
5. **Versionnez les migrations** : Les migrations sont dans `prisma/migrations/` et doivent être commitées

## Exemple : Ajouter un champ

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  avatar    String?  // Nouveau champ
  // ...
}
```

```bash
# Créer la migration
npm run db:migrate
# Nom : add_user_avatar

# La migration est créée et appliquée automatiquement
```

## Problèmes courants

### "Migration engine error"

- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que la base de données est accessible
- Vérifiez les permissions de la base de données

### "Migration already applied"

- Utilisez `npx prisma migrate resolve --applied [migration_name]` pour marquer comme appliquée
- Ou supprimez la migration du dossier `migrations/` si elle n'a pas été appliquée

### "Schema drift detected"

- Vérifiez les différences : `npx prisma migrate diff`
- Créez une nouvelle migration pour synchroniser
