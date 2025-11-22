import axiosInstance from './axiosConfig';

// ============================================
// Enhanced Types для ML Fraud Detection
// ============================================

export interface DashboardStats {
  // Общая статистика
  totalTransactions: number;
  fraudCount: number;
  legitimateCount: number;
  fraudRate: number;
  
  // Финансовая статистика
  totalAmount: number;
  fraudAmount: number;
  avgTransactionAmount: number;
  preventedLosses: number; // 💰 Предотвращенные потери
  
  // ML Метрики модели
  modelMetrics: ModelMetrics;
  
  // Решения системы
  blockedCount: number;
  reviewCount: number;
  approvedCount: number;
  
  // Топ рискованных клиентов
  topRiskyCustomers: RiskyCustomer[];
  
  // Временные данные
  fraudTrend: TimeSeriesDataPoint[];
  amountTrend: TimeSeriesDataPoint[];
  
  // Поведенческая аналитика
  behavioralInsights: BehavioralInsights;
}

export interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  fbetaScore: number;
  rocAuc: number;
  accuracy: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  lastUpdated: string;
}

export interface BehavioralInsights {
  avgDeviceChanges: number;
  avgOsChanges: number;
  suspiciousLoginPatterns: number;
  highFrequencyUsers: number;
  anomalousSessionPatterns: number;
}

export interface RiskyCustomer {
  customerId: string;
  transactionCount: number;
  fraudCount: number;
  fraudRate: number;
  totalAmount: number;
  avgRiskScore: number;
  
  // Поведенческие данные
  deviceChanges?: number;
  osChanges?: number;
  loginFrequencyChange?: number;
  burstinessScore?: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  count?: number;
  amount?: number;
  avgRiskScore?: number;
  precision?: number;
  recall?: number;
}

export interface CustomerAnalytics {
  customerId: string;
  
  // Транзакционная активность
  totalTransactions: number;
  fraudTransactions: number;
  totalAmount: number;
  avgAmount: number;
  
  // Поведенческие данные (из CustomerBehaviorPattern)
  deviceChanges: number;
  osVersionChanges: number;
  loginsLast7Days: number;
  loginsLast30Days: number;
  loginFrequencyChange: number;
  latestPhoneModel?: string;
  latestOsVersion?: string;
  
  // Продвинутые метрики
  avgSessionIntervalSec?: number;
  burstinessScore?: number;
  fanoFactor?: number;
  sessionIntervalStd?: number;
  
  // Временная линия транзакций
  transactionTimeline: TransactionTimeline[];
  
  // График сумм по времени
  amountTimeline: AmountTimeSeries[];
  
  // Устройства
  deviceUsage?: DeviceUsage[];
  
  // Risk Profile
  riskProfile: CustomerRiskProfile;
}

export interface CustomerRiskProfile {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  mainRiskFactors: string[];
  behavioralAnomalies: string[];
  recommendations: string[];
}

export interface TransactionTimeline {
  transactionId: number;
  transactionDate: string;
  amount: number;
  isFraud: boolean;
  recipientId: string;
  riskScore: number;
  decision?: 'APPROVE' | 'REVIEW' | 'BLOCK';
}

export interface AmountTimeSeries {
  date: string;
  amount: number;
  isFraud: boolean;
  transactionCount: number;
}

export interface DeviceUsage {
  deviceModel: string;
  osVersion: string;
  usageCount: number;
  lastUsed: string;
}

// Фильтры для транзакций
export interface TransactionFilters {
  fraudStatus?: 'all' | 'fraud' | 'safe';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  decision?: 'APPROVE' | 'REVIEW' | 'BLOCK';
  customerId?: string;
}

export interface FilteredTransactionsResponse {
  transactions: Transaction[];
  total: number;
  fraudCount: number;
  totalAmount: number;
  avgRiskScore: number;
}

export interface Transaction {
  id: number;
  transactionId: string;
  customerId: string;
  recipientId: string;
  amount: number;
  transactionDateTime: string;
  isFraud: boolean;
  fraudProbability?: number;
  decision?: 'APPROVE' | 'REVIEW' | 'BLOCK';
}

// Feature Importance для интерпретируемости
export interface FeatureImportance {
  featureName: string;
  importance: number;
  category: 'transaction' | 'behavioral' | 'device' | 'temporal';
  description: string;
}

export interface ModelExplainability {
  featureImportances: FeatureImportance[];
  shapValues?: ShapValue[];
  topRiskFactors: string[];
}

export interface ShapValue {
  featureName: string;
  shapValue: number;
  featureValue: string | number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Enhanced API Methods
// ============================================

export const statisticsApi = {
  // Dashboard статистика
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      '/statistics/dashboard'
    );
    return response.data;
  },

  // Аналитика клиента
  getCustomerAnalytics: async (customerId: string): Promise<ApiResponse<CustomerAnalytics>> => {
    const response = await axiosInstance.get<ApiResponse<CustomerAnalytics>>(
      `/statistics/customer/${customerId}`
    );
    return response.data;
  },

  // ML метрики модели
  getModelMetrics: async (): Promise<ApiResponse<ModelMetrics>> => {
    const response = await axiosInstance.get<ApiResponse<ModelMetrics>>(
      '/statistics/model-metrics'
    );
    return response.data;
  },

  // Feature Importance
  getFeatureImportance: async (): Promise<ApiResponse<FeatureImportance[]>> => {
    const response = await axiosInstance.get<ApiResponse<FeatureImportance[]>>(
      '/statistics/feature-importance'
    );
    return response.data;
  },

  // Фильтрованные транзакции
  getFilteredTransactions: async (filters: TransactionFilters): Promise<ApiResponse<FilteredTransactionsResponse>> => {
    const response = await axiosInstance.post<ApiResponse<FilteredTransactionsResponse>>(
      '/statistics/transactions/filter',
      filters
    );
    return response.data;
  },

  // Поведенческая аналитика
  getBehavioralInsights: async (): Promise<ApiResponse<BehavioralInsights>> => {
    const response = await axiosInstance.get<ApiResponse<BehavioralInsights>>(
      '/statistics/behavioral-insights'
    );
    return response.data;
  },

  // Экспорт отчета
  exportReport: async (format: 'pdf' | 'excel'): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/statistics/export?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};