// frontend/pages/annual.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AnnualSummaryPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [annualData, setAnnualData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [years, setYears] = useState([]);

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
    fetchAnnualData(year);
  }, [year]);

  const fetchAnnualData = async (y) => {
    try {
      setLoading(true);
      setError("");
      // 呼叫 /api/summaries/annual?year=2025
      const res = await axios.get(`/summaries/annual?year=${y}`);
      setAnnualData(res.data);
    } catch (error) {
      console.error("無法取得年度數據:", error);
      setError("無法加載年度數據，請稍後再試");
      setAnnualData(null);
    } finally {
      setLoading(false);
    }
  };

  // 圖表設定
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
        displayColors: true
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // 來源分佈圖表數據
  const sourceChartData = {
    labels: annualData ? Object.keys(annualData.sourceStats || {}) : [],
    datasets: [
      {
        data: annualData ? Object.values(annualData.sourceStats || {}) : [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // 問題類型分佈圖表數據
  const typeChartData = {
    labels: annualData ? Object.keys(annualData.typeStats || {}) : [],
    datasets: [
      {
        data: annualData ? Object.values(annualData.typeStats || {}) : [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // 完成狀態圖表數據
  const statusChartData = {
    labels: ['已完成', '未完成'],
    datasets: [
      {
        data: annualData ? [annualData.completed, annualData.uncompleted] : [0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // 計算完成率
  const completionRate = annualData ? 
    (annualData.totalIssues > 0 ? 
      Math.round((annualData.completed / annualData.totalIssues) * 100) : 0) : 0;

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h2 className="mb-0">📅 {year} 年度累計報表</h2>
          <p className="text-muted mt-2">查看全年問題統計和趨勢分析</p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="d-flex justify-content-md-end">
            <label className="me-2 align-self-center">選擇年份：</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "100px" }}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
      ) : annualData ? (
        <>
          {/* 摘要卡片 */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-primary mb-2">{annualData.totalIssues}</div>
                  <p className="text-muted mb-0">問題總數</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-success mb-2">{completionRate}%</div>
                  <p className="text-muted mb-0">完成率</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-info mb-2">{annualData.completed}</div>
                  <p className="text-muted mb-0">已完成問題</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-4 text-warning mb-2">{annualData.uncompleted}</div>
                  <p className="text-muted mb-0">未完成問題</p>
                </div>
              </div>
            </div>
          </div>

          {/* 圖表區域 */}
          <div className="row g-4">
            {/* 完成狀態圖表 */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="card-title mb-0">問題狀態分佈</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "300px" }}>
                    <Pie data={statusChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* 來源分佈圖表 */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="card-title mb-0">來源分佈</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "300px" }}>
                    {Object.keys(annualData.sourceStats || {}).length > 0 ? (
                      <Pie data={sourceChartData} options={chartOptions} />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        無來源數據
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 問題類型圖表 */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="card-title mb-0">問題類型分佈</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "300px" }}>
                    {Object.keys(annualData.typeStats || {}).length > 0 ? (
                      <Pie data={typeChartData} options={chartOptions} />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        無類型數據
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細信息表格 */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h5 className="card-title mb-0">詳細統計信息</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-3">來源統計</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>來源</th>
                              <th>數量</th>
                              <th>佔比</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(annualData.sourceStats || {}).length > 0 ? (
                              Object.entries(annualData.sourceStats || {}).map(([source, count]) => (
                                <tr key={source}>
                                  <td>{source}</td>
                                  <td>{count}</td>
                                  <td>
                                    {annualData.totalIssues > 0 ? 
                                      `${Math.round((count / annualData.totalIssues) * 100)}%` : 
                                      '0%'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="text-center">無來源數據</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">問題類型統計</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>類型</th>
                              <th>數量</th>
                              <th>佔比</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(annualData.typeStats || {}).length > 0 ? (
                              Object.entries(annualData.typeStats || {}).map(([type, count]) => (
                                <tr key={type}>
                                  <td>{type || '未分類'}</td>
                                  <td>{count}</td>
                                  <td>
                                    {annualData.totalIssues > 0 ? 
                                      `${Math.round((count / annualData.totalIssues) * 100)}%` : 
                                      '0%'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="text-center">無類型數據</td>
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
        </>
      ) : (
        <div className="alert alert-info">尚無年度資料</div>
      )}
    </div>
  );
}
