import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const round = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const calculateGPA = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  return round(scores.reduce((a, b) => a + b) / scores.length);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const normalizeScore = (value: number, min: number = 0, max: number = 100): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const percentileRank = (scores: number[], value: number): number => {
  const sorted = [...scores].sort((a, b) => a - b);
  const count = sorted.filter(s => s <= value).length;
  return (count / sorted.length) * 100;
};
