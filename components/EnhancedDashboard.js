import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import ReportExport from "./ReportExport";
Chart.register(...registerables);

/**
 * EnhancedDashboard：改進版儀表板，優化UI和圖表顯示
 */
export default function EnhancedDashboard() {
  // 狀態儲存
  const [issueCount, setIssueCount] = useState(0);
  const [issueTypes, setIssueTypes] = useState({});
  const [completed, setCompleted] = useState(0);
  const [uncompleted, setUncompleted] = useState(0);
  const [sourceStats, setSourceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryData, setSummaryData] = useState({
    latestUpdate: "",
    completionRate: 0,
    topSource: "",
    topIssueType: ""
  });

  // 預設選擇「當前年月」，格式 "2025-03"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });

  useEffect(() => {
    fetchReportData(selectedMonth);
  }, [selectedMonth]);

  // 從後端 API 取即時月度統計
  const fetchReportData = async (month) => {
    try {
      setLoading(true);
      setError("");
      // month 形如 "2025-03"
      const res = await axios.get(`/summaries/monthly?month=${month}`);
      const data = res.data || {};
      
      setIssueCount(data.issueCount || 0);
      setIssueTypes(data.issueTypes || {});
      setCompleted(data.completed || 0);
      setUncompleted(data.uncompleted || 0);
      setSourceStats(data.sourceStats || {});

      // 計算摘要數據
      calculateSummaryData(data);
    } catch (error) {
      console.error("❌ 取得報表數據失敗", error);
      setError("加載數據時發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  // 計算摘要數據
  const calculateSummaryData = (data) => {
    // 計算完成率
    const total = (data.completed || 0) + (data.uncompleted || 0);
    const completionRate = total > 0 ? Math.round((data.completed / total) * 100) : 0;

    // 找出最多的來源
    let topSource = "";
    let maxSourceCount = 0;
    Object.entries(data.sourceStats || {}).forEach(([source, count]) => {
      if (count > maxSourceCount) {
        maxSourceCount = count;
        topSource = source;
      }
    });

    // 找出最多的問題類型
    let topIssueType = "";
    let maxTypeCount = 0;
    Object.entries(data.issueTypes || {}).forEach(([type, count]) => {
      if (count > maxTypeCount) {
        maxTypeCount = count;
        topIssueType = type;
      }
    });

    setSummaryData({
      latestUpdate: new Date().toLocaleString(),
      completionRate,
      topSource,
      topIssueType
    });
  };

  // 主題顏色
  const chartColors = {
    primary: 'rgba(25, 118, 210, 0.8)',
    primaryLight: 'rgba(25, 118, 210, 0.4)',
    secondaryGreen: 'rgba(46, 204, 113, 0.8)',
    secondaryRed: 'rgba(231, 76, 60, 0.8)',
    tertiaryPurple: 'rgba(142, 68, 173, 0.8)',
    tertiaryOrange: 'rgba(230, 126, 34, 0.8)',
    backgroundLight: 'rgba(240, 240, 240, 0.6)'
  };

  // 類型圖表配置
  const issueTypeData = {
    labels: Object.keys(issueTypes),
    datasets: [
      {
        data: Object.values(issueTypes),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondaryGreen,
          chartColors.secondaryRed,
          chartColors.tertiaryPurple,
          chartColors.tertiaryOrange
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // 完成狀態圖表配置
  const completionData = {
    labels: ['已完成', '未完成'],
    datasets: [
      {
        data: [completed, uncompleted],
        backgroundColor: [chartColors.secondaryGreen, chartColors.secondaryRed],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // 來源分佈圖表配置
  const sourceData = {
    labels: Object.keys(sourceStats),
    datasets: [
      {
        data: Object.values(sourceStats),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondaryGreen,
          chartColors.tertiaryPurple,
          chartColors.tertiaryOrange,
          chartColors.secondaryRed
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // 圖表通用選項
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  if (loading) {
    return (
      <div className="container p-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">載入資料中...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">📊 數據分析儀表板</h2>
            
            <div className="d-flex align-items-center">
              <label className="me-2">選擇月份：</label>
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
          <p className="text-muted">最後更新：{summaryData.latestUpdate}</p>
        </div>
        <div className="col-md-4">
          <ReportExport />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* 摘要卡片 */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-primary mb-2">{issueCount}</div>
              <p className="text-muted mb-0">問題總數</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-success mb-2">{summaryData.completionRate}%</div>
              <p className="text-muted mb-0">處理完成率</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-info mb-2">
                {summaryData.topSource || "無"}
              </div>
              <p className="text-muted mb-0">主要來源</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-warning mb-2">
                {summaryData.topIssueType || "無"}
              </div>
              <p className="text-muted mb-0">主要問題類型</p>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表列 */}
      <div className="row g-4">
        {/* 問題類型統計圓餅圖 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">問題類型分佈</h5>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                {Object.keys(issueTypes).length > 0 ? (
                  <Doughnut data={issueTypeData} options={chartOptions} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    無問題類型數據
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 完成狀態 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">問題處理狀態</h5>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                {(completed > 0 || uncompleted > 0) ? (
                  <Pie data={completionData} options={chartOptions} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    無狀態數據
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 來源統計 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">問題來源分佈</h5>
            </div>
            <div className="card-body">
              <div style={{ height: "300px" }}>
                {Object.keys(sourceStats).length > 0 ? (
                  <Doughnut data={sourceData} options={chartOptions} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    無來源數據
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 補充信息 */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">處理狀態詳情</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted">已完成問題</h6>
                    <div className="progress" style={{ height: "25px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${summaryData.completionRate}%` }}
                        aria-valuenow={summaryData.completionRate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {completed} 個問題 ({summaryData.completionRate}%)
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="text-muted">未完成問題</h6>
                    <div className="progress" style={{ height: "25px" }}>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: `${100 - summaryData.completionRate}%` }}
                        aria-valuenow={100 - summaryData.completionRate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {uncompleted} 個問題 ({100 - summaryData.completionRate}%)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>問題類型</th>
                          <th>數量</th>
                          <th>佔比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(issueTypes).length > 0 ? (
                          Object.entries(issueTypes).map(([type, count]) => (
                            <tr key={type}>
                              <td>{type}</td>
                              <td>{count}</td>
                              <td>
                                {issueCount > 0
                                  ? `${Math.round((count / issueCount) * 100)}%`
                                  : "0%"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted">
                              無問題類型數據
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 