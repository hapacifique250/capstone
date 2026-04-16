import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { RankingResult, AllocationResult, AddmissionStatus } from '../types/index.js';

/**
 * Rank eligible applicants for a program based on:
 * 1. Choice priority (1st choice preferred)
 * 2. Competency score (higher is better)
 */
export const rankApplicantsForProgram = async (
  programId: string
): Promise<RankingResult[]> => {
  const applications = await prisma.application.findMany({
    where: {
      programId,
      status: 'SUBMITTED',
      finalScore: { not: null },
    },
    include: {
      applicant: true,
    },
    orderBy: [
      { choicePriority: 'asc' },
      { finalScore: 'desc' },
    ],
  });

  return applications.map((app, index) => ({
    applicantId: app.applicantId,
    programId,
    choicePriority: app.choicePriority,
    competencyScore: app.competencyScore || 0,
    finalScore: app.finalScore || 0,
    rank: index + 1,
  }));
};

/**
 * Allocate admissions to all programs with capacity constraints
 */
export const allocateAdmissions = async (): Promise<AllocationResult[]> => {
  const programs = await prisma.program.findMany({
    include: {
      applications: {
        where: { status: 'SUBMITTED' },
        include: { applicant: true },
        orderBy: [
          { choicePriority: 'asc' },
          { finalScore: 'desc' },
        ],
      },
    },
  });

  const allocationResults: AllocationResult[] = [];
  const admittedApplicants = new Set<string>(); // Track multi-program admissions

  for (const program of programs) {
    const ranked = program.applications
      .filter(app => app.finalScore !== null)
      .map((app, index) => ({
        applicantId: app.applicantId,
        programId: program.id,
        choicePriority: app.choicePriority,
        competencyScore: app.competencyScore || 0,
        finalScore: app.finalScore!,
        rank: index + 1,
      }));

    // Separate admissions by capacity
    const admitted = ranked.slice(0, program.capacity).filter(r => {
      // If already admitted to higher choice priority, waitlist
      if (admittedApplicants.has(r.applicantId)) {
        return false;
      }
      admittedApplicants.add(r.applicantId);
      return true;
    });

    const remaining = ranked.slice(program.capacity);
    const waitlisted = remaining.slice(0, Math.ceil(program.capacity * 0.2)); // 20% buffer
    const rejected = remaining.slice(Math.ceil(program.capacity * 0.2));

    allocationResults.push({
      programId: program.id,
      admitted: admitted as RankingResult[],
      waitlisted: waitlisted as RankingResult[],
      rejected: rejected as RankingResult[],
    });
  }

  return allocationResults;
};

/**
 * Apply allocation results to database
 */
export const applyAllocationResults = async (results: AllocationResult[]): Promise<void> => {
  for (const result of results) {
    // Create admission records
    const admissions = [
      ...result.admitted.map(r => ({
        applicantId: r.applicantId,
        programId: result.programId,
        status: 'ADMITTED' as AddmissionStatus,
        finalScore: r.finalScore,
        rank: r.rank,
        reason: `Ranked #${r.rank} with priority ${r.choicePriority}`,
      })),
      ...result.waitlisted.map(r => ({
        applicantId: r.applicantId,
        programId: result.programId,
        status: 'WAITLISTED' as AddmissionStatus,
        finalScore: r.finalScore,
        rank: r.rank,
        reason: `Waitlisted at position #${r.rank}`,
      })),
      ...result.rejected.map(r => ({
        applicantId: r.applicantId,
        programId: result.programId,
        status: 'REJECTED' as AddmissionStatus,
        finalScore: r.finalScore,
        rank: r.rank,
        reason: `Did not meet admission criteria`,
      })),
    ];

    // Batch insert
    for (const admission of admissions) {
      await prisma.admission.upsert({
        where: {
          applicantId_programId: {
            applicantId: admission.applicantId,
            programId: admission.programId,
          },
        },
        update: { ...admission },
        create: { ...admission, createdAt: new Date() },
      });
    }
  }
};

/**
 * Get ranking for a specific program
 */
export const getProgramRanking = async (programId: string): Promise<any[]> => {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      applications: {
        where: { status: 'SUBMITTED' },
        include: {
          applicant: {
            include: { competencies: true },
          },
        },
        orderBy: [
          { choicePriority: 'asc' },
          { finalScore: 'desc' },
        ],
      },
    },
  });

  if (!program) {
    throw new Error('Program not found');
  }

  return program.applications.map((app, index) => ({
    rank: index + 1,
    applicantId: app.applicantId,
    applicantName: app.applicant.user?.firstName,
    pathway: app.applicant.pathway,
    choicePriority: app.choicePriority,
    competencyScore: app.competencyScore,
    finalScore: app.finalScore,
    status: index < program.capacity ? 'ADMITTED' : 'WAITLISTED',
  }));
};
