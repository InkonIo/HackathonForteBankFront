export interface Transaction {
  id: number;
  transactionId: string;
  customerId: string;
  transactionDateTime: string;
  amount: number;
  recipientId: string;
  isFraud: boolean;
  fraudProbability?: number;
  status: 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'BLOCKED' | 'APPROVED' | 'REVIEW';
  createdAt: string;
  updatedAt?: string;
}

export interface RiskFactor {
  name: string;
  description: string;
  score: number;
  weight: number;
}

export interface TransactionAnalysis {
  transactionId: number;
  customerId: string;
  fraudProbability: number;
  isFraud: boolean;
  decision: string;
  riskScore: number;
  riskFactors: RiskFactor[];
  aiExplanation: string;
  recommendations: string;
  analyzedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TransactionListResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}