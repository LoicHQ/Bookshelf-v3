# Sources légales de couvertures de livres

Ce document liste toutes les sources utilisées par BookShelf pour récupérer les couvertures de livres, en garantissant la **légalité** et le **respect des conditions d'utilisation**.

## Principe fondamental

**BookShelf utilise UNIQUEMENT des APIs officielles et publiques.** Aucun scraping HTML de sites web n'est effectué.

## Sources principales

### 1. Open Library (Open Library Foundation)

**Type** : API publique officielle  
**Documentation** : https://openlibrary.org/developers/api  
**Légalité** : ✅ 100% légal - API publique ouverte  
**Méthode** : Recherche par ISBN et par titre/auteur

**Endpoints utilisés** :

- ISBN : `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}`
- Recherche : `https://openlibrary.org/search.json?title={title}&author={author}`
- Images : `https://covers.openlibrary.org/b/id/{cover_id}-L.jpg`

**Attribution** : Les données proviennent d'Open Library, un projet de l'Internet Archive.

---

### 2. Google Books API (Google)

**Type** : API officielle  
**Documentation** : https://developers.google.com/books  
**Légalité** : ✅ 100% légal avec clé API  
**Méthode** : Recherche par ISBN

**Endpoints utilisés** :

- `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`

**Limitations** :

- Quota gratuit : 1000 requêtes/jour
- Clé API optionnelle mais recommandée

---

### 3. Babelio API (Babelio)

**Type** : API officielle partenaire  
**Documentation** : https://www.babelio.com/api  
**Légalité** : ✅ 100% légal avec clé API gratuite  
**Méthode** : Recherche par titre et auteur

**Endpoints utilisés** :

- `https://www.babelio.com/api/livres?q={title} {author}`

**Avantages** :

- Spécialisé dans les livres français
- Excellent pour fantasy et romantasy récents
- Communauté active et base de données à jour

**Rate limiting** : 100 requêtes/minute

---

### 4. Internet Archive (Internet Archive)

**Type** : API publique officielle  
**Documentation** : https://archive.org/services/docs/api/  
**Légalité** : ✅ 100% légal - API publique  
**Méthode** : Recherche avancée par titre et auteur

**Endpoints utilisés** :

- Recherche : `https://archive.org/advancedsearch.php?q=title:"{title}" AND creator:"{author}"`
- Images : `https://archive.org/services/img/{identifier}`

**Avantages** :

- Archive légale de millions de livres
- Aucune clé API requise
- Couvertures haute qualité

---

### 5. LibraryThing (LibraryThing)

**Type** : API officielle développeur  
**Documentation** : https://www.librarything.com/api  
**Légalité** : ✅ 100% légal avec clé développeur  
**Méthode** : Recherche par ISBN

**Endpoints utilisés** :

- `http://covers.librarything.com/devkey/{key}/large/isbn/{isbn}`

**Configuration** : Nécessite une clé développeur gratuite

---

### 6. ISBNdb (ISBNdb)

**Type** : API commerciale (plan gratuit disponible)  
**Documentation** : https://isbndb.com/apidocs  
**Légalité** : ✅ 100% légal avec clé API  
**Méthode** : Recherche par ISBN

**Endpoints utilisés** :

- `https://api2.isbndb.com/book/{isbn}`

**Limitations** :

- Plan gratuit : 500 requêtes/mois
- Optionnel dans BookShelf

---

## Stratégie de récupération

### 1. Recherche initiale par ISBN

Les APIs suivantes sont appelées en parallèle :

- Open Library (par ISBN)
- Google Books (par ISBN)
- LibraryThing (par ISBN, si configuré)
- ISBNdb (par ISBN, si configuré)

### 2. Fallback web (si < 2 couvertures trouvées)

Les APIs suivantes sont appelées en parallèle :

- **Babelio API** (par titre + auteur)
- **Internet Archive** (par titre + auteur)
- **Open Library Search** (par titre + auteur)

### 3. Priorisation finale

- **3 couvertures** depuis le scraping web (Babelio, Archive, OL Search)
- **2 couvertures** depuis les APIs traditionnelles (Google, LibraryThing, etc.)
- **1 slot** réservé pour l'upload manuel utilisateur

## Respect des APIs

### Rate Limiting

- Toutes les requêtes respectent les quotas des APIs
- Timeout de 5 secondes par source
- Parallélisation avec `Promise.allSettled()` pour éviter les blocages

### Cache

- Cache en mémoire avec TTL de 24h
- Évite les requêtes répétées pour le même livre
- Réduit la charge sur les APIs tierces

### Gestion d'erreurs

- Si une source échoue, les autres continuent
- Logs des erreurs pour monitoring
- Pas de retry automatique agressif

## Attribution dans l'interface

Les sources de chaque couverture sont affichées dans l'interface utilisateur :

- Badge "Open Library" pour Open Library
- Badge "Babelio" pour Babelio
- Badge "Internet Archive" pour Internet Archive
- Badge "Google Books" pour Google Books
- etc.

## Sources explicitement EXCLUES

Les sources suivantes sont **interdites** car elles violent les conditions d'utilisation :

❌ **Amazon** - Scraping interdit dans les CGU  
❌ **Goodreads** - Propriété d'Amazon, scraping interdit  
❌ **FNAC** - Site commercial, CGU restrictives  
❌ **Cultura** - Site commercial, CGU restrictives  
❌ **Ebooks.com** - Site commercial, CGU restrictives

## Conformité légale

### Droits d'auteur

- Les couvertures de livres sont affichées dans un contexte de **citation** et **usage équitable**
- Utilisées uniquement pour identifier les livres dans une bibliothèque personnelle
- Pas de redistribution commerciale

### Conditions d'utilisation des APIs

- Toutes les APIs utilisées autorisent explicitement l'usage dans des applications tierces
- Les quotas et rate limits sont respectés
- Attribution correcte des sources

### RGPD

- Aucune donnée personnelle n'est partagée avec les APIs tierces
- Les requêtes contiennent uniquement des métadonnées de livres (ISBN, titre, auteur)
- Pas de tracking utilisateur transmis aux APIs

## Maintenance

### Surveillance

- Monitoring des taux d'erreur par source
- Alertes si une API devient indisponible
- Tests automatisés quotidiens

### Mises à jour

- Revue trimestrielle des conditions d'utilisation des APIs
- Ajout de nouvelles sources légales quand disponibles
- Retrait des sources qui changent leurs CGU

---

**Dernière mise à jour** : Janvier 2026  
**Contact** : Pour toute question sur la légalité des sources, ouvrir une issue sur GitHub.
