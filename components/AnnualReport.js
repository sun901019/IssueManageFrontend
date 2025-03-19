import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';

// 註冊所有需要的 ChartJS 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale
);

const AnnualReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [compareYear, setCompareYear] = useState(null);
  const [compareData, setCompareData] = useState(null);

  // 獲取年度報表數據
  const fetchReportData = async (year, isCompare = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/summaries/annual?year=${year}`);
      const data = response.data;
      
      if (isCompare) {
        setCompareData(data);
      } else {
        setReportData(data);
      }
      setError(null);
    } catch (err) {
      setError(`無法獲取${year}年度數據：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    if (compareYear) {
      fetchReportData(compareYear, true);
    } else {
      setCompareData(null);
    }
  }, [compareYear]);

  // 統計卡片樣式
  const cardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  };

  // 圖表通用配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Noto Sans TC', sans-serif"
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!reportData) return null;

  // 準備月度趨勢數據
  const monthlyTrendData = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    datasets: [
      {
        label: `${selectedYear}年問題數量`,
        data: reportData.monthlyStats || Array(12).fill(0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      ...(compareData ? [{
        label: `${compareYear}年問題數量`,
        data: compareData.monthlyStats || Array(12).fill(0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }] : [])
    ]
  };

  return (
    <div className="annual-report">
      <div className="report-header">
        <h1>{selectedYear}年度累積報表</h1>
        <div className="year-selector">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-select"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={compareYear || ''}
            onChange={(e) => setCompareYear(e.target.value ? Number(e.target.value) : null)}
            className="year-select"
          >
            <option value="">選擇比較年份</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
              .filter(year => year !== selectedYear)
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="card" style={cardStyle}>
          <h3>總問題數</h3>
          <div className="number">{reportData.totalIssues || 0}</div>
          {compareData && (
            <div className="compare">
              vs {compareData.totalIssues || 0} ({compareYear})
            </div>
          )}
        </div>
        <div className="card" style={cardStyle}>
          <h3>已解決</h3>
          <div className="number">{reportData.completed || 0}</div>
          <div className="percentage">
            {((reportData.completed / reportData.totalIssues) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="card" style={cardStyle}>
          <h3>處理中</h3>
          <div className="number">{reportData.uncompleted || 0}</div>
          <div className="percentage">
            {((reportData.uncompleted / reportData.totalIssues) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container" style={cardStyle}>
          <h3>月度趨勢</h3>
          <div style={{ height: '300px' }}>
            <Line data={monthlyTrendData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container" style={cardStyle}>
          <h3>問題來源分布</h3>
          <div style={{ height: '300px' }}>
            <Pie 
              data={{
                labels: Object.keys(reportData.sourceStats || {}),
                datasets: [{
                  data: Object.values(reportData.sourceStats || {}),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                  ]
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="chart-container" style={cardStyle}>
          <h3>問題類型分布</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={{
                labels: Object.keys(reportData.typeStats || {}),
                datasets: [{
                  label: '問題數量',
                  data: Object.values(reportData.typeStats || {}),
                  backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .annual-report {
          padding: 20px;
          background: #f5f7fa;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .year-selector {
          display: flex;
          gap: 10px;
        }

        .year-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          text-align: center;
        }

        .card h3 {
          color: #666;
          margin-bottom: 10px;
        }

        .number {
          font-size: 36px;
          font-weight: bold;
          color: #333;
        }

        .percentage {
          color: #666;
          font-size: 14px;
        }

        .compare {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .chart-container {
          min-height: 400px;
        }

        .chart-container h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
          color: #666;
        }

        .error {
          color: #dc3545;
          padding: 20px;
          text-align: center;
          background: #fff;
          border-radius: 8px;
          margin: 20px 0;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .report-header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnualReport; 