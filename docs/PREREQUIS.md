# Prérequis techniques non implémentés - BookShelf v3

Ce document liste les prérequis techniques qui ne sont pas encore implémentés dans le projet BookShelf v3, mais qui sont recommandés pour un déploiement en production.

## 🔴 Critique (Requis pour la production)

### 1. Variables d'environnement

**Status** : ✅ Partiellement implémenté (`.env.example` créé)

**À faire** :

- [ ] Créer `.env.local` à partir de `.env.example`
- [ ] Configurer toutes les variables d'environnement
- [ ] Ajouter les secrets dans GitHub Secrets pour CI/CD
- [ ] Configurer les variables dans Vercel pour le déploiement

**Documentation** : Voir `.env.example` pour la liste complète des variables.

---

### 2. Configuration CI/CD

**Status** : ⚠️ Partiellement implémenté (workflow GitHub Actions basique)

**À faire** :

- [ ] Ajouter les variables d'environnement dans GitHub Secrets
- [ ] Configurer les preview deployments sur Vercel
- [ ] Ajouter un workflow pour les migrations Prisma en production
- [ ] Configurer les notifications (Slack, email) pour les échecs de build

**Fichiers concernés** :

- `.github/workflows/ci.yml` (existant)
- Configuration Vercel (à créer)

---

### 3. Base de données - Migrations

**Status** : ⚠️ Migrations Prisma non versionnées

**À faire** :

- [ ] Créer la migration initiale : `npx prisma migrate dev --name init`
- [ ] Versionner les migrations dans `prisma/migrations/`
- [ ] Documenter la stratégie de migration en production
- [ ] Créer un script de rollback

**Commandes** :

```bash
# Créer une migration
pnpm db:migrate

# Appliquer les migrations en production
npx prisma migrate deploy
```

---

## 🟡 Important (Recommandé pour la production)

### 4. Seeds et données de test

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Créer `prisma/seed.ts` avec des données de test
- [ ] Ajouter script `seed` dans `package.json`
- [ ] Documenter l'utilisation des seeds

**Exemple** :

```typescript
// prisma/seed.ts
import { prisma } from '../src/lib/prisma';

async function main() {
  // Créer des utilisateurs de test
  // Créer des livres de test
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### 5. Monitoring et observabilité

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Intégrer Sentry pour le tracking d'erreurs
- [ ] Configurer Vercel Analytics pour les métriques
- [ ] Ajouter un logging structuré (pino ou winston)
- [ ] Configurer des alertes pour les erreurs critiques

**Options recommandées** :

- **Error Tracking** : Sentry (gratuit jusqu'à 5k events/mois)
- **Analytics** : Vercel Analytics (inclus avec Vercel)
- **Logging** : pino (léger) ou winston (plus de features)

---

### 6. Sécurité

**Status** : ⚠️ Partiellement implémenté (NextAuth basique)

**À faire** :

- [ ] Ajouter rate limiting sur les API routes
- [ ] Configurer les headers de sécurité (helmet.js ou next.config.ts)
- [ ] Implémenter la validation CSRF pour les formulaires
- [ ] Ajouter la sanitization des inputs utilisateur
- [ ] Configurer CORS si nécessaire
- [ ] Auditer les dépendances (npm audit, Snyk)

**Packages recommandés** :

```bash
npm install @upstash/ratelimit  # Rate limiting
npm install helmet              # Security headers
```

---

## 🟢 Optionnel (Améliorations futures)

### 7. Tests E2E

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Installer Playwright ou Cypress
- [ ] Créer des tests E2E pour les flux critiques
- [ ] Intégrer dans le pipeline CI/CD

**Option recommandée** : Playwright (meilleure intégration Next.js)

```bash
npm install -D @playwright/test
npx playwright install
```

---

### 8. Documentation API

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Générer la documentation OpenAPI/Swagger
- [ ] Documenter tous les endpoints API
- [ ] Ajouter des exemples de requêtes/réponses

**Options** :

- Swagger UI avec `swagger-jsdoc`
- Next.js API Routes avec annotations JSDoc

---

### 9. Performance et cache

**Status** : ⚠️ Partiellement optimisé (requêtes Prisma avec select)

**À faire** :

- [ ] Implémenter un cache Redis pour les recherches fréquentes
- [ ] Ajouter `revalidate` pour les données statiques
- [ ] Optimiser les images avec Next.js Image
- [ ] Configurer le CDN pour les assets statiques

**Option recommandée** : Upstash Redis (gratuit jusqu'à 10k commandes/jour)

---

### 10. Backup et récupération

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Configurer les backups automatiques Supabase
- [ ] Documenter la procédure de restauration
- [ ] Tester la procédure de backup/restore

**Note** : Supabase propose des backups automatiques pour les plans payants.

---

### 11. Architecture Decision Records (ADRs)

**Status** : ❌ Non implémenté

**À faire** :

- [ ] Créer le dossier `docs/adr/`
- [ ] Documenter les décisions architecturales importantes
- [ ] Maintenir à jour lors des changements majeurs

**Format recommandé** : Markdown avec template standardisé.

---

### 12. Internationalisation (i18n)

**Status** : ❌ Non implémenté (application en français uniquement)

**À faire** (si nécessaire) :

- [ ] Installer next-intl ou react-i18next
- [ ] Extraire tous les textes dans des fichiers de traduction
- [ ] Ajouter le sélecteur de langue

---

## Checklist de déploiement

Avant de déployer en production, vérifiez :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Les migrations Prisma sont appliquées
- [ ] Les tests passent (unitaires + E2E si implémentés)
- [ ] Le monitoring est configuré (Sentry, Analytics)
- [ ] La sécurité est en place (rate limiting, headers)
- [ ] Les backups sont configurés
- [ ] La documentation est à jour
- [ ] Le README contient les instructions de déploiement

---

## Priorités recommandées

### Phase 1 - MVP Production (Minimum viable)

1. Variables d'environnement ✅
2. Migrations Prisma
3. Configuration CI/CD basique
4. Monitoring basique (Sentry)

### Phase 2 - Production stable

5. Sécurité (rate limiting, headers)
6. Seeds et données de test
7. Tests E2E
8. Documentation API

### Phase 3 - Optimisations

9. Cache Redis
10. Performance optimizations
11. Backup strategy
12. ADRs

---

## Ressources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)

---

**Dernière mise à jour** : 2026-01-08
