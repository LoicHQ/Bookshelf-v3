-- Supprimer tous les comptes existants et leurs données associées
-- Supprimer d'abord les UserBook (dépendances)
DELETE FROM "UserBook";

-- Supprimer les Account et Session (dépendances de User)
DELETE FROM "Account";
DELETE FROM "Session";

-- Supprimer tous les utilisateurs
DELETE FROM "User";

-- Ajouter les nouveaux champs pour l'authentification par mot de passe
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);
