-- AlterTable
ALTER TABLE "User"
ADD COLUMN "scoutResumeFileName" TEXT,
ADD COLUMN "scoutResumeMimeType" TEXT,
ADD COLUMN "scoutResumeData" BYTEA,
ADD COLUMN "scoutCoverLetterFileName" TEXT,
ADD COLUMN "scoutCoverLetterMimeType" TEXT,
ADD COLUMN "scoutCoverLetterData" BYTEA;

-- CreateTable
CREATE TABLE "ScoutApplicationDraft" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "userRole" "UserRole" NOT NULL,
    "userRoleOther" TEXT,
    "researchAreas" TEXT NOT NULL,
    "whyScout" TEXT NOT NULL,
    "howSourceLeads" TEXT NOT NULL,
    "resumeFileName" TEXT NOT NULL,
    "resumeMimeType" TEXT NOT NULL,
    "resumeData" BYTEA NOT NULL,
    "coverLetterFileName" TEXT,
    "coverLetterMimeType" TEXT,
    "coverLetterData" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutApplicationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoutApplicationDraft_token_key" ON "ScoutApplicationDraft"("token");

-- CreateIndex
CREATE INDEX "ScoutApplicationDraft_email_idx" ON "ScoutApplicationDraft"("email");

-- CreateIndex
CREATE INDEX "ScoutApplicationDraft_expiresAt_idx" ON "ScoutApplicationDraft"("expiresAt");
