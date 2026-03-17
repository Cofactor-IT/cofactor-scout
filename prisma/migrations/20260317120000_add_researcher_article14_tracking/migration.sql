-- CreateEnum
CREATE TYPE "ResearcherSource" AS ENUM ('OPENALEX', 'ORCID', 'CROSSREF', 'PUBMED', 'SEMANTIC_SCHOLAR', 'PATENTSVIEW', 'MANUAL');

-- CreateEnum
CREATE TYPE "Article14Status" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Researcher" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "institutionalEmail" TEXT,
    "orcidId" TEXT,
    "openAlexId" TEXT,
    "semanticScholarId" TEXT,
    "institution" TEXT,
    "department" TEXT,
    "source" "ResearcherSource" NOT NULL,
    "sourceId" TEXT,
    "rawData" JSONB,
    "firstIngestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "article14Status" "Article14Status" NOT NULL DEFAULT 'NOT_REQUIRED',
    "article14NotifiedAt" TIMESTAMP(3),
    "article14JobId" TEXT,
    "article14Attempts" INTEGER NOT NULL DEFAULT 0,
    "article14LastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Researcher_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ResearchSubmission" ADD COLUMN "researcherId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_institutionalEmail_key" ON "Researcher"("institutionalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_orcidId_key" ON "Researcher"("orcidId");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_openAlexId_key" ON "Researcher"("openAlexId");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_semanticScholarId_key" ON "Researcher"("semanticScholarId");

-- CreateIndex
CREATE INDEX "Researcher_institutionalEmail_idx" ON "Researcher"("institutionalEmail");

-- CreateIndex
CREATE INDEX "Researcher_article14NotifiedAt_idx" ON "Researcher"("article14NotifiedAt");

-- CreateIndex
CREATE INDEX "Researcher_article14Status_idx" ON "Researcher"("article14Status");

-- CreateIndex
CREATE INDEX "Researcher_source_idx" ON "Researcher"("source");

-- CreateIndex
CREATE INDEX "Researcher_orcidId_idx" ON "Researcher"("orcidId");

-- CreateIndex
CREATE INDEX "Researcher_openAlexId_idx" ON "Researcher"("openAlexId");

-- CreateIndex
CREATE INDEX "Researcher_firstIngestedAt_idx" ON "Researcher"("firstIngestedAt");

-- CreateIndex
CREATE INDEX "ResearchSubmission_researcherId_idx" ON "ResearchSubmission"("researcherId");

-- AddForeignKey
ALTER TABLE "ResearchSubmission" ADD CONSTRAINT "ResearchSubmission_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
