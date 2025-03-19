import { useState, useEffect } from 'react';
import axios from '../utils/api';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

export default function AnalyticsPage() {
  const [issueData, setIssueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('yearly');

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/issues`);
      processData(response.data);
    } catch (error) {
      console.error('載入資料失敗', error);
      setError('無法載入數據，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const processData = (issues) => {
    if (!issues || issues.length === 0) {
      setIssueData(null);
      return;
    }

    // 按年份和月份分組
    const issuesByYearMonth = {};
    const issuesByType = {};
    const issuesBySource = {};
    const issuesByStatus = {};
    const issuesByYearQuarter = {};

    // 初始化月份資料
    for (let i = 1; i <= 12; i++) {
      if (!issuesByYearMonth[year]) {
        issuesByYearMonth[year] = {};
      }
      issuesByYearMonth[year][i] = 0;
    }

    // 初始化季度資料
    for (let q = 1; q <= 4; q++) {
      if (!issuesByYearQuarter[year]) {
        issuesByYearQuarter[year] = {};
      }
      issuesByYearQuarter[year][q] = 0;
    }

    issues.forEach(issue => {
      const createdAt = new Date(issue.created_at);
      const issueYear = createdAt.getFullYear();
      const issueMonth = createdAt.getMonth() + 1;
      const issueQuarter = Math.ceil(issueMonth / 3);
      const issueType = issue.issue_type || '未分類';
      const issueSource = issue.source || '未知';
      const issueStatus = issue.status || '未知';

      // 按年月統計
      if (!issuesByYearMonth[issueYear]) {
        issuesByYearMonth[issueYear] = {};
      }
      if (!issuesByYearMonth[issueYear][issueMonth]) {
        issuesByYearMonth[issueYear][issueMonth] = 0;
      }
      issuesByYearMonth[issueYear][issueMonth]++;

      // 按年季度統計
      if (!issuesByYearQuarter[issueYear]) {
        issuesByYearQuarter[issueYear] = {};
      }
      if (!issuesByYearQuarter[issueYear][issueQuarter]) {
        issuesByYearQuarter[issueYear][issueQuarter] = 0;
      }
      issuesByYearQuarter[issueYear][issueQuarter]++;

      // 按類型統計
      if (!issuesByType[issueType]) {
        issuesByType[issueType] = 0;
      }
      issuesByType[issueType]++;

      // 按來源統計
      if (!issuesBySource[issueSource]) {
        issuesBySource[issueSource] = 0;
      }
      issuesBySource[issueSource]++;

      // 按狀態統計
      if (!issuesByStatus[issueStatus]) {
        issuesByStatus[issueStatus] = 0;
      }
      issuesByStatus[issueStatus]++;
    });

    // 計算年度累計
    const yearlyTotals = {};
    Object.keys(issuesByYearMonth).sort().forEach(yr => {
      yearlyTotals[yr] = Object.values(issuesByYearMonth[yr]).reduce((sum, count) => sum + count, 0);
    });

    setIssueData({
      byYearMonth: issuesByYearMonth,
      byType: issuesByType,
      bySource: issuesBySource,
      byStatus: issuesByStatus,
      byYearQuarter: issuesByYearQuarter,
      yearlyTotals: yearlyTotals
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${year}年問題趨勢圖`,
        font: {
          size: 16
        }
      },
    },
  };

  // 生成月度趨勢圖數據
  const getMonthlyTrendData = () => {
    if (!issueData || !issueData.byYearMonth || !issueData.byYearMonth[year]) {
      return {
        labels: [],
        datasets: []
      };
    }

    const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthlyCounts = Array(12).fill(0);

    // 填充數據
    for (let month = 1; month <= 12; month++) {
      if (issueData.byYearMonth[year][month]) {
        monthlyCounts[month - 1] = issueData.byYearMonth[year][month];
      }
    }

    // 生成累計數據
    let cumulative = 0;
    const cumulativeCounts = monthlyCounts.map(count => {
      cumulative += count;
      return cumulative;
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: '月度問題數',
          data: monthlyCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: '年度累計',
          data: cumulativeCounts,
          type: 'line',
          fill: false,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.1
        }
      ],
    };
  };

  // 生成季度趨勢圖數據
  const getQuarterlyTrendData = () => {
    if (!issueData || !issueData.byYearQuarter || !issueData.byYearQuarter[year]) {
      return {
        labels: [],
        datasets: []
      };
    }

    const quarterLabels = ['Q1 (1-3月)', 'Q2 (4-6月)', 'Q3 (7-9月)', 'Q4 (10-12月)'];
    const quarterlyCounts = Array(4).fill(0);

    // 填充數據
    for (let quarter = 1; quarter <= 4; quarter++) {
      if (issueData.byYearQuarter[year][quarter]) {
        quarterlyCounts[quarter - 1] = issueData.byYearQuarter[year][quarter];
      }
    }

    return {
      labels: quarterLabels,
      datasets: [
        {
          label: '季度問題數',
          data: quarterlyCounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        }
      ],
    };
  };

  // 生成問題類型分布圖數據
  const getIssueTypeDistributionData = () => {
    if (!issueData || !issueData.byType) {
      return {
        labels: [],
        datasets: []
      };
    }

    const types = Object.keys(issueData.byType);
    const counts = types.map(type => issueData.byType[type]);

    return {
      labels: types,
      datasets: [
        {
          label: '問題類型分布',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(199, 199, 199, 0.5)',
            'rgba(83, 102, 255, 0.5)',
            'rgba(40, 159, 64, 0.5)',
            'rgba(210, 199, 199, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(40, 159, 64, 1)',
            'rgba(210, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 生成問題來源分布圖數據
  const getIssueSourceDistributionData = () => {
    if (!issueData || !issueData.bySource) {
      return {
        labels: [],
        datasets: []
      };
    }

    const sources = Object.keys(issueData.bySource);
    const counts = sources.map(source => issueData.bySource[source]);

    return {
      labels: sources,
      datasets: [
        {
          label: '問題來源分布',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 生成問題狀態分布圖數據
  const getIssueStatusDistributionData = () => {
    if (!issueData || !issueData.byStatus) {
      return {
        labels: [],
        datasets: []
      };
    }

    const statuses = Object.keys(issueData.byStatus);
    const counts = statuses.map(status => issueData.byStatus[status]);

    return {
      labels: statuses,
      datasets: [
        {
          label: '問題狀態分布',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 生成年度對比數據
  const getYearlyComparisonData = () => {
    if (!issueData || !issueData.yearlyTotals) {
      return {
        labels: [],
        datasets: []
      };
    }

    const years = Object.keys(issueData.yearlyTotals).sort();
    const counts = years.map(yr => issueData.yearlyTotals[yr]);

    return {
      labels: years,
      datasets: [
        {
          label: '年度問題總數',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getYearOptions = () => {
    if (!issueData || !issueData.byYearMonth) return [new Date().getFullYear()];
    return Object.keys(issueData.byYearMonth).sort((a, b) => b - a);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">📊 數據分析儀表板</h1>
            <div className="d-flex align-items-center">
              <span className="me-2">選擇年份：</span>
              <select 
                className="form-select form-select-sm" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
                style={{ width: 'auto' }}
              >
                {getYearOptions().map(yr => (
                  <option key={yr} value={yr}>{yr}年</option>
                ))}
              </select>
              <button className="btn btn-outline-primary btn-sm ms-2" onClick={fetchData}>
                <i className="bi bi-arrow-clockwise me-1"></i>刷新數據
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !issueData ? (
        <div className="alert alert-info">沒有資料可顯示</div>
      ) : (
        <>
          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">年度累計</h5>
                  <h2 className="display-4">
                    {issueData.yearlyTotals[year] || 0}
                  </h2>
                  <p className="card-text">
                    {year}年總問題數
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">最近30天</h5>
                  <h2 className="display-4">
                    {Object.values(issueData.byYearMonth[year] || {}).slice(-1)[0] || 0}
                  </h2>
                  <p className="card-text">
                    最近一個月的問題數
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">已解決問題</h5>
                  <h2 className="display-4">
                    {issueData.byStatus['Closed'] || 0}
                  </h2>
                  <p className="card-text">
                    已關閉的問題總數
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body">
                  <h5 className="card-title">待處理問題</h5>
                  <h2 className="display-4">
                    {(issueData.byStatus['Pending'] || 0) + (issueData.byStatus['In Progress'] || 0)}
                  </h2>
                  <p className="card-text">
                    待處理或進行中的問題
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 圖表切換選項卡 */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'yearly' ? 'active' : ''}`}
                onClick={() => setActiveTab('yearly')}
              >
                年度趨勢
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'quarterly' ? 'active' : ''}`}
                onClick={() => setActiveTab('quarterly')}
              >
                季度分析
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'distribution' ? 'active' : ''}`}
                onClick={() => setActiveTab('distribution')}
              >
                問題分布
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                年度對比
              </button>
            </li>
          </ul>

          {/* 年度趨勢選項卡內容 */}
          {activeTab === 'yearly' && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '400px' }}>
                      <Bar 
                        data={getMonthlyTrendData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: `${year}年月度問題趨勢與累計`
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 季度分析選項卡內容 */}
          {activeTab === 'quarterly' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '400px' }}>
                      <Bar 
                        data={getQuarterlyTrendData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: `${year}年季度問題分布`
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '400px' }}>
                      <Pie 
                        data={getQuarterlyTrendData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: `${year}年季度問題占比`
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 問題分布選項卡內容 */}
          {activeTab === 'distribution' && (
            <div className="row">
              <div className="col-md-4">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '300px' }}>
                      <Doughnut 
                        data={getIssueTypeDistributionData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: '問題類型分布'
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '300px' }}>
                      <Pie 
                        data={getIssueSourceDistributionData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: '問題來源分布'
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '300px' }}>
                      <Doughnut 
                        data={getIssueStatusDistributionData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: '問題狀態分布'
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 年度對比選項卡內容 */}
          {activeTab === 'comparison' && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div style={{ height: '400px' }}>
                      <Bar 
                        data={getYearlyComparisonData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: '歷年問題數量對比'
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 