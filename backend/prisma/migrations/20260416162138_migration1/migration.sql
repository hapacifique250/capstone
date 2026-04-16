-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'APPLICANT');

-- CreateEnum
CREATE TYPE "EducationPathway" AS ENUM ('REB', 'TVET');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADMITTED', 'WAITLISTED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('ADMITTED', 'WAITLISTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'APPLICANT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathway" "EducationPathway" NOT NULL,
    "gender" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "academicHistory" TEXT,
    "extracurriculars" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reb_results" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "subjects" TEXT NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL,
    "gradeAverage" DOUBLE PRECISION NOT NULL,
    "yearCompleted" INTEGER NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reb_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tvet_results" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "competencies" TEXT NOT NULL,
    "finalGrade" TEXT NOT NULL,
    "yearCompleted" INTEGER NOT NULL,
    "institution" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tvet_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencies" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "mathSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "technicalSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scienceSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "communication" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "problemSolving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mappedOnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mappingSource" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "college" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableSlots" INTEGER NOT NULL DEFAULT 0,
    "acceptsReb" BOOLEAN NOT NULL DEFAULT true,
    "acceptsTvet" BOOLEAN NOT NULL DEFAULT true,
    "minMathSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minTechnicalSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minScienceSkill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minCommunication" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minProblemSolving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mathWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "technicalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "scienceWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "communicationWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "problemSolvingWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "choicePriority" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "competencyScore" DOUBLE PRECISION,
    "eligibilityScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION,
    "rank" INTEGER,
    "admissionProbability" DOUBLE PRECISION,
    "successProbability" DOUBLE PRECISION,
    "admissionStatus" "AdmissionStatus",
    "decisionReason" TEXT,
    "decisionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "AdmissionStatus" NOT NULL,
    "reason" TEXT,
    "applicationId" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fairness_audits" (
    "id" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byGender" TEXT NOT NULL,
    "byDistrict" TEXT NOT NULL,
    "byPathway" TEXT NOT NULL,
    "totalApplicants" INTEGER NOT NULL,
    "totalAdmitted" INTEGER NOT NULL,
    "totalRejected" INTEGER NOT NULL,
    "adverseImpact" DOUBLE PRECISION,
    "disparateImpact" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fairness_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_model_metrics" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "precision" DOUBLE PRECISION NOT NULL,
    "recall" DOUBLE PRECISION NOT NULL,
    "f1Score" DOUBLE PRECISION NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL,
    "evaluationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_model_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_userId_key" ON "applicants"("userId");

-- CreateIndex
CREATE INDEX "applicants_pathway_idx" ON "applicants"("pathway");

-- CreateIndex
CREATE INDEX "applicants_district_idx" ON "applicants"("district");

-- CreateIndex
CREATE UNIQUE INDEX "reb_results_applicantId_key" ON "reb_results"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "tvet_results_applicantId_key" ON "tvet_results"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_applicantId_key" ON "competencies"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE INDEX "programs_college_idx" ON "programs"("college");

-- CreateIndex
CREATE INDEX "applications_programId_idx" ON "applications"("programId");

-- CreateIndex
CREATE INDEX "applications_applicantId_idx" ON "applications"("applicantId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_finalScore_idx" ON "applications"("finalScore");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicantId_programId_choicePriority_key" ON "applications"("applicantId", "programId", "choicePriority");

-- CreateIndex
CREATE INDEX "admissions_programId_idx" ON "admissions"("programId");

-- CreateIndex
CREATE INDEX "admissions_status_idx" ON "admissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_applicantId_programId_key" ON "admissions"("applicantId", "programId");

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reb_results" ADD CONSTRAINT "reb_results_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tvet_results" ADD CONSTRAINT "tvet_results_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
