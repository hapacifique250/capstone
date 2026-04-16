export enum UserRole {
  ADMIN = 'ADMIN',
  APPLICANT = 'APPLICANT',
}

export enum EducationPathway {
  REB = 'REB',
  TVET = 'TVET',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADMITTED = 'ADMITTED',
  WAITLISTED = 'WAITLISTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export enum AddmissionStatus {
  ADMITTED = 'ADMITTED',
  WAITLISTED = 'WAITLISTED',
  REJECTED = 'REJECTED',
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface CompetencyScore {
  mathSkill: number;
  technicalSkill: number;
  scienceSkill: number;
  communication: number;
  problemSolving: number;
  overallScore: number;
}

export interface REBSubjects {
  [subject: string]: string; // subject: grade
}

export interface TVETCompetencies {
  [competency: string]: number; // competency: score
}

export interface ProgramWeights {
  mathWeight: number;
  technicalWeight: number;
  scienceWeight: number;
  communicationWeight: number;
  problemSolvingWeight: number;
}

export interface RankingResult {
  applicantId: string;
  programId: string;
  choicePriority: number;
  competencyScore: number;
  finalScore: number;
  rank: number;
}

export interface AllocationResult {
  programId: string;
  admitted: RankingResult[];
  waitlisted: RankingResult[];
  rejected: RankingResult[];
}

export interface FairnessMetrics {
  byGender: {
    [gender: string]: { admitted: number; total: number; rate: number };
  };
  byDistrict: {
    [district: string]: { admitted: number; total: number; rate: number };
  };
  byPathway: {
    [pathway: string]: { admitted: number; total: number; rate: number };
  };
  adverseImpact: number;
  disparateImpact: number;
}

export interface MLPrediction {
  admissionProbability: number;
  successProbability: number;
  confidence: number;
  reasoning: string;
}
