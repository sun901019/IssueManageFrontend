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

  useEffect(() => {
    fetchAnnualData(year);
  }, [year]);

  const fetchAnnualData = async (y) => {
    try {
      setLoading(true);
      setError(null);
      
      // 呼叫 /api/summaries/annual?year=2025
      console.log(`正在請求年度數據: /summaries/annual?year=${y}`);
      const res = await axios.get(`/summaries/annual?year=${y}`);
      console.log('API響應:', res.data);
      
      // 将收到的后端数据映射到前端所需的格式
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
      if (error.response) {
        console.error("錯誤響應:", error.response.data);
        console.error("錯誤狀態:", error.response.status);
      }
      setError("無法取得年度數據，請稍後再試");
      setAnnualData(null);
    } finally {
      setLoading(false);
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
          backgroundColor: ['#5CD9CF', '#FF8C9E'],
          borderColor: ['#FFFFFF', '#FFFFFF'],
          borderWidth: 1,
        },
      ],
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
          backgroundColor: ['#64B5F6', '#FF8C9E', '#FFD54F', '#81C784', '#BA68C8', '#FFB74D'],
          borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          borderWidth: 1,
        },
      ],
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
          backgroundColor: ['#5CD9CF', '#B39DDB', '#FFD54F', '#81C784', '#BA68C8', '#FFB74D'],
          borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
          borderWidth: 1,
        },
      ],
    };
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
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10
      }
    }
  };

  // 計算統計數據
  const totalIssues = annualData?.totalCount || 0;
  const closedIssues = annualData?.closedCount || 0;
  const pendingIssues = annualData?.pendingCount || 0;
  const resolutionRate = totalIssues ? Math.round((closedIssues / totalIssues) * 100) : 0;

  // 準備頁面標題和年份選擇器
  const titleActions = (
    <div className="ms-auto">
      <label className="me-2">選擇年份：</label>
      <select 
        className="form-select form-select-sm d-inline-block"
        style={{ width: "100px" }}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
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
      <p className="text-muted mb-3">查看全年問題統計和數據分析</p>

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
      ) : !annualData ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          無法獲取 {year} 年度數據
        </div>
      ) : Object.values(annualData).every(v => 
           v === 0 || 
           (typeof v === 'object' && Object.keys(v).length === 0)
         ) ? (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-circle me-2"></i>
          {year} 年度尚無問題數據
        </div>
      ) : (
        <>
          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-primary">{totalIssues}</h2>
                  <p className="text-muted mb-0">問題總數</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-success">{resolutionRate}%</h2>
                  <p className="text-muted mb-0">完成率</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-info">{closedIssues}</h2>
                  <p className="text-muted mb-0">已完成問題</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h2 className="display-4 text-warning">{pendingIssues}</h2>
                  <p className="text-muted mb-0">未完成問題</p>
                </div>
              </div>
            </div>
          </div>

          {/* 圓餅圖區域 */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">問題狀態分布</h5>
                  <div style={{ height: '250px' }}>
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
                  <h5 className="card-title mb-3">來源分布</h5>
                  <div style={{ height: '250px' }}>
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
                  <h5 className="card-title mb-3">問題類型分布</h5>
                  <div style={{ height: '250px' }}>
                    {getTypeChartData() && (
                      <Pie data={getTypeChartData()} options={chartOptions} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細統計信息 */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-4">詳細統計信息</h5>
              
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h6 className="mb-3">來源統計</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>來源</th>
                          <th>數量</th>
                          <th>佔比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(annualData.sourceDistribution || {}).map(([source, count]) => (
                          <tr key={source}>
                            <td>{source}</td>
                            <td>{count}</td>
                            <td>{totalIssues ? Math.round((count / totalIssues) * 100) : 0}%</td>
                          </tr>
                        ))}
                        {Object.keys(annualData.sourceDistribution || {}).length === 0 && (
                          <tr>
                            <td colSpan="3" className="text-center">暫無數據</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="col-md-6 mb-4">
                  <h6 className="mb-3">問題類型統計</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>類型</th>
                          <th>數量</th>
                          <th>佔比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(annualData.typeDistribution || {}).map(([type, count]) => (
                          <tr key={type}>
                            <td>{type || '未分類'}</td>
                            <td>{count}</td>
                            <td>{totalIssues ? Math.round((count / totalIssues) * 100) : 0}%</td>
                          </tr>
                        ))}
                        {Object.keys(annualData.typeDistribution || {}).length === 0 && (
                          <tr>
                            <td colSpan="3" className="text-center">暫無數據</td>
                          </tr>
                        )}
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
