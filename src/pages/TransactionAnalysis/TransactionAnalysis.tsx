import React, { useState, useEffect } from 'react';
import { transactionApi } from '../../api/transactionApi';
import type { Transaction, TransactionAnalysis } from '../../types/transaction.types';
import Navbar from '../../components/Layout/Navbar';
import './TransactionAnalysis.css';

const TransactionAnalysisPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'fraud' | 'safe'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await transactionApi.getAllTransactions(0, 100);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const response = await transactionApi.analyzeTransaction(transaction.id);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing transaction:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (probability?: number): string => {
    if (!probability) return 'gray';
    if (probability >= 0.7) return 'red';
    if (probability >= 0.5) return 'orange';
    return 'green';
  };

  const getDecisionBadge = (decision: string) => {
    const colors: Record<string, string> = {
      BLOCK: 'red',
      REVIEW: 'orange',
      APPROVE: 'green',
    };
    return colors[decision] || 'gray';
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'fraud') return t.isFraud === true;
    if (filter === 'safe') return t.isFraud === false;
    return true;
  });

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="content">
        <div className="header">
          <h1>🔍 Анализ транзакций</h1>
          <div className="filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все ({transactions.length})
            </button>
            <button
              className={`filter-btn ${filter === 'fraud' ? 'active' : ''}`}
              onClick={() => setFilter('fraud')}
            >
              🚨 Мошеннические ({transactions.filter(t => t.isFraud).length})
            </button>
            <button
              className={`filter-btn ${filter === 'safe' ? 'active' : ''}`}
              onClick={() => setFilter('safe')}
            >
              ✅ Безопасные ({transactions.filter(t => !t.isFraud).length})
            </button>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Левая часть - список транзакций */}
          <div className="transactions-list">
            <h3>Транзакции</h3>
            {isLoading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="transaction-cards">
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`transaction-card ${
                      selectedTransaction?.id === transaction.id ? 'selected' : ''
                    } ${transaction.isFraud ? 'fraud' : 'safe'}`}
                    onClick={() => handleAnalyze(transaction)}
                  >
                    <div className="card-header">
                      <span className="transaction-id">#{transaction.id}</span>
                      {transaction.isFraud && <span className="fraud-badge">🚨 Fraud</span>}
                    </div>
                    <div className="card-body">
                      <div className="amount">{transaction.amount.toLocaleString()} ₸</div>
                      <div className="customer">Клиент: {transaction.customerId}</div>
                      <div className="date">
                        {new Date(transaction.transactionDateTime).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    {transaction.fraudProbability !== undefined && (
                      <div className="card-footer">
                        <div className="probability">
                          Риск: {(transaction.fraudProbability * 100).toFixed(0)}%
                        </div>
                        <div
                          className="risk-indicator"
                          style={{
                            backgroundColor: getRiskColor(transaction.fraudProbability),
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая часть - детальный анализ */}
          <div className="analysis-panel">
            {!selectedTransaction ? (
              <div className="empty-state">
                <p>👈 Выберите транзакцию для анализа</p>
              </div>
            ) : isAnalyzing ? (
              <div className="analyzing">
                <div className="spinner"></div>
                <p>🤖 AI анализирует транзакцию...</p>
              </div>
            ) : analysis ? (
              <div className="analysis-result">
                <div className="result-header">
                  <h2>Результат анализа</h2>
                  <span
                    className={`decision-badge ${getDecisionBadge(analysis.decision)}`}
                  >
                    {analysis.decision === 'BLOCK' && '🚫 БЛОКИРОВАТЬ'}
                    {analysis.decision === 'REVIEW' && '⚠️ ПРОВЕРИТЬ'}
                    {analysis.decision === 'APPROVE' && '✅ ОДОБРИТЬ'}
                  </span>
                </div>

                {/* Fraud Probability */}
                <div className="section">
                  <h3>Вероятность мошенничества</h3>
                  <div className="probability-bar-container">
                    <div
                      className="probability-bar"
                      style={{
                        width: `${analysis.fraudProbability * 100}%`,
                        backgroundColor: getRiskColor(analysis.fraudProbability),
                      }}
                    >
                      <span className="probability-text">
                        {(analysis.fraudProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="risk-score">
                    Risk Score: {analysis.riskScore}/100
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="section">
                  <h3>⚠️ Факторы риска</h3>
                  <div className="risk-factors">
                    {analysis.riskFactors.map((factor: any, index: number) => (
                      <div key={index} className="risk-factor">
                        <div className="factor-header">
                          <span className="factor-name">{factor.name}</span>
                          <span className="factor-score">+{factor.score}</span>
                        </div>
                        <div className="factor-description">{factor.description}</div>
                        <div className="factor-weight">
                          Вес: {(factor.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="section">
                  <h3>🤖 AI Объяснение</h3>
                  <div className="ai-explanation">{analysis.aiExplanation}</div>
                </div>

                {/* Recommendations */}
                <div className="section">
                  <h3>💡 Рекомендации</h3>
                  <div className="recommendations">
                    {analysis.recommendations.split('\n').map((line: string, index: number) => (
                      <div key={index} className="recommendation-item">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="section">
                  <h3>📋 Детали транзакции</h3>
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span className="label">ID:</span>
                      <span className="value">{selectedTransaction.transactionId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Клиент:</span>
                      <span className="value">{selectedTransaction.customerId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Сумма:</span>
                      <span className="value">
                        {selectedTransaction.amount.toLocaleString()} ₸
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Получатель:</span>
                      <span className="value">{selectedTransaction.recipientId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Время:</span>
                      <span className="value">
                        {new Date(selectedTransaction.transactionDateTime).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalysisPage;