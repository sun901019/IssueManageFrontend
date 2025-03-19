// frontend/pages/annual.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DashboardLayout from "../components/DashboardLayout";

// 註冊必要的 Chart.js 元件
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnnualPage() {
  const [year, setYear] = useState("2025");
  const [annualData, setAnnualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 新增：用於切換視圖

  useEffect(() => {
    fetchAnnualData(year);
  }, [year]);

  const fetchAnnualData = async (y) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`正在請求年度數據: /summaries/annual?year=${y}`);
      const res = await axios.get(`/summaries/annual?year=${y}`);
      console.log('API響應:', res.data);
      
      const data = {
        totalCount: res.data.totalIssues || 0,
        closedCount: res.data.completed || 0,
        pendingCount: res.data.uncompleted || 0,
        sourceDistribution: res.data.sourceStats || {},
        typeDistribution: res.data.typeStats || {}
      };
      
      setAnnualData(data);
    } catch (error) {
      console.error("無法取得年度數據:", error);
      setError("無法取得年度數據，請稍後再試");
      setAnnualData(null);
    } finally {
      setLoading(false);
    }
  };

  // 圓餅圖配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Noto Sans TC', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        bodyFont: {
          size: 13
        },
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // 準備狀態分布的圓餅圖數據
  const getStatusChartData = () => {
    if (!annualData) return null;
    
    return {
      labels: ['已完成', '未完成'],
      datasets: [
        {
          data: [annualData.closedCount || 0, annualData.pendingCount || 0],
          backgroundColor: [
            'rgba(46, 184, 92, 0.85)',
            'rgba(255, 159, 64, 0.85)'
          ],
          borderColor: [
            'rgba(46, 184, 92, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'rgba(46, 184, 92, 0.95)',
            'rgba(255, 159, 64, 0.95)'
          ],
          hoverBorderColor: [
            'rgba(46, 184, 92, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          hoverBorderWidth: 3
        }
      ]
    };
  };

  // 準備來源分布的圓餅圖數據
  const getSourceChartData = () => {
    if (!annualData || !annualData.sourceDistribution) return null;
    
    const labels = Object.keys(annualData.sourceDistribution);
    const data = Object.values(annualData.sourceDistribution);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.85)',
            'rgba(255, 99, 132, 0.85)',
            'rgba(255, 206, 86, 0.85)',
            'rgba(75, 192, 192, 0.85)',
            'rgba(153, 102, 255, 0.85)',
            'rgba(255, 159, 64, 0.85)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'rgba(54, 162, 235, 0.95)',
            'rgba(255, 99, 132, 0.95)',
            'rgba(255, 206, 86, 0.95)',
            'rgba(75, 192, 192, 0.95)',
            'rgba(153, 102, 255, 0.95)',
            'rgba(255, 159, 64, 0.95)'
          ],
          hoverBorderWidth: 3
        }
      ]
    };
  };

  // 準備類型分布的圓餅圖數據
  const getTypeChartData = () => {
    if (!annualData || !annualData.typeDistribution) return null;
    
    const labels = Object.keys(annualData.typeDistribution);
    const data = Object.values(annualData.typeDistribution);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.85)',
            'rgba(153, 102, 255, 0.85)',
            'rgba(255, 206, 86, 0.85)',
            'rgba(255, 99, 132, 0.85)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'rgba(75, 192, 192, 0.95)',
            'rgba(153, 102, 255, 0.95)',
            'rgba(255, 206, 86, 0.95)',
            'rgba(255, 99, 132, 0.95)'
          ],
          hoverBorderWidth: 3
        }
      ]
    };
  };

  // 計算統計數據
  const totalIssues = annualData?.totalCount || 0;
  const closedIssues = annualData?.closedCount || 0;
  const pendingIssues = annualData?.pendingCount || 0;
  const resolutionRate = totalIssues ? Math.round((closedIssues / totalIssues) * 100) : 0;

  // 準備頁面標題和年份選擇器
  const titleActions = (
    <div className="ms-auto d-flex align-items-center">
      <label className="me-2">選擇年份：</label>
      <select 
        className="form-select form-select-sm"
        style={{ width: "100px" }}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
      <button 
        className="btn btn-sm btn-primary ms-2"
        onClick={() => fetchAnnualData(year)}
        disabled={loading}
      >
        <i className="bi bi-arrow-repeat me-1"></i>
        重新整理
      </button>
    </div>
  );

  return (
    <DashboardLayout 
      title={{
        icon: "bi bi-calendar-check",
        text: `${year} 年度累計報表`,
        actions: titleActions
      }}
    >
      <div className="row g-3">
        <div className="col-12">
          <div className="alert alert-info bg-light border-info border-opacity-25">
            <i className="bi bi-info-circle-fill me-2 text-info"></i>
            <span className="text-secondary">查看全年問題統計和數據分析，掌握系統運營狀況</span>
          </div>
        </div>

        {loading ? (
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">載入中...</span>
                </div>
                <p className="text-muted mb-0">正在載入年度數據...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
              <div>
                <h5 className="alert-heading mb-1">載入失敗</h5>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </div>
        ) : !annualData ? (
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-exclamation-circle-fill fs-4 me-3"></i>
              <div>
                <h5 className="alert-heading mb-1">無數據</h5>
                <p className="mb-0">無法獲取 {year} 年度數據</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 統計卡片 */}
            <div className="col-md-3">
              <div className="card border-0 bg-gradient h-100" 
                   style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">問題總數</h6>
                    <i className="bi bi-clipboard2-data fs-4"></i>
                  </div>
                  <h2 className="display-4 fw-bold mb-0">{totalIssues}</h2>
                  <div className="mt-3 small">
                    較上月
                    <span className="ms-2">
                      <i className="bi bi-arrow-up-right"></i>
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-gradient h-100" 
                   style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">完成率</h6>
                    <i className="bi bi-check2-circle fs-4"></i>
                  </div>
                  <h2 className="display-4 fw-bold mb-0">{resolutionRate}%</h2>
                  <div className="mt-3 small">
                    較上月
                    <span className="ms-2">
                      <i className="bi bi-arrow-up-right"></i>
                      +5%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-gradient h-100" 
                   style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">已完成問題</h6>
                    <i className="bi bi-check2-all fs-4"></i>
                  </div>
                  <h2 className="display-4 fw-bold mb-0">{closedIssues}</h2>
                  <div className="mt-3 small">
                    較上月
                    <span className="ms-2">
                      <i className="bi bi-arrow-up-right"></i>
                      +8%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-gradient h-100" 
                   style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">未完成問題</h6>
                    <i className="bi bi-hourglass-split fs-4"></i>
                  </div>
                  <h2 className="display-4 fw-bold mb-0">{pendingIssues}</h2>
                  <div className="mt-3 small">
                    較上月
                    <span className="ms-2">
                      <i className="bi bi-arrow-down-right"></i>
                      -3%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 視圖切換按鈕 */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <ul className="nav nav-pills nav-fill">
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                      >
                        <i className="bi bi-grid-3x3-gap me-2"></i>
                        概覽
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                      >
                        <i className="bi bi-table me-2"></i>
                        詳細數據
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {activeTab === 'overview' ? (
              <>
                {/* 圓餅圖區域 */}
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                          問題狀態分布
                        </h5>
                        <button className="btn btn-sm btn-light" title="下載圖表">
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                      <div style={{ height: '300px' }} className="d-flex align-items-center">
                        {getStatusChartData() && (
                          <Pie data={getStatusChartData()} options={chartOptions} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
                          來源分布
                        </h5>
                        <button className="btn btn-sm btn-light" title="下載圖表">
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                      <div style={{ height: '300px' }} className="d-flex align-items-center">
                        {getSourceChartData() && (
                          <Pie data={getSourceChartData()} options={chartOptions} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-tags-fill me-2 text-primary"></i>
                          問題類型分布
                        </h5>
                        <button className="btn btn-sm btn-light" title="下載圖表">
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                      <div style={{ height: '300px' }} className="d-flex align-items-center">
                        {getTypeChartData() && (
                          <Pie data={getTypeChartData()} options={chartOptions} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 詳細統計信息 */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h5 className="mb-0">
                        <i className="bi bi-diagram-3 me-2 text-primary"></i>
                        來源統計
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="border-0">來源</th>
                              <th className="border-0 text-center">數量</th>
                              <th className="border-0 text-center">佔比</th>
                              <th className="border-0 text-center">趨勢</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(annualData.sourceDistribution || {}).map(([source, count]) => (
                              <tr key={source}>
                                <td className="border-0">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-circle-fill me-2" style={{ color: 'rgba(54, 162, 235, 0.85)', fontSize: '8px' }}></i>
                                    {source}
                                  </div>
                                </td>
                                <td className="border-0 text-center">{count}</td>
                                <td className="border-0 text-center">
                                  {totalIssues ? Math.round((count / totalIssues) * 100) : 0}%
                                </td>
                                <td className="border-0 text-center">
                                  <i className="bi bi-arrow-up-right text-success"></i>
                                </td>
                              </tr>
                            ))}
                            {Object.keys(annualData.sourceDistribution || {}).length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center border-0">暫無數據</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h5 className="mb-0">
                        <i className="bi bi-tags me-2 text-primary"></i>
                        問題類型統計
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="border-0">類型</th>
                              <th className="border-0 text-center">數量</th>
                              <th className="border-0 text-center">佔比</th>
                              <th className="border-0 text-center">趨勢</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(annualData.typeDistribution || {}).map(([type, count]) => (
                              <tr key={type}>
                                <td className="border-0">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-circle-fill me-2" style={{ color: 'rgba(75, 192, 192, 0.85)', fontSize: '8px' }}></i>
                                    {type || '未分類'}
                                  </div>
                                </td>
                                <td className="border-0 text-center">{count}</td>
                                <td className="border-0 text-center">
                                  {totalIssues ? Math.round((count / totalIssues) * 100) : 0}%
                                </td>
                                <td className="border-0 text-center">
                                  <i className="bi bi-arrow-up-right text-success"></i>
                                </td>
                              </tr>
                            ))}
                            {Object.keys(annualData.typeDistribution || {}).length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center border-0">暫無數據</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
