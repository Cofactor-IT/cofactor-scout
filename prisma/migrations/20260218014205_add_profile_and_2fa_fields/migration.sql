-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalLinks" JSONB,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "personalWebsite" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
