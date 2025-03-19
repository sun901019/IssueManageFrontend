// frontend/pages/annual.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import DashboardLayout from "../components/DashboardLayout";

// 註冊必要的 Chart.js 元件
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnnualPage() {
  const [annualData, setAnnualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnualData();
  }, []);

  const fetchAnnualData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/summaries/annual');
      setAnnualData(res.data);
      setError(null);
    } catch (error) {
      console.error("無法取得年度數據:", error);
      setError("無法取得年度數據，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13,
            family: "'Noto Sans TC', sans-serif",
            weight: 500
          },
          usePointStyle: true,
          color: '#666',
          boxWidth: 8,
          boxHeight: 8
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 20
      }
    }
  };

  if (loading) return <div>載入中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!annualData) return null;

  const completionRate = Math.round((annualData.completed / annualData.totalIssues) * 100);

  return (
    <DashboardLayout>
      <div className="annual-report">
        <div className="page-header">
          <h1 className="page-title">查看全年問題統計和數據分析</h1>
          <p className="page-subtitle">掌握系統運營狀況，優化處理流程</p>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div className="stat-value blue">{annualData.totalIssues}</div>
            <div className="stat-label">問題總數</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rate">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <div className="stat-value green">{completionRate}%</div>
            <div className="stat-label">完成率</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div className="stat-value cyan">{annualData.completed}</div>
            <div className="stat-label">已完成問題</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="6" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12" y2="16"/>
              </svg>
            </div>
            <div className="stat-value yellow">{annualData.uncompleted}</div>
            <div className="stat-label">未完成問題</div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>詳細分析</h2>
          </div>
          
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3>問題狀態分布</h3>
                <div className="chart-actions">
                  <button className="action-btn" title="下載圖表">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="chart-wrapper">
                <Pie
                  data={{
                    labels: ['已完成', '未完成'],
                    datasets: [{
                      data: [annualData.completed, annualData.uncompleted],
                      backgroundColor: [
                        'rgba(80, 227, 194, 0.85)',
                        'rgba(255, 107, 107, 0.85)'
                      ],
                      borderColor: [
                        'rgb(80, 227, 194)',
                        'rgb(255, 107, 107)'
                      ],
                      borderWidth: 2
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>來源分布</h3>
                <div className="chart-actions">
                  <button className="action-btn" title="下載圖表">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="chart-wrapper">
                <Pie
                  data={{
                    labels: ['Line chat', '業務', '現場'],
                    datasets: [{
                      data: [45, 3, 8],
                      backgroundColor: [
                        'rgba(74, 144, 226, 0.85)',
                        'rgba(255, 149, 149, 0.85)',
                        'rgba(255, 205, 86, 0.85)'
                      ],
                      borderColor: [
                        'rgb(74, 144, 226)',
                        'rgb(255, 149, 149)',
                        'rgb(255, 205, 86)'
                      ],
                      borderWidth: 2
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>問題類型分布</h3>
                <div className="chart-actions">
                  <button className="action-btn" title="下載圖表">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="chart-wrapper">
                <Pie
                  data={{
                    labels: ['系統', '設備', '系統功能'],
                    datasets: [{
                      data: [19, 25, 12],
                      backgroundColor: [
                        'rgba(80, 227, 194, 0.85)',
                        'rgba(156, 123, 220, 0.85)',
                        'rgba(255, 205, 86, 0.85)'
                      ],
                      borderColor: [
                        'rgb(80, 227, 194)',
                        'rgb(156, 123, 220)',
                        'rgb(255, 205, 86)'
                      ],
                      borderWidth: 2
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          <div className="stats-details">
            <div className="stats-table">
              <div className="table-header">
                <h3>來源統計</h3>
                <div className="table-actions">
                  <button className="action-btn" title="匯出數據">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>來源</th>
                    <th>數量</th>
                    <th>佔比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Line chat</td>
                    <td>45</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>業務</td>
                    <td>3</td>
                    <td>5%</td>
                  </tr>
                  <tr>
                    <td>現場</td>
                    <td>8</td>
                    <td>14%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="stats-table">
              <div className="table-header">
                <h3>問題類型統計</h3>
                <div className="table-actions">
                  <button className="action-btn" title="匯出數據">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>類型</th>
                    <th>數量</th>
                    <th>佔比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>系統</td>
                    <td>19</td>
                    <td>34%</td>
                  </tr>
                  <tr>
                    <td>設備</td>
                    <td>25</td>
                    <td>45%</td>
                  </tr>
                  <tr>
                    <td>系統功能</td>
                    <td>12</td>
                    <td>21%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <style jsx>{`
          .annual-report {
            padding: 24px 32px;
            max-width: 1600px;
            margin: 0 auto;
            background: #f8fafb;
            min-height: calc(100vh - 64px);
          }

          .page-header {
            margin-bottom: 32px;
          }

          .page-title {
            font-size: 18px;
            color: #1a1a1a;
            font-weight: 600;
            margin: 0 0 8px 0;
          }

          .page-subtitle {
            font-size: 14px;
            color: #666;
            margin: 0;
          }

          .stats-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-bottom: 32px;
          }

          .stat-card {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          }

          .stat-icon {
            position: absolute;
            top: 24px;
            right: 24px;
            opacity: 0.15;
            transition: all 0.3s ease;
          }

          .stat-card:hover .stat-icon {
            transform: scale(1.1);
            opacity: 0.2;
          }

          .total { color: #4A90E2; }
          .rate { color: #50E3C2; }
          .completed { color: #50E3C2; }
          .pending { color: #F5A623; }

          .stat-value {
            font-size: 36px;
            font-weight: 600;
            margin: 24px 0 8px;
            line-height: 1.2;
          }

          .stat-label {
            color: #666;
            font-size: 14px;
            font-weight: 500;
          }

          .blue { color: #4A90E2; }
          .green { color: #50E3C2; }
          .cyan { color: #50E3C2; }
          .yellow { color: #F5A623; }

          .content-section {
            background: #fff;
            border-radius: 12px;
            border: 1px solid #f0f0f0;
            padding: 40px;
          }

          .section-header {
            margin-bottom: 32px;
            padding: 0 8px;
          }

          .section-header h2 {
            font-size: 16px;
            color: #1a1a1a;
            font-weight: 600;
            margin: 0;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
            margin-bottom: 40px;
            padding: 0 8px;
          }

          .chart-container {
            background: #fff;
            border-radius: 12px;
            padding: 28px;
            border: 1px solid #f0f0f0;
            transition: all 0.3s ease;
          }

          .chart-container:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          }

          .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 0 4px;
          }

          .chart-header h3 {
            font-size: 15px;
            color: #1a1a1a;
            font-weight: 600;
            margin: 0;
          }

          .chart-wrapper {
            height: 260px;
            position: relative;
            margin: 0 auto;
            max-width: 90%;
          }

          .stats-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            padding: 0 8px;
          }

          .stats-table {
            background: #fff;
            border-radius: 12px;
            padding: 28px;
            border: 1px solid #f0f0f0;
            transition: all 0.3s ease;
          }

          .stats-table:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          }

          .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 0 4px;
          }

          .table-header h3 {
            font-size: 15px;
            color: #1a1a1a;
            font-weight: 600;
            margin: 0;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          th, td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }

          th {
            color: #666;
            font-weight: 500;
            background: #fafafa;
          }

          th:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }

          th:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }

          td {
            color: #333;
          }

          tr:hover td {
            background: #fafafa;
          }

          tr:last-child td {
            border-bottom: none;
          }

          tr:last-child td:first-child {
            border-bottom-left-radius: 8px;
          }

          tr:last-child td:last-child {
            border-bottom-right-radius: 8px;
          }

          .action-btn {
            background: none;
            border: none;
            padding: 8px;
            color: #666;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .action-btn:hover {
            background: #f5f5f5;
            color: #333;
          }

          @media (max-width: 1280px) {
            .charts-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
            }

            .chart-wrapper {
              height: 240px;
            }
          }

          @media (max-width: 1024px) {
            .content-section {
              padding: 32px;
            }

            .charts-grid {
              grid-template-columns: 1fr;
            }

            .stats-details {
              grid-template-columns: 1fr;
            }

            .chart-wrapper {
              height: 280px;
            }
          }

          @media (max-width: 640px) {
            .content-section {
              padding: 24px;
            }

            .charts-grid,
            .stats-details {
              padding: 0;
              gap: 20px;
            }

            .chart-container,
            .stats-table {
              padding: 20px;
            }

            .chart-wrapper {
              height: 240px;
              max-width: 100%;
            }

            th, td {
              padding: 12px;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
