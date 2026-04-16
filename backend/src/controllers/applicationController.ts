import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { mapREBToCompetencies, mapTVETToCompetencies, checkEligibility, calculateCompetencyScore } from '../services/competencyMappingService.js';
import { getPrediction } from '../services/mlService.js';

export const submitApplication = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const {
      programId,
      choicePriority,
      pathway,
      rebResults,
      tvetResults,
    } = req.body;

    // Validate
    if (!programId || !choicePriority || !pathway) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Get or create applicant
    let applicant = await prisma.applicant.findUnique({
      where: { userId: req.user.id },
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          userId: req.user.id,
          pathway: pathway as any,
          gender: '',
          district: '',
          dateOfBirth: new Date(),
        },
      });
    }

    // Store academic results
    if (pathway === 'REB' && rebResults) {
      await prisma.rEBResult.upsert({
        where: { applicantId: applicant.id },
        update: rebResults,
        create: {
          applicantId: applicant.id,
          ...rebResults,
        },
      });
    } else if (pathway === 'TVET' && tvetResults) {
      await prisma.tVETResult.upsert({
        where: { applicantId: applicant.id },
        update: tvetResults,
        create: {
          applicantId: applicant.id,
          ...tvetResults,
        },
      });
    }

    // Map competencies
    let competencies;
    if (pathway === 'REB') {
      const subjects = JSON.parse(rebResults.subjects || '{}');
      const grades = JSON.parse(rebResults.grades || '{}');
      competencies = mapREBToCompetencies(subjects, grades);
    } else {
      const tvetComps = JSON.parse(tvetResults.competencies || '{}');
      competencies = mapTVETToCompetencies(tvetComps, tvetResults.finalGrade);
    }

    // Upsert competency
    await prisma.competency.upsert({
      where: { applicantId: applicant.id },
      update: competencies,
      create: {
        applicantId: applicant.id,
        ...competencies,
        mappingSource: pathway,
      },
    });

    // Get program
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new ApiError(404, 'Program not found');
    }

    // Check eligibility
    const eligibility = checkEligibility(competencies, {
      minMathSkill: program.minMathSkill,
      minTechnicalSkill: program.minTechnicalSkill,
      minScienceSkill: program.minScienceSkill,
      minCommunication: program.minCommunication,
      minProblemSolving: program.minProblemSolving,
    });

    let eligibilityScore = eligibility.eligible ? 100 : 50;

    // Calculate competency score
    const competencyScore = calculateCompetencyScore(competencies, {
      mathWeight: program.mathWeight,
      technicalWeight: program.technicalWeight,
      scienceWeight: program.scienceWeight,
      communicationWeight: program.communicationWeight,
      problemSolvingWeight: program.problemSolvingWeight,
    });

    // Get ML prediction
    const mlPrediction = await getPrediction({
      ...competencies,
      pathway,
      gender: applicant.gender,
    });

    // Calculate final score
    const finalScore = (competencyScore * 0.7) + (eligibilityScore * 0.3);

    // Create or update application
    const application = await prisma.application.upsert({
      where: {
        applicantId_programId_choicePriority: {
          applicantId: applicant.id,
          programId,
          choicePriority,
        },
      },
      update: {
        status: 'SUBMITTED',
        competencyScore,
        eligibilityScore,
        finalScore,
        admissionProbability: mlPrediction.admissionProbability,
        successProbability: mlPrediction.successProbability,
        submittedAt: new Date(),
      },
      create: {
        applicantId: applicant.id,
        programId,
        choicePriority,
        status: 'SUBMITTED',
        competencyScore,
        eligibilityScore,
        finalScore,
        admissionProbability: mlPrediction.admissionProbability,
        successProbability: mlPrediction.successProbability,
        submittedAt: new Date(),
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        programId,
        choicePriority,
        status: application.status,
        scores: {
          competencyScore,
          eligibilityScore,
          finalScore,
        },
        eligibility: eligibility.eligible,
        mlPrediction,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId: req.user.id },
    });

    if (!applicant) {
      return res.json({ applications: [] });
    }

    const applications = await prisma.application.findMany({
      where: { applicantId: applicant.id },
      include: {
        program: true,
      },
    });

    res.json({ applications });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        program: true,
        applicant: {
          include: { competencies: true },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Check if user owns this application
    if (req.user && application.applicant.userId !== req.user.id) {
      throw new ApiError(403, 'Not authorized');
    }

    res.json({
      application,
      explanation: generateExplanation(application),
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const generateExplanation = (application: any): string => {
  if (application.status === 'ADMITTED') {
    return `You have been admitted to ${application.program.name}. Your competency score of ${application.competencyScore?.toFixed(2)} was competitive.`;
  } else if (application.status === 'WAITLISTED') {
    return `You are on the waitlist for ${application.program.name}. Keep checking back for updates.`;
  } else {
    return `Unfortunately, you did not meet the minimum requirements for ${application.program.name}. Focus areas: ${application.decisionReason || 'See program requirements'}`;
  }
};
