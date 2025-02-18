import axios from 'axios';
import { z } from 'zod';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const employeeSchema = z.object({
  yearsAtCompany: z.number().min(0).max(50),
  monthlyIncome: z.number().min(0),
  jobLevel: z.enum(['Entry Level', 'Mid Level', 'Senior', 'Manager', 'Director']),
});

export type Employee = z.infer<typeof employeeSchema>;

export type AttritionPrediction = {
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  topFactors: Array<{ factor: string; impact: number }>;
};

export type DepartmentMetrics = {
  department: string;
  attritionRate: number;
  employeeCount: number;
  predictedAttrition: number;
};

const api = axios.create({
  baseURL: API_URL,
});

export const fetchDepartmentMetrics = async (): Promise<DepartmentMetrics[]> => {
  const { data } = await api.get('/metrics/departments');
  return data;
};

export const predictAttrition = async (employee: Employee): Promise<AttritionPrediction> => {
  const { data } = await api.post('/predict/attrition', employee);
  return data;
};

export const fetchAttritionTrends = async (): Promise<Array<{ month: string; rate: number }>> => {
  const { data } = await api.get('/metrics/trends');
  return data;
};