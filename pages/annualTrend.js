// frontend/pages/annualTrend.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Line, Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AnnualTrendPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [monthsData, setMonthsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [years, setYears] = useState([]);
  const [activeChartType, setActiveChartType] = useState("line"); // line, bar

  // 取得可用年份列表
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const availableYears = [];
    for (let y = currentYear - 4; y <= currentYear; y++) {
      availableYears.push(y);
    }
    setYears(availableYears);
  }, []);

  useEffect(() => {
    fetchAnnualTrend(year);
  }, [year]);

  const fetchAnnualTrend = async (y) => {
    try {
      setLoading(true);
      setError("");
      // 依你實際路徑：例如 /summaries/immediateAnnualTrend?year=XXXX
      const res = await axios.get(`/summaries/immediateAnnualTrend?year=${y}`);
      setMonthsData(res.data.months || []);
    } catch (error) {
      console.error("無法取得年度趨勢:", error);
      setError("無法加載年度趨勢資料，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 圖表顏色配置
  const chartColors = {
    primary: 'rgba(54, 162, 235, 1)',
    primaryLight: 'rgba(54, 162, 235, 0.2)',
    success: 'rgba(75, 192, 192, 1)',
    successLight: 'rgba(75, 192, 192, 0.2)',
    warning: 'rgba(255, 206, 86, 1)',
    warningLight: 'rgba(255, 206, 86, 0.2)',
    danger: 'rgba(255, 99, 132, 1)',
    dangerLight: 'rgba(255, 99, 132, 0.2)',
  };

  // 折線圖數據
  const lineData = {
    labels: monthsData.map(m => `${m.month}月`),
    datasets: [
      {
        label: "Issue 數量",
        data: monthsData.map(m => m.issueCount),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: chartColors.primary
      },
      {
        label: "已關閉 Issues",
        data: monthsData.map(m => m.closedCount || 0),
        borderColor: chartColors.success,
        backgroundColor: chartColors.successLight,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: chartColors.success
      }
    ]
  };

  // 柱狀圖數據
  const barData = {
    labels: monthsData.map(m => `${m.month}月`),
    datasets: [
      {
        label: "總數量",
        data: monthsData.map(m => m.issueCount),
        backgroundColor: chartColors.primaryLight,
        borderColor: chartColors.primary,
        borderWidth: 1
      },
      {
        label: "已關閉",
        data: monthsData.map(m => m.closedCount || 0),
        backgroundColor: chartColors.successLight,
        borderColor: chartColors.success,
        borderWidth: 1
      },
      {
        label: "未完成",
        data: monthsData.map(m => (m.issueCount || 0) - (m.closedCount || 0)),
        backgroundColor: chartColors.dangerLight,
        borderColor: chartColors.danger,
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 15,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(200, 200, 200, 0.15)'
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        grid: {
          drawBorder: false,
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // 計算總數和完成率
  const totalIssues = monthsData.reduce((sum, month) => sum + (month.issueCount || 0), 0);
  const totalClosed = monthsData.reduce((sum, month) => sum + (month.closedCount || 0), 0);
  const completionRate = totalIssues > 0 ? Math.round((totalClosed / totalIssues) * 100) : 0;

  // 找出哪個月問題最多
  const maxIssueMonth = monthsData.length > 0 
    ? monthsData.reduce((max, month) => 
        month.issueCount > (max.issueCount || 0) ? month : max, 
        { month: 0, issueCount: 0 }
      )
    : { month: 0, issueCount: 0 };

  // 找出每個月的關閉率
  const monthlyCompletionRates = monthsData.map(month => {
    const total = month.issueCount || 0;
    const closed = month.closedCount || 0;
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0;
    return {
      month: month.month,
      rate
    };
  });

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="mb-0">📊 {year} 年度趨勢分析</h2>
          <p className="text-muted mt-2">查看問題數量和解決趨勢</p>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="d-flex justify-content-md-end align-items-center">
            <label className="me-2">選擇年份：</label>
            <select
              className="form-select form-select-sm me-3"
              style={{ width: "100px" }}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            
            <div className="btn-group" role="group" aria-label="圖表類型">
              <button 
                type="button" 
                className={`btn btn-sm ${activeChartType === "line" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActiveChartType("line")}
              >
                折線圖
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${activeChartType === "bar" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActiveChartType("bar")}
              >
                柱狀圖
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">加載數據中...</p>
        </div>
      ) : (
        <>
          {/* 摘要卡片 */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-primary mb-2">{totalIssues}</div>
                  <p className="text-muted mb-0">年度問題總數</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-success mb-2">{completionRate}%</div>
                  <p className="text-muted mb-0">年度完成率</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-info mb-2">{maxIssueMonth.month || "-"}</div>
                  <p className="text-muted mb-0">問題最多月份</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-warning mb-2">{maxIssueMonth.issueCount || 0}</div>
                  <p className="text-muted mb-0">月最高問題數</p>
                </div>
              </div>
            </div>
          </div>

          {/* 趨勢圖區域 */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h5 className="card-title mb-0">年度問題趨勢</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "400px" }}>
                    {monthsData.length > 0 ? (
                      activeChartType === "line" ? (
                        <Line data={lineData} options={chartOptions} />
                      ) : (
                        <Bar data={barData} options={chartOptions} />
                      )
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        沒有趨勢數據可顯示
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細月度數據 */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">月度詳細數據</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
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
                    {monthsData.length > 0 ? (
                      monthsData.map((month) => {
                        const closed = month.closedCount || 0;
                        const total = month.issueCount || 0;
                        const pending = total - closed;
                        const rate = total > 0 ? Math.round((closed / total) * 100) : 0;
                        
                        return (
                          <tr key={month.month}>
                            <td>{month.month}月</td>
                            <td>{total}</td>
                            <td>{closed}</td>
                            <td>{pending}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1 me-2" style={{ height: "8px" }}>
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: `${rate}%` }}
                                    aria-valuenow={rate}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <span className="text-muted small">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          無數據
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
