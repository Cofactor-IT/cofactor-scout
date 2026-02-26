-- AlterEnum
ALTER TYPE "CareerStage" ADD VALUE 'UNDERGRAD_STUDENT';

-- AlterTable
ALTER TABLE "ResearchSubmission" ADD COLUMN     "researcherCareerStageOther" TEXT,
ADD COLUMN     "supportingLinks" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "scoutNotificationEmail" TEXT DEFAULT 'it@cofactor.world';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scoutApprovedAt" TIMESTAMP(3),
ADD COLUMN     "userRoleOther" TEXT;

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "analytics" BOOLEAN NOT NULL,
    "error" BOOLEAN NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");
