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
      // 使用正確的API路徑
      console.log(`正在請求趨勢數據: /summaries/annualTrend?year=${y}`);
      const res = await axios.get(`/summaries/annualTrend?year=${y}`);
      console.log('API響應:', res.data);
      
      // 如果API沒有返回monthlyStats，嘗試使用後備API
      if (!res.data.months) {
        console.log('API未返回月度數據，嘗試使用後備API...');
        const backupRes = await axios.get(`/summaries/immediateAnnualTrend?year=${y}`);
        console.log('後備API響應:', backupRes.data);
        setTrendData({
          year: backupRes.data.year || y,
          monthlyStats: backupRes.data.months || [],
          totalCount: backupRes.data.months ? backupRes.data.months.reduce((sum, m) => sum + m.issueCount, 0) : 0,
          pendingCount: 0,
          resolutionRate: 0
        });
      } else {
        setTrendData({
          year: res.data.year || y,
          monthlyStats: res.data.months || [],
          totalCount: res.data.totalCount || 0,
          pendingCount: res.data.pendingCount || 0,
          resolutionRate: res.data.resolutionRate || 0
        });
      }
    } catch (error) {
      console.error("無法取得趨勢數據:", error);
      if (error.response) {
        console.error("錯誤響應:", error.response.data);
        console.error("錯誤狀態:", error.response.status);
      }
      setError("無法取得趨勢數據，請稍後再試");
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  // 處理月份數據以準備圖表
  const getMonthlyTrendChartData = () => {
    if (!trendData || !trendData.monthlyStats) return null;
    
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const totalCounts = new Array(12).fill(0);
    
    // 填充實際數據
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
          fill: true,
          backgroundColor: 'rgba(75, 192, 255, 0.2)',
          borderColor: 'rgba(75, 192, 255, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(75, 192, 255, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };
  };

  // 圖表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 2
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // 計算統計數據
  const totalAnnualIssues = trendData?.totalCount || 0;
  const completionRate = trendData?.resolutionRate || 0;
  
  // 設置本月解決數據
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const resolvedLastMonth = trendData?.monthlyStats 
    ? (trendData.monthlyStats.find(m => {
        const month = parseInt(m.month);
        return month === currentMonth;
      })?.resolved || 0)
    : 0;
    
  const pendingIssues = trendData?.pendingCount || 0;

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
        onClick={() => fetchTrendData(year)}
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
        icon: "bi bi-graph-up",
        text: `${year} 年度趨勢分析`,
        actions: titleActions
      }}
    >
      <p className="text-muted mb-4">查看問題量和解決率的月度變化趨勢</p>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      ) : !trendData ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          無法獲取 {year} 年度趨勢數據
        </div>
      ) : !trendData.monthlyStats || trendData.monthlyStats.length === 0 ? (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-circle me-2"></i>
          {year} 年度尚無趨勢數據
        </div>
      ) : (
        <>
          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-primary">{totalAnnualIssues}</h2>
                  <p className="text-muted small">全年問題總數</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-success">{completionRate}%</h2>
                  <p className="text-muted small">年度完成率</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-info">{resolvedLastMonth}</h2>
                  <p className="text-muted small">本月已處理問題</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-warning">{pendingIssues}</h2>
                  <p className="text-muted small">月底未完成問題</p>
                </div>
              </div>
            </div>
          </div>

          {/* 趨勢圖 */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">年度問題趨勢</h5>
              <div style={{ height: '300px' }}>
                {getMonthlyTrendChartData() && (
                  <Line 
                    data={getMonthlyTrendChartData()} 
                    options={chartOptions} 
                  />
                )}
              </div>
              <div className="d-flex justify-content-center mt-2">
                <div className="d-flex align-items-center me-4">
                  <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(75, 192, 255, 1)', marginRight: '5px' }}></div>
                  <span className="small">Issue 數量</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(75, 192, 255, 1)', backgroundColor: 'white', marginRight: '5px' }}></div>
                  <span className="small">已處理 Issues</span>
                </div>
              </div>
            </div>
          </div>

          {/* 月度詳細數據表格 */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">月度詳細數據</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>月份</th>
                      <th>問題總數</th>
                      <th>已完成</th>
                      <th>未完成</th>
                      <th>完成率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthIndex = i + 1;
                      const monthData = trendData.monthlyStats.find(m => parseInt(m.month) === monthIndex);
                      const total = monthData ? (monthData.issueCount || monthData.total || 0) : 0;
                      const resolved = monthData?.resolved || 0;
                      const pending = total - resolved;
                      const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
                      
                      return (
                        <tr key={monthIndex}>
                          <td>{monthIndex}月</td>
                          <td>{total}</td>
                          <td>{resolved}</td>
                          <td>{pending}</td>
                          <td>{resolutionRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 解決時間與問題量趨勢 */}
          {trendData.avgResolutionTime && (
            <div className="row">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">解決時間趨勢</h5>
                    <div className="d-flex align-items-center">
                      <div className="display-6 me-3">{trendData.avgResolutionTime} 天</div>
                      <div>
                        <p className="mb-0">平均解決時間</p>
                        {trendData.timeTrend > 0 ? (
                          <p className="text-danger mb-0">
                            <i className="bi bi-arrow-up"></i> 較去年增加 {trendData.timeTrend} 天
                          </p>
                        ) : (
                          <p className="text-success mb-0">
                            <i className="bi bi-arrow-down"></i> 較去年減少 {Math.abs(trendData.timeTrend)} 天
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">問題量趨勢</h5>
                    <div className="d-flex align-items-center">
                      <div className="display-6 me-3">{totalAnnualIssues}</div>
                      <div>
                        <p className="mb-0">年度問題總數</p>
                        {trendData.volumeTrend > 0 ? (
                          <p className="text-danger mb-0">
                            <i className="bi bi-arrow-up"></i> 較去年增加 {trendData.volumeTrend} 個問題
                          </p>
                        ) : (
                          <p className="text-success mb-0">
                            <i className="bi bi-arrow-down"></i> 較去年減少 {Math.abs(trendData.volumeTrend)} 個問題
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
