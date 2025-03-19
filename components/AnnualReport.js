import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// 注册 ChartJS 组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnnualReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // 模拟获取年度累积报表数据
  const fetchReportData = async (year) => {
    try {
      setLoading(true);
      // 实际应用中，这里应该调用后端API获取数据
      // const response = await axios.get(`/reports/annual/${year}`);
      
      // 模拟数据，实际使用时应替换为API调用
      const simulatedData = {
        year: year,
        totalIssues: 120,
        resolvedIssues: 95,
        pendingIssues: 15,
        inProgressIssues: 10,
        issuesByType: {
          '系統': 45,
          '系統功能': 30,
          '網路': 25,
          '設備': 20
        },
        issuesBySource: {
          '業務': 30,
          'Line chat': 40,
          '現場': 15,
          'Email': 10,
          '電話': 20,
          '客戶主動回報': 5
        },
        issuesByMonth: {
          '一月': 8,
          '二月': 10,
          '三月': 12,
          '四月': 15,
          '五月': 9,
          '六月': 7,
          '七月': 11,
          '八月': 13,
          '九月': 10,
          '十月': 9,
          '十一月': 8,
          '十二月': 8
        },
        responseTimes: {
          average: 24, // 小时
          min: 1,
          max: 72
        }
      };
      
      setReportData(simulatedData);
      setError(null);
    } catch (err) {
      console.error('获取年度报表数据失败:', err);
      setError('无法加载报表数据，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReportData(selectedYear);
  }, [selectedYear]);
  
  // 获取可选年份列表（当前年份和前5年）
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };
  
  // 配置问题类型图表数据
  const getIssueTypeChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: Object.keys(reportData.issuesByType),
      datasets: [
        {
          label: '问题数量',
          data: Object.values(reportData.issuesByType),
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // 配置问题来源图表数据
  const getIssueSourceChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: Object.keys(reportData.issuesBySource),
      datasets: [
        {
          label: '问题数量',
          data: Object.values(reportData.issuesBySource),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // 配置月度问题数量图表数据
  const getMonthlyIssuesChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: Object.keys(reportData.issuesByMonth),
      datasets: [
        {
          label: '问题数量',
          data: Object.values(reportData.issuesByMonth),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // 配置图表选项
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedYear}年问题统计`
      }
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-0">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary bg-gradient text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              年度累積報表
            </h5>
            <select 
              className="form-select form-select-sm w-auto"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          {reportData && (
            <>
              {/* 总体统计卡片 */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card shadow-sm border-primary h-100">
                    <div className="card-body text-center">
                      <h3 className="display-4 fw-bold text-primary">{reportData.totalIssues}</h3>
                      <p className="text-muted mb-0">總問題數量</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-success h-100">
                    <div className="card-body text-center">
                      <h3 className="display-4 fw-bold text-success">{reportData.resolvedIssues}</h3>
                      <p className="text-muted mb-0">已解決問題</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-warning h-100">
                    <div className="card-body text-center">
                      <h3 className="display-4 fw-bold text-warning">{reportData.pendingIssues}</h3>
                      <p className="text-muted mb-0">待處理問題</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-info h-100">
                    <div className="card-body text-center">
                      <h3 className="display-4 fw-bold text-info">{reportData.inProgressIssues}</h3>
                      <p className="text-muted mb-0">處理中問題</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 图表区域 */}
              <div className="row g-4">
                {/* 问题类型分布 */}
                <div className="col-md-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                        問題類型分佈
                      </h6>
                    </div>
                    <div className="card-body">
                      <Pie data={getIssueTypeChartData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* 问题来源分布 */}
                <div className="col-md-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                        問題來源分佈
                      </h6>
                    </div>
                    <div className="card-body">
                      <Pie data={getIssueSourceChartData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* 月度问题趋势 */}
                <div className="col-md-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
                        月度問題趨勢
                      </h6>
                    </div>
                    <div className="card-body">
                      <Bar data={getMonthlyIssuesChartData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 响应时间统计 */}
              <div className="card shadow-sm mt-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    平均響應時間
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <h2 className="display-5 fw-bold text-primary">{reportData.responseTimes.average}</h2>
                      <p className="text-muted">平均響應時間 (小時)</p>
                    </div>
                    <div className="col-md-4">
                      <h2 className="display-5 fw-bold text-success">{reportData.responseTimes.min}</h2>
                      <p className="text-muted">最短響應時間 (小時)</p>
                    </div>
                    <div className="col-md-4">
                      <h2 className="display-5 fw-bold text-danger">{reportData.responseTimes.max}</h2>
                      <p className="text-muted">最長響應時間 (小時)</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnualReport; 