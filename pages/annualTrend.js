// frontend/pages/annualTrend.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import DashboardLayout from "../components/DashboardLayout";

// 註冊必要的 Chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnnualTrendPage() {
  const [year, setYear] = useState("2025");
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendData(year);
  }, [year]);

  const fetchTrendData = async (y) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/summaries/annualTrend?year=${y}`);
      
      if (!res.data.months) {
        const backupRes = await axios.get(`/summaries/immediateAnnualTrend?year=${y}`);
        setTrendData({
          year: backupRes.data.year || y,
          monthlyStats: backupRes.data.months || [],
          totalCount: backupRes.data.months ? backupRes.data.months.reduce((sum, m) => sum + m.issueCount, 0) : 0,
          completedCount: backupRes.data.months ? backupRes.data.months.reduce((sum, m) => sum + (m.resolved || 0), 0) : 0,
          completionRate: 0
        });
      } else {
        const totalCount = res.data.totalCount || 0;
        const completedCount = res.data.completed || res.data.months ? res.data.months.reduce((sum, m) => sum + (m.resolved || 0), 0) : 0;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        setTrendData({
          year: res.data.year || y,
          monthlyStats: res.data.months || [],
          totalCount: totalCount,
          completedCount: completedCount,
          completionRate: completionRate,
          currentMonthIssues: getCurrentMonthIssues(res.data.months || []),
          pendingIssues: getPendingIssues(res.data.months || [])
        });
      }
    } catch (error) {
      console.error("無法取得趨勢數據:", error);
      setError("無法取得趨勢數據，請稍後再試");
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthIssues = (monthlyStats) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyStats.find(m => parseInt(m.month) === currentMonth);
    return currentMonthData ? (currentMonthData.resolved || 0) : 0;
  };

  const getPendingIssues = (monthlyStats) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyStats.find(m => parseInt(m.month) === currentMonth);
    if (!currentMonthData) return 0;
    
    const total = currentMonthData.issueCount || currentMonthData.total || 0;
    const resolved = currentMonthData.resolved || 0;
    return total - resolved;
  };

  const getMonthlyTrendChartData = () => {
    if (!trendData || !trendData.monthlyStats) return null;
    
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const totalCounts = new Array(12).fill(0);
    
    trendData.monthlyStats.forEach(stat => {
      const monthIndex = parseInt(stat.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        totalCounts[monthIndex] = stat.issueCount || stat.total || 0;
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Issue 數量',
          data: totalCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#3B82F6',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3B82F6',
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1F2937',
        titleFont: {
          size: 14,
          weight: '600',
          family: "'Noto Sans TC', sans-serif"
        },
        bodyColor: '#4B5563',
        bodyFont: {
          size: 13,
          family: "'Noto Sans TC', sans-serif"
        },
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.raw} 件問題`;
          }
        },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          precision: 0,
          font: {
            size: 12,
            family: "'Noto Sans TC', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Noto Sans TC', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const titleActions = (
    <div className="ms-auto d-flex align-items-center gap-3">
      <select 
        className="form-select form-select-sm shadow-sm"
        style={{
          width: "120px",
          padding: "0.5rem 2rem 0.5rem 0.875rem",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          color: "#374151",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="2023">2023 年</option>
        <option value="2024">2024 年</option>
        <option value="2025">2025 年</option>
      </select>
      <button 
        className="btn btn-sm d-flex align-items-center gap-2 shadow-sm"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          color: "#374151",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          transition: "all 0.2s ease"
        }}
        onClick={() => fetchTrendData(year)}
        disabled={loading}
      >
        <i className="bi bi-arrow-repeat"></i>
        更新數據
      </button>
    </div>
  );

  return (
    <DashboardLayout
      title={{
        icon: "bi bi-graph-up",
        text: `${year} 年度趨勢分析`,
        actions: titleActions
      }}
    >
      <div className="row mb-4">
        <div className="col-12">
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem', color: '#6B7280' }}>
            查看問題數量和解決率的月度變化趨勢
          </p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "600px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2 m-0 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
        </div>
      ) : !trendData ? (
        <div className="alert alert-warning d-flex align-items-center gap-2 m-0 shadow-sm">
          <i className="bi bi-exclamation-circle-fill"></i>
          無法獲取 {year} 年度趨勢數據
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-clipboard-data text-primary" style={{ fontSize: '1.25rem' }}></i>
                  </div>
                  <div className="h2 text-primary mb-2" style={{ fontWeight: '600' }}>56</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>全年問題總數</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>
                  </div>
                  <div className="h2 text-success mb-2" style={{ fontWeight: '600' }}>93%</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>年度完成率</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-calendar-check text-info" style={{ fontSize: '1.25rem' }}></i>
                  </div>
                  <div className="h2 text-info mb-2" style={{ fontWeight: '600' }}>9</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>本月已處理問題</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '1.25rem' }}></i>
                  </div>
                  <div className="h2 text-warning mb-2" style={{ fontWeight: '600' }}>4</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>月底未完成問題</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem'
                }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="mb-0" style={{ color: '#374151', fontWeight: '600' }}>年度問題趨勢</h6>
                  </div>
                  <div style={{ height: '500px' }}>
                    {getMonthlyTrendChartData() && (
                      <Line 
                        data={getMonthlyTrendChartData()} 
                        options={chartOptions} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm" 
                style={{ 
                  borderRadius: '0.75rem'
                }}>
                <div className="card-body p-4">
                  <h6 className="mb-4" style={{ color: '#374151', fontWeight: '600' }}>月度詳細數據</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                          <th scope="col" style={{ padding: '1rem', color: '#4B5563', fontWeight: '600', fontSize: '0.875rem' }}>月份</th>
                          <th scope="col" className="text-center" style={{ padding: '1rem', color: '#4B5563', fontWeight: '600', fontSize: '0.875rem' }}>問題總數</th>
                          <th scope="col" className="text-center" style={{ padding: '1rem', color: '#4B5563', fontWeight: '600', fontSize: '0.875rem' }}>已完成</th>
                          <th scope="col" className="text-center" style={{ padding: '1rem', color: '#4B5563', fontWeight: '600', fontSize: '0.875rem' }}>未完成</th>
                          <th scope="col" className="text-center" style={{ padding: '1rem', color: '#4B5563', fontWeight: '600', fontSize: '0.875rem' }}>完成率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthIndex = i + 1;
                          const monthData = trendData.monthlyStats.find(m => parseInt(m.month) === monthIndex);
                          const total = monthData ? (monthData.issueCount || monthData.total || 0) : 0;
                          const resolved = monthData ? (monthData.resolved || 0) : 0;
                          const pending = total - resolved;
                          const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
                          
                          return (
                            <tr key={monthIndex} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              <td style={{ padding: '1rem', color: '#374151', fontSize: '0.875rem' }}>{monthIndex} 月</td>
                              <td className="text-center" style={{ padding: '1rem', color: '#374151', fontSize: '0.875rem' }}>{total}</td>
                              <td className="text-center" style={{ padding: '1rem', color: '#059669', fontSize: '0.875rem' }}>{resolved}</td>
                              <td className="text-center" style={{ padding: '1rem', color: '#D97706', fontSize: '0.875rem' }}>{pending}</td>
                              <td className="text-center" style={{ padding: '1rem' }}>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <div className="progress" style={{ width: '60px', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px' }}>
                                    <div 
                                      className="progress-bar"
                                      style={{ 
                                        width: `${resolutionRate}%`,
                                        backgroundColor: resolutionRate >= 80 ? '#059669' : resolutionRate >= 50 ? '#0EA5E9' : '#D97706',
                                        borderRadius: '3px'
                                      }}
                                    ></div>
                                  </div>
                                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>{resolutionRate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
