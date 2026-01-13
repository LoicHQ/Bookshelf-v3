# Schéma de la Base de Données - Bookshelf v2

## Vue d'ensemble

La base de données utilise PostgreSQL avec Prisma ORM. Elle est composée de 6 modèles principaux organisés en deux domaines : **Authentification** et **Gestion de livres**.

## Modèles d'Authentification

### User

Représente un utilisateur de l'application.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  books         UserBook[]
}
```

**Relations :**

- 1 utilisateur peut avoir plusieurs comptes OAuth (Account)
- 1 utilisateur peut avoir plusieurs sessions (Session)
- 1 utilisateur peut avoir plusieurs livres (UserBook)

### Account

Stocke les comptes OAuth liés à un utilisateur (Google, GitHub, etc.)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

### Session

Sessions utilisateur pour NextAuth.js

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### VerificationToken

Tokens de vérification pour la validation d'email

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Modèles de Gestion de Livres

### Book

Catalogue global des livres (partagé entre tous les utilisateurs)

```prisma
model Book {
  id            String   @id @default(cuid())
  isbn          String?  @unique
  isbn13        String?  @unique
  title         String
  author        String
  authors       String[]
  description   String?  @db.Text
  coverImage    String?  // URL de l'image haute qualité
  thumbnail     String?  // URL thumbnail
  coverSource   String?  // Source de l'image (google, openlibrary, isbndb)
  publishedDate String?
  publisher     String?
  pageCount     Int?
  categories    String[]
  language      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userBooks UserBook[]
}
```

**Champs importants :**

- `isbn` et `isbn13` : Identifiants uniques du livre
- `coverImage` : URL de l'image de couverture haute qualité
- `coverSource` : Source de l'image (google, openlibrary, isbndb)
- `authors[]` : Tableau des auteurs (pour les livres multi-auteurs)
- `categories[]` : Catégories/genres du livre

**Relations :**

- 1 livre peut être possédé par plusieurs utilisateurs (UserBook)

### UserBook

Relation entre un utilisateur et un livre (bibliothèque personnelle)

```prisma
model UserBook {
  id        String     @id @default(cuid())
  userId    String
  bookId    String
  status    BookStatus @default(TO_READ)
  rating    Int?       // 1-5 étoiles
  notes     String?    @db.Text
  review    String?    @db.Text
  startDate DateTime?
  endDate   DateTime?
  favorite  Boolean    @default(false)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  book Book @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
  @@index([userId])
  @@index([bookId])
  @@index([status])
}
```

**Champs importants :**

- `status` : Statut de lecture (TO_READ, READING, COMPLETED, ABANDONED, ON_HOLD)
- `rating` : Note de 1 à 5 étoiles
- `notes` : Notes privées de l'utilisateur
- `review` : Critique/avis complet
- `favorite` : Marquer comme favori
- `startDate` / `endDate` : Dates de début et fin de lecture

**Contraintes :**

- Un utilisateur ne peut avoir qu'une seule instance d'un livre (unique sur [userId, bookId])
- Index sur userId, bookId et status pour optimiser les requêtes

### BookStatus (Enum)

```prisma
enum BookStatus {
  TO_READ      // À lire
  READING      // En cours de lecture
  COMPLETED    // Terminé
  ABANDONED    // Abandonné
  ON_HOLD      // En pause
}
```

## Diagramme de Relations

```
User (1) ──────< (N) Account
  │
  │ (1)
  │
  └───────< (N) Session
  │
  │ (1)
  │
  └───────< (N) UserBook (N) >─────── (1) Book
```

## Index et Performance

- **User.email** : Index unique pour les recherches rapides
- **Book.isbn** / **Book.isbn13** : Index uniques pour la recherche par ISBN
- **UserBook.userId** : Index pour récupérer rapidement les livres d'un utilisateur
- **UserBook.bookId** : Index pour trouver tous les utilisateurs ayant un livre
- **UserBook.status** : Index pour filtrer par statut de lecture

## Commandes Utiles

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Ouvrir Prisma Studio (interface visuelle)
npm run db:studio

# Push le schéma sans migration (dev uniquement)
npm run db:push
```

## Visualisation

Pour visualiser la base de données de manière interactive :

1. **Prisma Studio** (Recommandé) :

   ```bash
   npm run db:studio
   ```

   Ouvre une interface web sur http://localhost:5555

2. **Outils PostgreSQL** :
   - pgAdmin
   - DBeaver
   - TablePlus

3. **Ligne de commande** :
   ```bash
   psql $DATABASE_URL
   ```
