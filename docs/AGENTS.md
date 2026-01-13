# Guide d'utilisation des agents spécialisés BookShelf

Ce document explique comment utiliser les agents spécialisés définis dans `.cursor/rules/` pour développer et maintenir le projet BookShelf.

## Vue d'ensemble

Les agents sont activés automatiquement selon les fichiers que vous modifiez (via les patterns `globs` définis dans chaque fichier de règles). Chaque agent est spécialisé dans un domaine spécifique du projet.

## Agents disponibles

### 🧪 Agent Tests (`tests.mdc`)

**Quand l'utiliser** : Lorsque vous travaillez sur des fichiers de test ou la configuration de tests.

**Fichiers concernés** :

- `**/tests/**`
- `**/*.test.ts`, `**/*.test.tsx`
- `**/*.spec.ts`, `**/*.spec.tsx`
- `**/vitest.config.ts`

**Exemple d'annotation** :

```typescript
/**
 * @agent tests
 * Tests unitaires pour le service de gestion des livres
 */
describe('BookService', () => {
  // ...
});
```

**Stack** : Vitest 4.x, React Testing Library, jsdom

---

### 🎨 Agent Frontend UX/UI (`frontend-ux-ui.mdc`)

**Quand l'utiliser** : Lorsque vous travaillez sur les composants React, le styling, ou l'intégration Figma.

**Fichiers concernés** :

- `**/src/components/**`
- `**/src/app/**/*.tsx`
- `**/src/app/**/*.css`
- `**/globals.css`
- `**/tailwind.config.*`
- `**/components.json`

**Exemple d'annotation** :

```typescript
/**
 * @agent frontend-ux-ui
 * Composant de carte livre avec design system BookShelf
 */
export function BookCard() {
  // ...
}
```

**Stack** : Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, @dnd-kit

---

### 📚 Agent Documentation (`documentation.mdc`)

**Quand l'utiliser** : Lorsque vous rédigez ou modifiez de la documentation.

**Fichiers concernés** :

- `**/*.md`
- `**/README*`
- `**/CHANGELOG*`
- `**/CONTRIBUTING*`
- `**/docs/**`
- `**/LICENSE*`

**Utilisation** : Pas besoin d'annotation, l'agent s'active automatiquement sur les fichiers Markdown.

**Stack** : Markdown, JSDoc

---

### 🚀 Agent DevOps & CI/CD (`devops-ci.mdc`)

**Quand l'utiliser** : Lorsque vous configurez CI/CD, déploiement, ou variables d'environnement.

**Fichiers concernés** :

- `**/.github/**`
- `**/workflows/**`
- `**/*.yml`, `**/*.yaml`
- `**/Dockerfile`
- `**/docker-compose.yml`
- `**/.env*`
- `**/vercel.json`
- `**/next.config.ts`

**Exemple d'annotation** :

```yaml
# @agent devops-ci
# Configuration CI/CD pour GitHub Actions
name: CI
```

**Stack** : GitHub Actions, Vercel, Docker

---

### 🗄️ Agent Base de données (`database.mdc`)

**Quand l'utiliser** : Lorsque vous modifiez le schéma Prisma, les migrations, ou les requêtes.

**Fichiers concernés** :

- `**/prisma/**`
- `**/*.prisma`
- `**/migrations/**`
- `**/src/lib/prisma.ts`
- `**/src/lib/supabase.ts`
- `**/prisma.config.ts`

**Exemple d'annotation** :

```prisma
// @agent database
// Schéma Prisma pour la gestion des livres
model Book {
  // ...
}
```

**Stack** : Prisma 7.2, PostgreSQL (Supabase)

---

### 🧠 Agent Brainstorming (`brainstorming.mdc`)

**Quand l'utiliser** : Pour explorer de nouvelles idées, fonctionnalités, ou user stories.

**Fichiers concernés** :

- `**/docs/**`
- `**/ideas/**`
- `**/*.md`
- `**/README.md`

**Utilisation** : L'agent pose des questions ouvertes et propose plusieurs alternatives.

---

### ⚙️ Agent Backend & Logique Métier (`backend-logic.mdc`)

**Quand l'utiliser** : Lorsque vous travaillez sur les API routes, services, ou hooks personnalisés.

**Fichiers concernés** :

- `**/src/app/api/**`
- `**/src/lib/**`
- `**/src/services/**`
- `**/src/hooks/**`

**Exemple d'annotation** :

```typescript
/**
 * @agent backend-logic
 * Service de gestion des livres avec logique métier
 */
export class BookService {
  // ...
}
```

**Stack** : Next.js 16 (App Router), NextAuth v5, Prisma, Zod, Supabase Realtime

---

## Workflow recommandé

### 1. Développement d'une nouvelle fonctionnalité

1. **Backend** : Créer les services dans `src/services/` avec annotation `@agent backend-logic`
2. **API Routes** : Créer les routes dans `app/api/` avec annotation `@agent backend-logic`
3. **Frontend** : Créer les composants dans `src/components/` avec annotation `@agent frontend-ux-ui`
4. **Tests** : Créer les tests avec annotation `@agent tests`
5. **Documentation** : Mettre à jour la documentation si nécessaire

### 2. Modification d'une fonctionnalité existante

1. Identifier le fichier concerné
2. L'agent approprié s'active automatiquement selon le pattern `globs`
3. Suivre les conventions de l'agent (voir les fichiers `.cursor/rules/`)

### 3. Debugging

- **Erreur backend** : Utiliser `@agent backend-logic` pour analyser la logique
- **Problème UI** : Utiliser `@agent frontend-ux-ui` pour le design
- **Problème DB** : Utiliser `@agent database` pour les requêtes Prisma
- **Test qui échoue** : Utiliser `@agent tests` pour corriger les tests

## Exemples concrets

### Exemple 1 : Ajouter une nouvelle API route

```typescript
/**
 * @agent backend-logic
 * API Route pour mettre à jour le statut d'un livre
 */
import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/services/book.service';
import { errorToResponse } from '@/lib/errors';

export async function PATCH(request: NextRequest) {
  // Logique avec validation Zod, gestion d'erreurs, etc.
}
```

### Exemple 2 : Créer un nouveau composant

```typescript
/**
 * @agent frontend-ux-ui
 * Composant de liste de livres avec design system BookShelf
 */
'use client';

import { BookCard } from '@/components/books/BookCard';
// ...
```

### Exemple 3 : Modifier le schéma Prisma

```prisma
// @agent database
// Ajout d'un champ pour les notes de lecture
model UserBook {
  // ...
  readingNotes String? @db.Text
}
```

## Bonnes pratiques

1. **Toujours annoter** : Ajoutez `@agent` dans les commentaires JSDoc pour guider l'IA
2. **Respecter les conventions** : Chaque agent a ses propres conventions (voir les fichiers de règles)
3. **Tests cohérents** : Utilisez `@agent tests` pour maintenir la cohérence des tests
4. **Documentation à jour** : Mettez à jour la documentation quand vous modifiez des APIs

## Questions fréquentes

**Q : Dois-je toujours ajouter l'annotation `@agent` ?**
R : Non, les agents s'activent automatiquement selon les fichiers. Les annotations aident l'IA à mieux comprendre le contexte.

**Q : Que faire si un fichier concerne plusieurs agents ?**
R : Utilisez l'agent principal. Par exemple, un composant React avec logique métier utilise `@agent frontend-ux-ui` et délègue la logique à un service avec `@agent backend-logic`.

**Q : Comment savoir quel agent utiliser ?**
R : Consultez les patterns `globs` dans `.cursor/rules/` ou utilisez ce guide.

---

Pour plus de détails sur chaque agent, consultez les fichiers dans `.cursor/rules/`.
