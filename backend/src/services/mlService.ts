import axios from 'axios';
import { MLPrediction } from '../types/index.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Get ML prediction for admission probability
 */
export const getPrediction = async (
  applicantData: {
    mathSkill: number;
    technicalSkill: number;
    scienceSkill: number;
    communication: number;
    problemSolving: number;
    pathway: string;
    gender?: string;
  }
): Promise<MLPrediction> => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      applicantData,
      { timeout: 10000 }
    );

    return response.data as MLPrediction;
  } catch (error) {
    console.error('ML Service error:', error);
    // Fallback to simple heuristic
    return {
      admissionProbability: calculateHeuristicProbability(applicantData),
      successProbability: 0.5,
      confidence: 0.3,
      reasoning: 'ML service unavailable, using fallback calculation',
    };
  }
};

/**
 * Fallback heuristic when ML service is unavailable
 */
const calculateHeuristicProbability = (applicantData: {
  mathSkill: number;
  technicalSkill: number;
  scienceSkill: number;
  communication: number;
  problemSolving: number;
}): number => {
  const avgScore = (
    applicantData.mathSkill +
    applicantData.technicalSkill +
    applicantData.scienceSkill +
    applicantData.communication +
    applicantData.problemSolving
  ) / 5;

  // Simple logistic function
  return 1 / (1 + Math.exp(-((avgScore - 50) / 15)));
};

/**
 * Get model metrics
 */
export const getModelMetrics = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${ML_SERVICE_URL}/metrics`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch model metrics:', error);
    return null;
  }
};

/**
 * Train new model
 */
export const trainModel = async (trainingData: any[]): Promise<any> => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/train`,
      { data: trainingData },
      { timeout: 60000 }
    );
    return response.data;
  } catch (error) {
    console.error('ML training error:', error);
    throw error;
  }
};
