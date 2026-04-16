import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { allocateAdmissions, applyAllocationResults, getProgramRanking } from '../services/rankingService.js';
import { calculateFairnessMetrics, createFairnessAudit, getFairnessAuditHistory } from '../services/fairnessService.js';

export const processAdmissions = async (req: Request, res: Response) => {
  try {
    // Run allocation
    const results = await allocateAdmissions();

    // Apply to database
    await applyAllocationResults(results);

    // Calculate fairness metrics
    const metrics = await calculateFairnessMetrics();
    await createFairnessAudit(metrics);

    res.json({
      message: 'Admissions processed successfully',
      resultsCount: results.length,
      totalAdmitted: results.reduce((sum, r) => sum + r.admitted.length, 0),
      totalWaitlisted: results.reduce((sum, r) => sum + r.waitlisted.length, 0),
      totalRejected: results.reduce((sum, r) => sum + r.rejected.length, 0),
      fairnessMetrics: metrics,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const { programId, status } = req.query;

    const where: any = {};
    if (programId) where.programId = programId;
    if (status) where.status = status;

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        applicant: {
          include: { user: true },
        },
        program: true,
      },
      orderBy: { rank: 'asc' },
    });

    res.json({ admissions });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getProgramRankings = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;

    const rankings = await getProgramRanking(programId);

    res.json({ rankings });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getApplicantAdmissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId: req.user.id },
    });

    if (!applicant) {
      throw new ApiError(404, 'Applicant not found');
    }

    const admissions = await prisma.admission.findMany({
      where: { applicantId: applicant.id },
      include: {
        program: true,
      },
    });

    res.json({ admissions });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const overrideDecision = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    const { newStatus, reason } = req.body;

    if (!newStatus) {
      throw new ApiError(400, 'New status required');
    }

    const admission = await prisma.admission.update({
      where: { id: admissionId },
      data: {
        status: newStatus,
        reason: reason || 'Admin override',
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'OVERRIDE_DECISION',
        entityType: 'ADMISSION',
        entityId: admissionId,
        changes: JSON.stringify({ oldStatus: admission.status, newStatus }),
        reason: reason || 'Admin override',
        performedBy: req.user?.email || 'unknown',
      },
    });

    res.json({
      message: 'Admission decision overridden',
      admission,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getFairnessReport = async (req: Request, res: Response) => {
  try {
    const metrics = await calculateFairnessMetrics();
    const history = await getFairnessAuditHistory(10);

    res.json({
      currentMetrics: metrics,
      history,
      alerts: detectFairnessIssues(metrics),
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const detectFairnessIssues = (metrics: any): string[] => {
  const alerts: string[] = [];

  // Check for adverse impact (80% rule)
  if (metrics.adverseImpact < 0.8) {
    alerts.push('Adverse impact detected: one group has <80% of another group\'s admission rate');
  }

  // Check gender balance
  const genderRates = Object.values(metrics.byGender).map((s: any) => s.rate);
  if (Math.max(...genderRates) - Math.min(...genderRates) > 0.15) {
    alerts.push('Significant gender imbalance in admissions');
  }

  // Check pathway balance
  const pathwayAdmissionRates = Object.values(metrics.byPathway).map((s: any) => s.rate);
  if (Math.max(...pathwayAdmissionRates) - Math.min(...pathwayAdmissionRates) > 0.2) {
    alerts.push('Significant pathway imbalance in admissions');
  }

  return alerts;
};
