import prisma from '../lib/prisma.js';
import { FairnessMetrics } from '../types/index.js';

/**
 * Calculate fairness metrics for admissions
 */
export const calculateFairnessMetrics = async (): Promise<FairnessMetrics> => {
  // Get all applicants and their admission status
  const applicants = await prisma.applicant.findMany({
    include: {
      user: true,
      admissions: true,
    },
  });

  const metrics: FairnessMetrics = {
    byGender: {},
    byDistrict: {},
    byPathway: {},
    adverseImpact: 0,
    disparateImpact: 0,
  };

  // Aggregate by gender
  for (const applicant of applicants) {
    const gender = applicant.gender || 'Unknown';
    const district = applicant.district || 'Unknown';
    const pathway = applicant.pathway;
    const admitted = applicant.admissions.some(a => a.status === 'ADMITTED');

    // Gender metrics
    if (!metrics.byGender[gender]) {
      metrics.byGender[gender] = { admitted: 0, total: 0, rate: 0 };
    }
    metrics.byGender[gender].total++;
    if (admitted) metrics.byGender[gender].admitted++;

    // District metrics
    if (!metrics.byDistrict[district]) {
      metrics.byDistrict[district] = { admitted: 0, total: 0, rate: 0 };
    }
    metrics.byDistrict[district].total++;
    if (admitted) metrics.byDistrict[district].admitted++;

    // Pathway metrics
    if (!metrics.byPathway[pathway]) {
      metrics.byPathway[pathway] = { admitted: 0, total: 0, rate: 0 };
    }
    metrics.byPathway[pathway].total++;
    if (admitted) metrics.byPathway[pathway].admitted++;
  }

  // Calculate rates
  for (const gender in metrics.byGender) {
    const stat = metrics.byGender[gender];
    stat.rate = stat.total > 0 ? stat.admitted / stat.total : 0;
  }
  for (const district in metrics.byDistrict) {
    const stat = metrics.byDistrict[district];
    stat.rate = stat.total > 0 ? stat.admitted / stat.total : 0;
  }
  for (const pathway in metrics.byPathway) {
    const stat = metrics.byPathway[pathway];
    stat.rate = stat.total > 0 ? stat.admitted / stat.total : 0;
  }

  // Calculate adverse impact (80% rule)
  // If any group has <80% of highest rate, it's adverse impact
  const genderRates = Object.values(metrics.byGender).map(s => s.rate);
  if (genderRates.length > 0) {
    const maxRate = Math.max(...genderRates);
    const minRate = Math.min(...genderRates);
    metrics.adverseImpact = minRate / maxRate;
  }

  return metrics;
};

/**
 * Check for bias in competency mapping
 */
export const checkCompetencyMappingBias = async (
  pathway: string
): Promise<{ avgScore: number; stdDev: number }> => {
  const query = pathway === 'REB' 
    ? `
      SELECT AVG(c.overall_score) as avg_score, 
             STDDEV(c.overall_score) as std_dev
      FROM competencies c
      JOIN applicants a ON c.applicant_id = a.id
      WHERE a.pathway = 'REB'
    `
    : `
      SELECT AVG(c.overall_score) as avg_score, 
             STDDEV(c.overall_score) as std_dev
      FROM competencies c
      JOIN applicants a ON c.applicant_id = a.id
      WHERE a.pathway = 'TVET'
    `;

  const result = await prisma.$queryRawUnsafe<
    Array<{ avg_score: number; std_dev: number }>
  >(query);

  return {
    avgScore: result[0]?.avg_score || 0,
    stdDev: result[0]?.std_dev || 0,
  };
};

/**
 * Create fairness audit record
 */
export const createFairnessAudit = async (metrics: FairnessMetrics): Promise<void> => {
  const totalApplicants = Object.values(metrics.byPathway).reduce(
    (sum, stat) => sum + stat.total,
    0
  );
  const totalAdmitted = Object.values(metrics.byPathway).reduce(
    (sum, stat) => sum + stat.admitted,
    0
  );

  await prisma.fairnessAudit.create({
    data: {
      byGender: JSON.stringify(metrics.byGender),
      byDistrict: JSON.stringify(metrics.byDistrict),
      byPathway: JSON.stringify(metrics.byPathway),
      totalApplicants,
      totalAdmitted,
      totalRejected: totalApplicants - totalAdmitted,
      adverseImpact: metrics.adverseImpact,
      disparateImpact: metrics.disparateImpact,
    },
  });
};

/**
 * Get fairness audit history
 */
export const getFairnessAuditHistory = async (limit: number = 10): Promise<any[]> => {
  const audits = await prisma.fairnessAudit.findMany({
    take: limit,
    orderBy: { auditDate: 'desc' },
  });

  return audits.map(audit => ({
    ...audit,
    byGender: typeof audit.byGender === 'string' ? JSON.parse(audit.byGender) : audit.byGender,
    byDistrict: typeof audit.byDistrict === 'string' ? JSON.parse(audit.byDistrict) : audit.byDistrict,
    byPathway: typeof audit.byPathway === 'string' ? JSON.parse(audit.byPathway) : audit.byPathway,
  }));
};
