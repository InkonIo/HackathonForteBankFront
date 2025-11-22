import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi, type DashboardStats } from '../../api/statisticsApi';
import Navbar from '../../components/Layout/Navbar';
import './Dashboard.css'; // Используем существующий CSS + новый enhanced CSS

const EnhancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'ml-metrics' | 'behavioral'>('overview');
  const [selectedChart, setSelectedChart] = useState<'fraud' | 'amount' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedChart) {
        setSelectedChart(null);
      }
    };

    if (selectedChart) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [selectedChart]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await statisticsApi.getDashboardStats();
      console.log('📊 Dashboard Stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
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

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner-large"></div>
          <p>Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="error-screen">
          <p>Не удалось загрузить статистику</p>
          <button onClick={loadDashboardStats}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="dashboard-content">
        {/* Header with Tabs */}
        <div className="dashboard-header-enhanced">
          <div className="header-left">
            <h1>🛡️ Forte Bank - Fraud Detection System</h1>
            <p className="subtitle">ML-модель по выявлению мошеннических переводов</p>
          </div>
          <div className="view-tabs">
            <button
              className={activeView === 'overview' ? 'active' : ''}
              onClick={() => setActiveView('overview')}
            >
              📊 Обзор
            </button>
            <button
              className={activeView === 'ml-metrics' ? 'active' : ''}
              onClick={() => setActiveView('ml-metrics')}
            >
              🤖 ML Метрики
            </button>
            <button
              className={activeView === 'behavioral' ? 'active' : ''}
              onClick={() => setActiveView('behavioral')}
            >
              🧠 Поведение
            </button>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="kpi-grid-main">
          <div className="kpi-card-main primary">
            <div className="kpi-header">
              <span className="kpi-icon">💰</span>
              <span className="kpi-title">Предотвращенные потери</span>
            </div>
            <div className="kpi-value-main">{formatCurrency(stats.preventedLosses || stats.fraudAmount)} ₸</div>
            <div className="kpi-detail-main">
              {stats.fraudCount} заблокированных транзакций
            </div>
          </div>

          <div className="kpi-card-main success">
            <div className="kpi-header">
              <span className="kpi-icon">🎯</span>
              <span className="kpi-title">Точность модели (Precision)</span>
            </div>
            <div className="kpi-value-main">{formatPercent(stats.modelMetrics?.precision || 0)}</div>
            <div className="kpi-detail-main">
              Recall: {formatPercent(stats.modelMetrics?.recall || 0)}
            </div>
          </div>

          <div className="kpi-card-main warning">
            <div className="kpi-header">
              <span className="kpi-icon">⚡</span>
              <span className="kpi-title">Скорость реакции</span>
            </div>
            <div className="kpi-value-main">&lt;1 сек</div>
            <div className="kpi-detail-main">
              Мгновенный анализ транзакций
            </div>
          </div>

          <div className="kpi-card-main info">
            <div className="kpi-header">
              <span className="kpi-icon">📈</span>
              <span className="kpi-title">ROC-AUC Score</span>
            </div>
            <div className="kpi-value-main">{(stats.modelMetrics?.rocAuc || 0).toFixed(3)}</div>
            <div className="kpi-detail-main">
              F-beta: {(stats.modelMetrics?.fbetaScore || 0).toFixed(3)}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <>
            {/* Enhanced Charts with Modal */}
            <div className="charts-section">
              {/* Fraud Trend Chart */}
              <div 
                className="chart-container clickable" 
                onClick={() => setSelectedChart('fraud')}
              >
                <div className="chart-header">
                  <h2>📉 Тренд мошенничества</h2>
                  <span className="chart-click-hint">
                    🔍 Нажмите для увеличения
                  </span>
                </div>
                <div className="chart-wrapper">
                  {stats.fraudTrend && stats.fraudTrend.length > 0 ? (
                    <div className="line-chart">
                      {stats.fraudTrend.map((point, index) => {
                        const maxCount = Math.max(...stats.fraudTrend.map(p => p.count || 0), 1);
                        const height = ((point.count || 0) / maxCount) * 100;
                        
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <div className="chart-bar">
                              <div 
                                className="chart-fill fraud-fill"
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${point.date}: ${point.count} мошеннических`}
                              >
                                <span className="chart-value">{point.count}</span>
                              </div>
                            </div>
                            <div className="chart-label">
                              {new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <p>📊 Нет данных</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Trend Chart */}
              <div 
                className="chart-container clickable" 
                onClick={() => setSelectedChart('amount')}
              >
                <div className="chart-header">
                  <h2>💵 Объем транзакций</h2>
                  <span className="chart-click-hint">
                    🔍 Нажмите для увеличения
                  </span>
                </div>
                <div className="chart-wrapper">
                  {stats.amountTrend && stats.amountTrend.length > 0 ? (
                    <div className="line-chart">
                      {stats.amountTrend.map((point, index) => {
                        const maxAmount = Math.max(...stats.amountTrend.map(p => p.amount || 0), 1);
                        const height = ((point.amount || 0) / maxAmount) * 100;
                        
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <div className="chart-bar">
                              <div 
                                className="chart-fill amount-fill"
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${point.date}: ${formatCurrency(point.amount || 0)} ₸`}
                              >
                                <span className="chart-value-small">
                                  {((point.amount || 0) / 1000).toFixed(0)}k
                                </span>
                              </div>
                            </div>
                            <div className="chart-label">
                              {new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <p>📊 Нет данных</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risky Customers */}
            <div className="risky-customers-section">
              <h2>⚡ Топ рискованных клиентов</h2>
              <div className="customers-table">
                <div className="table-header">
                  <div className="th">Клиент</div>
                  <div className="th">Транзакции</div>
                  <div className="th">Мошенничество</div>
                  <div className="th">% Риска</div>
                  <div className="th">Сумма</div>
                  <div className="th">Risk Score</div>
                  <div className="th">Устройства</div>
                  <div className="th">Действие</div>
                </div>
                {stats.topRiskyCustomers?.slice(0, 10).map((customer, index) => (
                  <div key={index} className="table-row">
                    <div className="td customer-id">
                      <span className="rank">#{index + 1}</span>
                      {customer.customerId}
                    </div>
                    <div className="td">{customer.transactionCount}</div>
                    <div className="td fraud-count">{customer.fraudCount}</div>
                    <div className="td">
                      <div className="fraud-rate-badge">
                        {(customer.fraudRate).toFixed(2)}%
                      </div>
                    </div>
                    <div className="td">{formatCurrency(customer.totalAmount)} ₸</div>
                    <div className="td">
                      <div className="risk-score-badge">
                        {customer.avgRiskScore.toFixed(0)}
                      </div>
                    </div>
                    <div className="td">
                      {customer.deviceChanges ? (
                        <span className="device-badge">
                          📱 {customer.deviceChanges}
                        </span>
                      ) : '-'}
                    </div>
                    <div className="td">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/customer/${customer.customerId}`)}
                      >
                        Подробнее →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ML Metrics Tab */}
        {activeView === 'ml-metrics' && stats.modelMetrics && (
          <div className="ml-metrics-view">
            <div className="metrics-grid">
              <div className="metric-card precision">
                <h3>Precision (Точность)</h3>
                <div className="metric-value">{formatPercent(stats.modelMetrics.precision)}</div>
                <div className="metric-description">
                  TP / (TP + FP) = {stats.modelMetrics.truePositives} / ({stats.modelMetrics.truePositives} + {stats.modelMetrics.falsePositives})
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.precision * 100}%` }}></div>
                </div>
              </div>

              <div className="metric-card recall">
                <h3>Recall (Полнота)</h3>
                <div className="metric-value">{formatPercent(stats.modelMetrics.recall)}</div>
                <div className="metric-description">
                  TP / (TP + FN) = {stats.modelMetrics.truePositives} / ({stats.modelMetrics.truePositives} + {stats.modelMetrics.falseNegatives})
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.recall * 100}%` }}></div>
                </div>
              </div>

              <div className="metric-card f1">
                <h3>F1-Score</h3>
                <div className="metric-value">{(stats.modelMetrics.f1Score).toFixed(4)}</div>
                <div className="metric-description">
                  Harmonic mean of Precision and Recall
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.f1Score * 100}%` }}></div>
                </div>
              </div>

              <div className="metric-card fbeta">
                <h3>F-beta Score</h3>
                <div className="metric-value">{(stats.modelMetrics.fbetaScore).toFixed(4)}</div>
                <div className="metric-description">
                  Weighted F-score (β = 2)
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.fbetaScore * 100}%` }}></div>
                </div>
              </div>

              <div className="metric-card roc">
                <h3>ROC-AUC</h3>
                <div className="metric-value">{(stats.modelMetrics.rocAuc).toFixed(4)}</div>
                <div className="metric-description">
                  Area Under the ROC Curve
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.rocAuc * 100}%` }}></div>
                </div>
              </div>

              <div className="metric-card accuracy">
                <h3>Accuracy</h3>
                <div className="metric-value">{formatPercent(stats.modelMetrics.accuracy)}</div>
                <div className="metric-description">
                  (TP + TN) / Total
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${stats.modelMetrics.accuracy * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="confusion-matrix-section">
              <h2>📊 Confusion Matrix</h2>
              <div className="confusion-matrix">
                <div className="matrix-row">
                  <div className="matrix-label"></div>
                  <div className="matrix-label-col">Predicted Fraud</div>
                  <div className="matrix-label-col">Predicted Safe</div>
                </div>
                <div className="matrix-row">
                  <div className="matrix-label-row">Actual Fraud</div>
                  <div className="matrix-cell tp">
                    <div className="cell-label">True Positive</div>
                    <div className="cell-value">{stats.modelMetrics.truePositives}</div>
                  </div>
                  <div className="matrix-cell fn">
                    <div className="cell-label">False Negative</div>
                    <div className="cell-value">{stats.modelMetrics.falseNegatives}</div>
                  </div>
                </div>
                <div className="matrix-row">
                  <div className="matrix-label-row">Actual Safe</div>
                  <div className="matrix-cell fp">
                    <div className="cell-label">False Positive</div>
                    <div className="cell-value">{stats.modelMetrics.falsePositives}</div>
                  </div>
                  <div className="matrix-cell tn">
                    <div className="cell-label">True Negative</div>
                    <div className="cell-value">{stats.modelMetrics.trueNegatives}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Behavioral Tab */}
        {activeView === 'behavioral' && stats.behavioralInsights && (
          <div className="behavioral-view">
            <div className="behavioral-grid">
              <div className="behavioral-card">
                <div className="behavioral-icon">📱</div>
                <div className="behavioral-content">
                  <h3>Смена устройств</h3>
                  <div className="behavioral-value">{stats.behavioralInsights.avgDeviceChanges.toFixed(1)}</div>
                  <div className="behavioral-subtitle">среднее кол-во смен за 30 дней</div>
                </div>
              </div>

              <div className="behavioral-card">
                <div className="behavioral-icon">💻</div>
                <div className="behavioral-content">
                  <h3>Версии ОС</h3>
                  <div className="behavioral-value">{stats.behavioralInsights.avgOsChanges.toFixed(1)}</div>
                  <div className="behavioral-subtitle">среднее кол-во изменений ОС</div>
                </div>
              </div>

              <div className="behavioral-card">
                <div className="behavioral-icon">🔍</div>
                <div className="behavioral-content">
                  <h3>Подозрительные входы</h3>
                  <div className="behavioral-value">{stats.behavioralInsights.suspiciousLoginPatterns}</div>
                  <div className="behavioral-subtitle">аномальных паттернов</div>
                </div>
              </div>

              <div className="behavioral-card">
                <div className="behavioral-icon">⚡</div>
                <div className="behavioral-content">
                  <h3>Высокая активность</h3>
                  <div className="behavioral-value">{stats.behavioralInsights.highFrequencyUsers}</div>
                  <div className="behavioral-subtitle">пользователей с высокой частотой</div>
                </div>
              </div>

              <div className="behavioral-card">
                <div className="behavioral-icon">🎭</div>
                <div className="behavioral-content">
                  <h3>Аномалии сессий</h3>
                  <div className="behavioral-value">{stats.behavioralInsights.anomalousSessionPatterns}</div>
                  <div className="behavioral-subtitle">аномальных паттернов сессий</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Modal */}
        {selectedChart && (
          <div 
            className="modal-overlay"
            onClick={() => setSelectedChart(null)}
          >
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>
                    {selectedChart === 'fraud' ? '📉 Детальный тренд мошенничества' : '💵 Детальный объем транзакций'}
                  </h2>
                  <p className="modal-subtitle">
                    {selectedChart === 'fraud' 
                      ? `Всего мошеннических транзакций: ${stats.fraudCount.toLocaleString()}`
                      : `Общий объем: ${formatCurrency(stats.totalAmount)} ₸`
                    }
                  </p>
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedChart(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {selectedChart === 'fraud' && stats.fraudTrend && stats.fraudTrend.length > 0 && (
                  <>
                    <div className="modal-stats-grid fraud-stats">
                      <div className="modal-stat-item">
                        <div className="modal-stat-label">Средний показатель</div>
                        <div className="modal-stat-value fraud">
                          {(stats.fraudTrend.reduce((sum, p) => sum + (p.count || 0), 0) / stats.fraudTrend.length).toFixed(1)} / день
                        </div>
                      </div>
                      <div className="modal-stat-item">
                        <div className="modal-stat-label">Пиковое значение</div>
                        <div className="modal-stat-value fraud-peak">
                          {Math.max(...stats.fraudTrend.map(p => p.count || 0))} транзакций
                        </div>
                      </div>
                    </div>
                    <div className="line-chart-large">
                      {stats.fraudTrend.map((point, index) => {
                        const maxCount = Math.max(...stats.fraudTrend.map(p => p.count || 0), 1);
                        const height = ((point.count || 0) / maxCount) * 100;
                        
                        return (
                          <div key={index} className="chart-bar-wrapper-large">
                            <div className="chart-bar-large">
                              <div 
                                className="chart-fill fraud-fill"
                                style={{ height: `${Math.max(height, 5)}%` }}
                              >
                                <span className="chart-value-large">{point.count}</span>
                              </div>
                            </div>
                            <div className="chart-label-large">
                              {new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {selectedChart === 'amount' && stats.amountTrend && stats.amountTrend.length > 0 && (
                  <>
                    <div className="modal-stats-grid amount-stats">
                      <div className="modal-stat-item">
                        <div className="modal-stat-label">Средний объем</div>
                        <div className="modal-stat-value amount">
                          {formatCurrency(stats.amountTrend.reduce((sum, p) => sum + (p.amount || 0), 0) / stats.amountTrend.length)} ₸
                        </div>
                      </div>
                      <div className="modal-stat-item">
                        <div className="modal-stat-label">Максимум за день</div>
                        <div className="modal-stat-value amount-peak">
                          {formatCurrency(Math.max(...stats.amountTrend.map(p => p.amount || 0)))} ₸
                        </div>
                      </div>
                    </div>
                    <div className="line-chart-large">
                      {stats.amountTrend.map((point, index) => {
                        const maxAmount = Math.max(...stats.amountTrend.map(p => p.amount || 0), 1);
                        const height = ((point.amount || 0) / maxAmount) * 100;
                        
                        return (
                          <div key={index} className="chart-bar-wrapper-large">
                            <div className="chart-bar-large">
                              <div 
                                className="chart-fill amount-fill"
                                style={{ height: `${Math.max(height, 5)}%` }}
                              >
                                <span className="chart-value-large">
                                  {formatCurrency(point.amount || 0)} ₸
                                </span>
                              </div>
                            </div>
                            <div className="chart-label-large">
                              {new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;