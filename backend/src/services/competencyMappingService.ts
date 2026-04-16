import { CompetencyScore, REBSubjects, TVETCompetencies } from '../types/index.js';

/**
 * Map REB academic results to standardized competency scores
 * REB subjects: MPC (Math, Physics, Chemistry), PCB (Physics, Chemistry, Biology), MEG (Math, English, Geography)
 */
export const mapREBToCompetencies = (
  subjects: REBSubjects,
  grades: { [subject: string]: number } // Numeric representation of grades
): CompetencyScore => {
  const gradeValues = grades;

  // Extract relevant grades
  const mathGrade = gradeValues['Math'] || gradeValues['M'] || 0;
  const englishGrade = gradeValues['English'] || gradeValues['E'] || 0;
  const scienceGrade = Math.max(
    gradeValues['Physics'] || gradeValues['P'] || 0,
    gradeValues['Chemistry'] || gradeValues['C'] || 0,
    gradeValues['Biology'] || gradeValues['B'] || 0
  );

  // Normalize to 0-100 scale
  const normalize = (value: number): number => {
    return (value / 9) * 100; // Assuming REB uses A-F scale (convert to 0-100)
  };

  const mathSkill = normalize(mathGrade);
  const communication = normalize(englishGrade);
  const scienceSkill = normalize(scienceGrade);

  // Derive other competencies
  const technicalSkill = (mathSkill + scienceSkill) / 2;
  const problemSolving = (mathSkill * 0.4 + scienceSkill * 0.3 + communication * 0.3);

  const overallScore = (
    mathSkill * 0.2 +
    technicalSkill * 0.3 +
    scienceSkill * 0.2 +
    communication * 0.1 +
    problemSolving * 0.2
  );

  return {
    mathSkill,
    technicalSkill,
    scienceSkill,
    communication,
    problemSolving,
    overallScore,
  };
};

/**
 * Map TVET competency results to standardized competency scores
 */
export const mapTVETToCompetencies = (
  competencies: TVETCompetencies,
  finalGrade: string
): CompetencyScore => {
  // Normalize TVET scores (assuming 0-100 scale)
  const avgScore = Object.values(competencies).reduce((a, b) => a + b, 0) / Object.keys(competencies).length;

  // Grade mapping A-F to numeric
  const gradeMapping: { [key: string]: number } = {
    'A': 95, 'B': 85, 'C': 75, 'D': 65, 'E': 55, 'F': 45
  };

  const gradeScore = gradeMapping[finalGrade] || avgScore;

  // TVET mapping
  const technicalSkill = competencies['Technical Skills'] || avgScore;
  const communication = competencies['Communication'] || 
                       competencies['Soft Skills'] || 70;
  const problemSolving = competencies['Problem Solving'] || 
                        competencies['Critical Thinking'] || 70;
  const mathSkill = competencies['Mathematics'] || 
                   competencies['Numeracy'] || 60;
  const scienceSkill = competencies['Science'] || 
                      competencies['Scientific Knowledge'] || 60;

  const overallScore = (
    technicalSkill * 0.3 +
    mathSkill * 0.2 +
    scienceSkill * 0.2 +
    communication * 0.1 +
    problemSolving * 0.2
  );

  return {
    mathSkill: Math.min(100, Math.max(0, mathSkill)),
    technicalSkill: Math.min(100, Math.max(0, technicalSkill)),
    scienceSkill: Math.min(100, Math.max(0, scienceSkill)),
    communication: Math.min(100, Math.max(0, communication)),
    problemSolving: Math.min(100, Math.max(0, problemSolving)),
    overallScore: Math.min(100, Math.max(0, overallScore)),
  };
};

/**
 * Check eligibility for a program based on minimum competency requirements
 */
export const checkEligibility = (
  competencies: CompetencyScore,
  minimumRequirements: {
    minMathSkill: number;
    minTechnicalSkill: number;
    minScienceSkill: number;
    minCommunication: number;
    minProblemSolving: number;
  }
): { eligible: boolean; failedCriteria: string[] } => {
  const failedCriteria: string[] = [];

  if (competencies.mathSkill < minimumRequirements.minMathSkill) {
    failedCriteria.push('mathSkill');
  }
  if (competencies.technicalSkill < minimumRequirements.minTechnicalSkill) {
    failedCriteria.push('technicalSkill');
  }
  if (competencies.scienceSkill < minimumRequirements.minScienceSkill) {
    failedCriteria.push('scienceSkill');
  }
  if (competencies.communication < minimumRequirements.minCommunication) {
    failedCriteria.push('communication');
  }
  if (competencies.problemSolving < minimumRequirements.minProblemSolving) {
    failedCriteria.push('problemSolving');
  }

  return {
    eligible: failedCriteria.length === 0,
    failedCriteria,
  };
};

/**
 * Calculate competency-based score for an application
 */
export const calculateCompetencyScore = (
  competencies: CompetencyScore,
  weights: {
    mathWeight: number;
    technicalWeight: number;
    scienceWeight: number;
    communicationWeight: number;
    problemSolvingWeight: number;
  }
): number => {
  const score =
    competencies.mathSkill * weights.mathWeight +
    competencies.technicalSkill * weights.technicalWeight +
    competencies.scienceSkill * weights.scienceWeight +
    competencies.communication * weights.communicationWeight +
    competencies.problemSolving * weights.problemSolvingWeight;

  return Math.round(score * 100) / 100; // Round to 2 decimals
};
