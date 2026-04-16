import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

export const createProgram = async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      college,
      capacity,
      acceptsReb,
      acceptsTvet,
      minMathSkill,
      minTechnicalSkill,
      minScienceSkill,
      minCommunication,
      minProblemSolving,
      mathWeight,
      technicalWeight,
      scienceWeight,
      communicationWeight,
      problemSolvingWeight,
    } = req.body;

    // Validate
    if (!code || !name || !college || !capacity) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Normalize weights
    const totalWeight = (mathWeight || 0.2) +
      (technicalWeight || 0.3) +
      (scienceWeight || 0.2) +
      (communicationWeight || 0.1) +
      (problemSolvingWeight || 0.2);

    if (Math.abs(totalWeight - 1) > 0.01) {
      throw new ApiError(400, 'Weights must sum to 1');
    }

    const program = await prisma.program.create({
      data: {
        code,
        name,
        college,
        capacity,
        acceptsReb: acceptsReb !== false,
        acceptsTvet: acceptsTvet !== false,
        minMathSkill: minMathSkill || 0,
        minTechnicalSkill: minTechnicalSkill || 0,
        minScienceSkill: minScienceSkill || 0,
        minCommunication: minCommunication || 0,
        minProblemSolving: minProblemSolving || 0,
        mathWeight: mathWeight || 0.2,
        technicalWeight: technicalWeight || 0.3,
        scienceWeight: scienceWeight || 0.2,
        communicationWeight: communicationWeight || 0.1,
        problemSolvingWeight: problemSolvingWeight || 0.2,
      },
    });

    res.status(201).json({
      message: 'Program created',
      program,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { college: 'asc' },
    });

    res.json({ programs });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        applications: {
          where: { status: 'SUBMITTED' },
          select: { id: true },
        },
      },
    });

    if (!program) {
      throw new ApiError(404, 'Program not found');
    }

    res.json({
      ...program,
      applicationCount: program.applications.length,
      availableSlots: program.capacity - program.applications.length,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate weights if provided
    if (
      updates.mathWeight ||
      updates.technicalWeight ||
      updates.scienceWeight ||
      updates.communicationWeight ||
      updates.problemSolvingWeight
    ) {
      const program = await prisma.program.findUnique({ where: { id } });
      if (!program) throw new ApiError(404, 'Program not found');

      const totalWeight = (updates.mathWeight || program.mathWeight) +
        (updates.technicalWeight || program.technicalWeight) +
        (updates.scienceWeight || program.scienceWeight) +
        (updates.communicationWeight || program.communicationWeight) +
        (updates.problemSolvingWeight || program.problemSolvingWeight);

      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new ApiError(400, 'Weights must sum to 1');
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data: updates,
    });

    res.json({
      message: 'Program updated',
      program,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if program has applications
    const count = await prisma.application.count({
      where: { programId: id },
    });

    if (count > 0) {
      throw new ApiError(400, 'Cannot delete program with applications');
    }

    await prisma.program.delete({ where: { id } });

    res.json({ message: 'Program deleted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
