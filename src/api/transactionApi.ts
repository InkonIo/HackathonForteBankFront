import axiosInstance from './axiosConfig';
import type { Transaction, TransactionAnalysis, ApiResponse } from '../types/transaction.types';

export const transactionApi = {
  getAllTransactions: async (page = 0, size = 50): Promise<ApiResponse<Transaction[]>> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(
      `/transactions?page=${page}&size=${size}`
    );
    return response.data;
  },

  analyzeTransaction: async (id: number): Promise<ApiResponse<TransactionAnalysis>> => {
    const response = await axiosInstance.post<ApiResponse<TransactionAnalysis>>(
      `/transactions/${id}/analyze`
    );
    return response.data;
  },

  getFraudulentTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(
      `/transactions/fraudulent`
    );
    return response.data;
  },
};