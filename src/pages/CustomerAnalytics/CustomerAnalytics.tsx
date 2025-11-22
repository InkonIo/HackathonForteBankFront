import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { statisticsApi, type CustomerAnalytics } from '../../api/statisticsApi';
import Navbar from '../../components/Layout/Navbar';
import './CustomerAnalytics.css';

const CustomerAnalyticsPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadCustomerAnalytics();
    }
  }, [customerId]);

  const loadCustomerAnalytics = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const response = await statisticsApi.getCustomerAnalytics(customerId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getRiskLevel = (fraudRate: number): string => {
    if (fraudRate === 0) return 'Низкий';
    if (fraudRate < 5) return 'Средний';
    if (fraudRate < 20) return 'Высокий';
    return 'Критический';
  };

  const getRiskColor = (fraudRate: number): string => {
    if (fraudRate === 0) return '#48bb78';
    if (fraudRate < 5) return '#ed8936';
    if (fraudRate < 20) return '#f56565';
    return '#c53030';
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner-large"></div>
          <p>Загрузка аналитики клиента...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="error-screen">
          <p>Клиент не найден</p>
          <button onClick={() => navigate('/dashboard')}>Вернуться на главную</button>
        </div>
      </div>
    );
  }

  const fraudRate = analytics.totalTransactions > 0
    ? (analytics.fraudTransactions / analytics.totalTransactions) * 100
    : 0;

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="customer-analytics-content">
        {/* Header */}
        <div className="analytics-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Назад
          </button>
          <div className="customer-title">
            <h1>👤 Профиль клиента</h1>
            <div className="customer-id-badge">{analytics.customerId}</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon blue">📊</div>
            <div className="summary-content">
              <div className="summary-label">Транзакции</div>
              <div className="summary-value">{analytics.totalTransactions}</div>
              <div className="summary-detail">
                Мошеннических: {analytics.fraudTransactions}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon purple">💰</div>
            <div className="summary-content">
              <div className="summary-label">Общая сумма</div>
              <div className="summary-value">{formatCurrency(analytics.totalAmount)} ₸</div>
              <div className="summary-detail">
                Средняя: {formatCurrency(analytics.avgAmount)} ₸
              </div>
            </div>
          </div>

          <div 
            className="summary-card risk-card"
            style={{ borderLeftColor: getRiskColor(fraudRate) }}
          >
            <div className="summary-icon" style={{ background: getRiskColor(fraudRate) }}>
              ⚠️
            </div>
            <div className="summary-content">
              <div className="summary-label">Уровень риска</div>
              <div className="summary-value" style={{ color: getRiskColor(fraudRate) }}>
                {getRiskLevel(fraudRate)}
              </div>
              <div className="summary-detail">
                {fraudRate.toFixed(2)}% мошенничества
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">📱</div>
            <div className="summary-content">
              <div className="summary-label">Активность</div>
              <div className="summary-value">{analytics.loginsLast7Days}</div>
              <div className="summary-detail">
                входов за 7 дней
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral Indicators */}
        <div className="behavior-section">
          <h2>🧠 Поведенческие индикаторы</h2>
          <div className="behavior-grid">
            <div className="behavior-card">
              <div className="behavior-header">
                <span className="behavior-icon">📱</span>
                <span className="behavior-title">Смена устройств</span>
              </div>
              <div className="behavior-value">{analytics.deviceChanges}</div>
              <div className="behavior-description">
                уникальных устройств за 30 дней
              </div>
              <div className="behavior-indicator">
                {analytics.deviceChanges > 3 ? (
                  <span className="indicator-warning">⚠️ Необычная активность</span>
                ) : (
                  <span className="indicator-safe">✅ Нормально</span>
                )}
              </div>
            </div>

            <div className="behavior-card">
              <div className="behavior-header">
                <span className="behavior-icon">💻</span>
                <span className="behavior-title">ОС версии</span>
              </div>
              <div className="behavior-value">{analytics.osVersionChanges}</div>
              <div className="behavior-description">
                различных версий ОС
              </div>
              <div className="behavior-indicator">
                {analytics.osVersionChanges > 2 ? (
                  <span className="indicator-warning">⚠️ Частые изменения</span>
                ) : (
                  <span className="indicator-safe">✅ Стабильно</span>
                )}
              </div>
            </div>

            <div className="behavior-card">
              <div className="behavior-header">
                <span className="behavior-icon">🔐</span>
                <span className="behavior-title">Входы (7д)</span>
              </div>
              <div className="behavior-value">{analytics.loginsLast7Days}</div>
              <div className="behavior-description">
                авторизаций за неделю
              </div>
              <div className="behavior-indicator">
                {analytics.loginsLast7Days > 20 ? (
                  <span className="indicator-warning">⚠️ Высокая активность</span>
                ) : (
                  <span className="indicator-safe">✅ Норма</span>
                )}
              </div>
            </div>

            <div className="behavior-card">
              <div className="behavior-header">
                <span className="behavior-icon">📈</span>
                <span className="behavior-title">Изменение частоты</span>
              </div>
              <div className="behavior-value">
                {(analytics.loginFrequencyChange * 100).toFixed(0)}%
              </div>
              <div className="behavior-description">
                изменение частоты входов
              </div>
              <div className="behavior-indicator">
                {Math.abs(analytics.loginFrequencyChange) > 0.5 ? (
                  <span className="indicator-warning">⚠️ Резкое изменение</span>
                ) : (
                  <span className="indicator-safe">✅ Стабильно</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Amount Timeline Chart */}
        <div className="timeline-section">
          <h2>💵 График транзакций по дням</h2>
          <div className="timeline-chart">
            {analytics.amountTimeline.map((point, index) => {
              const maxAmount = Math.max(...analytics.amountTimeline.map(p => p.amount));
              const height = maxAmount > 0 ? (point.amount / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="timeline-bar-wrapper">
                  <div className="timeline-bar">
                    <div 
                      className={`timeline-fill ${point.isFraud ? 'fraud' : 'safe'}`}
                      style={{ height: `${height}%` }}
                      title={`${point.date}: ${formatCurrency(point.amount)} ₸ (${point.transactionCount} транз.)`}
                    ></div>
                  </div>
                  <div className="timeline-label">
                    {new Date(point.date).getDate()}
                  </div>
                  <div className="timeline-count">{point.transactionCount}</div>
                </div>
              );
            })}
          </div>
          <div className="timeline-legend">
            <div className="legend-item">
              <div className="legend-color safe"></div>
              <span>Безопасные</span>
            </div>
            <div className="legend-item">
              <div className="legend-color fraud"></div>
              <span>Мошеннические</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="history-section">
          <h2>📋 История транзакций</h2>
          <div className="transaction-history">
            <div className="history-header">
              <div className="h-col">Дата/Время</div>
              <div className="h-col">ID</div>
              <div className="h-col">Получатель</div>
              <div className="h-col">Сумма</div>
              <div className="h-col">Risk Score</div>
              <div className="h-col">Статус</div>
            </div>
            {analytics.transactionTimeline.slice(0, 20).map((transaction, index) => (
              <div 
                key={index} 
                className={`history-row ${transaction.isFraud ? 'fraud-row' : ''}`}
              >
                <div className="h-col date-col">
                  {transaction.transactionDate}
                </div>
                <div className="h-col id-col">
                  #{transaction.transactionId}
                </div>
                <div className="h-col recipient-col">
                  {transaction.recipientId.substring(0, 16)}...
                </div>
                <div className="h-col amount-col">
                  {formatCurrency(transaction.amount)} ₸
                </div>
                <div className="h-col risk-col">
                  <div 
                    className="risk-badge"
                    style={{
                      background: transaction.riskScore > 70 
                        ? '#f56565' 
                        : transaction.riskScore > 40 
                          ? '#ed8936' 
                          : '#48bb78'
                    }}
                  >
                    {transaction.riskScore.toFixed(0)}
                  </div>
                </div>
                <div className="h-col status-col">
                  {transaction.isFraud ? (
                    <span className="status-badge fraud">🚨 Мошенничество</span>
                  ) : (
                    <span className="status-badge safe">✅ Безопасно</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {analytics.transactionTimeline.length > 20 && (
            <div className="show-more">
              <button>Показать ещё ({analytics.transactionTimeline.length - 20})</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalyticsPage;