-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CONTRIBUTOR', 'SCOUT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PHD_STUDENT', 'POSTDOC', 'PROFESSOR', 'INDUSTRY_RESEARCHER', 'INDEPENDENT_RESEARCHER', 'OTHER');

-- CreateEnum
CREATE TYPE "ScoutApplicationStatus" AS ENUM ('NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING_RESEARCH', 'VALIDATING', 'PITCHED_MATCHMAKING', 'MATCH_MADE', 'REJECTED');

-- CreateEnum
CREATE TYPE "CareerStage" AS ENUM ('PHD_STUDENT', 'POSTDOC', 'PROFESSOR', 'INDUSTRY_RESEARCHER', 'INDEPENDENT_RESEARCHER', 'OTHER');

-- CreateEnum
CREATE TYPE "ResearchStage" AS ENUM ('EARLY_CONCEPT', 'ACTIVE_RESEARCH', 'HAS_RESULTS', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('NOT_SEEKING', 'SEEKING_SEED', 'SEEKING_SERIES_A', 'GRANT_FUNDED', 'INDUSTRY_FUNDED', 'VC_BACKED');

-- CreateEnum
CREATE TYPE "SubmissionSource" AS ENUM ('CONFERENCE', 'ACADEMIC_PAPER', 'LINKEDIN', 'PERSONAL_CONNECTION', 'LAB_VISIT', 'OTHER');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('LAB_MATE', 'CLASSMATE', 'COLLEAGUE', 'NO_RELATIONSHIP', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CONTRIBUTOR',
    "emailVerified" TIMESTAMP(3),
    "verificationToken" TEXT,
    "verificationExpires" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "university" TEXT,
    "department" TEXT,
    "linkedinUrl" TEXT,
    "userRole" "UserRole",
    "researchAreas" TEXT,
    "whyScout" TEXT,
    "howSourceLeads" TEXT,
    "scoutApplicationStatus" "ScoutApplicationStatus" NOT NULL DEFAULT 'NOT_APPLIED',
    "scoutApplicationDate" TIMESTAMP(3),
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "pendingSubmissions" INTEGER NOT NULL DEFAULT 0,
    "approvedSubmissions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING_RESEARCH',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "researchTopic" TEXT,
    "researchDescription" TEXT,
    "researcherName" TEXT,
    "researcherEmail" TEXT,
    "researcherInstitution" TEXT,
    "researcherDepartment" TEXT,
    "researcherCareerStage" "CareerStage",
    "researcherLinkedin" TEXT,
    "researchStage" "ResearchStage",
    "fundingStatus" "FundingStatus",
    "keyPublications" TEXT,
    "potentialApplications" TEXT,
    "submissionSource" "SubmissionSource",
    "relationshipToResearcher" "Relationship",
    "researcherAwareness" BOOLEAN NOT NULL DEFAULT false,
    "whyInteresting" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOf" TEXT,

    CONSTRAINT "ResearchSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionComment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableInAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_scoutApplicationStatus_idx" ON "User"("scoutApplicationStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "ResearchSubmission_userId_idx" ON "ResearchSubmission"("userId");

-- CreateIndex
CREATE INDEX "ResearchSubmission_status_idx" ON "ResearchSubmission"("status");

-- CreateIndex
CREATE INDEX "ResearchSubmission_isDraft_idx" ON "ResearchSubmission"("isDraft");

-- CreateIndex
CREATE INDEX "ResearchSubmission_researcherEmail_idx" ON "ResearchSubmission"("researcherEmail");

-- CreateIndex
CREATE INDEX "ResearchSubmission_createdAt_idx" ON "ResearchSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "ResearchSubmission_submittedAt_idx" ON "ResearchSubmission"("submittedAt");

-- CreateIndex
CREATE INDEX "SubmissionComment_submissionId_idx" ON "SubmissionComment"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionComment_userId_idx" ON "SubmissionComment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "ResearchSubmission" ADD CONSTRAINT "ResearchSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionComment" ADD CONSTRAINT "SubmissionComment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ResearchSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionComment" ADD CONSTRAINT "SubmissionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
