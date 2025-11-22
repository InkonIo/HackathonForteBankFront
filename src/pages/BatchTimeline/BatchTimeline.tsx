import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi } from '../../api/statisticsApi';
import Navbar from '../../components/Layout/Navbar';
import './BatchTimeline.css';

interface TimelineTransaction {
  id: number;
  transactionId: string;
  customerId: string;
  recipientId: string;
  amount: number;
  transactionDateTime: string;
  isFraud: boolean;
  fraudProbability?: number;
  deviceModel?: string;
  osVersion?: string;
  loginCount?: number;
}

const BatchTimeline: React.FC = () => {
  const [transactions, setTransactions] = useState<TimelineTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<TimelineTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Фильтры
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    fraudStatus: 'all' as 'all' | 'fraud' | 'safe',
    deviceModel: '',
    customerId: '',
    sortBy: 'date' as 'date' | 'amount' | 'risk'
  });

  useEffect(() => {
    loadTimeline();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const loadTimeline = async () => {
    try {
      setIsLoading(true);
      // Загружаем все транзакции
      const response = await fetch('http://localhost:8080/api/transactions?page=0&size=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setTransactions(data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Фильтр по дате
    if (filters.dateFrom) {
      filtered = filtered.filter(t => 
        new Date(t.transactionDateTime) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => 
        new Date(t.transactionDateTime) <= new Date(filters.dateTo)
      );
    }

    // Фильтр по сумме
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(filters.maxAmount));
    }

    // Фильтр по мошенничеству
    if (filters.fraudStatus === 'fraud') {
      filtered = filtered.filter(t => t.isFraud === true);
    } else if (filters.fraudStatus === 'safe') {
      filtered = filtered.filter(t => t.isFraud === false);
    }

    // Фильтр по устройству
    if (filters.deviceModel) {
      filtered = filtered.filter(t => 
        t.deviceModel?.toLowerCase().includes(filters.deviceModel.toLowerCase())
      );
    }

    // Фильтр по клиенту
    if (filters.customerId) {
      filtered = filtered.filter(t => 
        t.customerId.includes(filters.customerId)
      );
    }

    // Сортировка
    if (filters.sortBy === 'date') {
      filtered.sort((a, b) => 
        new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime()
      );
    } else if (filters.sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (filters.sortBy === 'risk') {
      filtered.sort((a, b) => 
        (b.fraudProbability || 0) - (a.fraudProbability || 0)
      );
    }

    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      fraudStatus: 'all',
      deviceModel: '',
      customerId: '',
      sortBy: 'date'
    });
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getRiskColor = (probability?: number): string => {
    if (!probability) return '#a0aec0';
    if (probability >= 0.85) return '#f56565';
    if (probability >= 0.50) return '#ed8936';
    return '#48bb78';
  };

  const getDecision = (probability?: number): string => {
    if (!probability) return 'N/A';
    if (probability >= 0.85) return 'BLOCK';
    if (probability >= 0.50) return 'REVIEW';
    return 'APPROVE';
  };

  // Группировка по дням для графика
  const groupByDate = () => {
    const grouped: Record<string, {
      count: number;
      fraudCount: number;
      totalAmount: number;
      deviceChanges: Set<string>;
    }> = {};

    filteredData.forEach(t => {
      const date = new Date(t.transactionDateTime).toLocaleDateString('ru-RU');
      if (!grouped[date]) {
        grouped[date] = {
          count: 0,
          fraudCount: 0,
          totalAmount: 0,
          deviceChanges: new Set()
        };
      }
      grouped[date].count++;
      if (t.isFraud) grouped[date].fraudCount++;
      grouped[date].totalAmount += t.amount;
      if (t.deviceModel) grouped[date].deviceChanges.add(t.deviceModel);
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      count: data.count,
      fraudCount: data.fraudCount,
      totalAmount: data.totalAmount,
      deviceChanges: data.deviceChanges.size
    }));
  };

  const timelineData = groupByDate();

  if (isLoading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner-large"></div>
          <p>Загрузка таймлайна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="batch-timeline-content">
        {/* Header */}
        <div className="timeline-header">
          <div>
            <h1>📊 Полный таймлайн транзакций</h1>
            <p className="subtitle">
              Показано {filteredData.length} из {transactions.length} транзакций
            </p>
          </div>
          <button className="reset-filters-btn" onClick={resetFilters}>
            🔄 Сбросить фильтры
          </button>
        </div>

        {/* Filters */}
        <div className="filters-panel">
          <h3>🔍 Фильтры</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Дата от:</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>Дата до:</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>Мин. сумма:</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>Макс. сумма:</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>Статус:</label>
              <select
                value={filters.fraudStatus}
                onChange={(e) => setFilters({...filters, fraudStatus: e.target.value as any})}
              >
                <option value="all">Все</option>
                <option value="fraud">Мошеннические</option>
                <option value="safe">Безопасные</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Устройство:</label>
              <input
                type="text"
                placeholder="Модель устройства"
                value={filters.deviceModel}
                onChange={(e) => setFilters({...filters, deviceModel: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>ID клиента:</label>
              <input
                type="text"
                placeholder="ID клиента"
                value={filters.customerId}
                onChange={(e) => setFilters({...filters, customerId: e.target.value})}
              />
            </div>

            <div className="filter-group">
              <label>Сортировка:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
              >
                <option value="date">По дате</option>
                <option value="amount">По сумме</option>
                <option value="risk">По риску</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Charts */}
        <div className="timeline-charts">
          <div className="timeline-chart-card">
            <h3>📈 Активность по дням</h3>
            <div className="timeline-chart">
              {timelineData.slice(-30).map((point, index) => {
                const maxCount = Math.max(...timelineData.map(p => p.count), 1);
                const height = (point.count / maxCount) * 100;
                const fraudRate = (point.fraudCount / point.count) * 100;

                return (
                  <div key={index} className="timeline-bar-group">
                    <div className="timeline-bar-container">
                      <div 
                        className="timeline-bar safe"
                        style={{ height: `${height}%` }}
                        title={`${point.date}: ${point.count} транзакций`}
                      >
                        <span className="bar-value">{point.count}</span>
                      </div>
                    </div>
                    <div className="bar-label">{point.date.split('.')[0]}</div>
                    {point.fraudCount > 0 && (
                      <div className="fraud-indicator" title={`${point.fraudCount} мошеннических`}>
                        🚨 {point.fraudCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="timeline-chart-card">
            <h3>💰 Объем по дням</h3>
            <div className="timeline-chart">
              {timelineData.slice(-30).map((point, index) => {
                const maxAmount = Math.max(...timelineData.map(p => p.totalAmount), 1);
                const height = (point.totalAmount / maxAmount) * 100;

                return (
                  <div key={index} className="timeline-bar-group">
                    <div className="timeline-bar-container">
                      <div 
                        className="timeline-bar amount"
                        style={{ height: `${height}%` }}
                        title={`${point.date}: ${formatCurrency(point.totalAmount)} ₸`}
                      >
                        <span className="bar-value-small">
                          {(point.totalAmount / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                    <div className="bar-label">{point.date.split('.')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="timeline-chart-card">
            <h3>📱 Смена устройств</h3>
            <div className="timeline-chart">
              {timelineData.slice(-30).map((point, index) => {
                const maxDevices = Math.max(...timelineData.map(p => p.deviceChanges), 1);
                const height = (point.deviceChanges / maxDevices) * 100;

                return (
                  <div key={index} className="timeline-bar-group">
                    <div className="timeline-bar-container">
                      <div 
                        className="timeline-bar devices"
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`${point.date}: ${point.deviceChanges} устройств`}
                      >
                        <span className="bar-value">{point.deviceChanges}</span>
                      </div>
                    </div>
                    <div className="bar-label">{point.date.split('.')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="transactions-table-section">
          <h3>📋 Список транзакций</h3>
          <div className="transactions-table">
            <div className="table-header">
              <div className="th">Дата/Время</div>
              <div className="th">ID Транзакции</div>
              <div className="th">Клиент</div>
              <div className="th">Получатель</div>
              <div className="th">Сумма</div>
              <div className="th">Риск</div>
              <div className="th">Решение</div>
              <div className="th">Устройство</div>
              <div className="th">Статус</div>
            </div>

            {filteredData.slice(0, 100).map((transaction, index) => (
              <div 
                key={index} 
                className={`table-row ${transaction.isFraud ? 'fraud-row' : ''}`}
                onClick={() => navigate(`/customer/${transaction.customerId}`)}
              >
                <div className="td date-col">
                  {new Date(transaction.transactionDateTime).toLocaleString('ru-RU')}
                </div>
                <div className="td id-col">{transaction.transactionId}</div>
                <div className="td customer-col">{transaction.customerId}</div>
                <div className="td recipient-col">
                  {transaction.recipientId.substring(0, 12)}...
                </div>
                <div className="td amount-col">
                  {formatCurrency(transaction.amount)} ₸
                </div>
                <div className="td risk-col">
                  <div 
                    className="risk-badge"
                    style={{ background: getRiskColor(transaction.fraudProbability) }}
                  >
                    {((transaction.fraudProbability || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="td decision-col">
                  <span className={`decision-badge ${getDecision(transaction.fraudProbability).toLowerCase()}`}>
                    {getDecision(transaction.fraudProbability)}
                  </span>
                </div>
                <div className="td device-col">
                  {transaction.deviceModel || 'N/A'}
                </div>
                <div className="td status-col">
                  {transaction.isFraud ? (
                    <span className="status-badge fraud">🚨 Fraud</span>
                  ) : (
                    <span className="status-badge safe">✅ Safe</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredData.length > 100 && (
            <div className="table-footer">
              Показано 100 из {filteredData.length} транзакций
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchTimeline;