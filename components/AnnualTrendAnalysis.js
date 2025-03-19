import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

// 注册 ChartJS 组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AnnualTrendAnalysis = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState(3); // 默认显示3年趋势
  
  // 模拟获取年度趋势数据
  const fetchTrendData = async (years) => {
    try {
      setLoading(true);
      // 实际应用中，这里应该调用后端API获取数据
      // const response = await axios.get(`/reports/trends/${years}`);
      
      // 模拟数据，实际使用时应替换为API调用
      const currentYear = new Date().getFullYear();
      const yearLabels = Array.from({length: years}, (_, i) => (currentYear - years + 1 + i).toString());
      
      const simulatedData = {
        years: yearLabels,
        totalIssuesByYear: {
          [yearLabels[0]]: 85,
          [yearLabels[1]]: 102,
          [yearLabels[2]]: 120
        },
        issuesByStatus: {
          'Pending': {
            [yearLabels[0]]: 10,
            [yearLabels[1]]: 12,
            [yearLabels[2]]: 15
          },
          'In Progress': {
            [yearLabels[0]]: 5,
            [yearLabels[1]]: 8,
            [yearLabels[2]]: 10
          },
          'Closed': {
            [yearLabels[0]]: 70,
            [yearLabels[1]]: 82,
            [yearLabels[2]]: 95
          }
        },
        averageResolutionTime: {
          [yearLabels[0]]: 36,
          [yearLabels[1]]: 30,
          [yearLabels[2]]: 24
        },
        topIssueTypes: {
          [yearLabels[0]]: [
            { type: '系統', count: 30 },
            { type: '系統功能', count: 25 },
            { type: '網路', count: 20 },
            { type: '設備', count: 10 }
          ],
          [yearLabels[1]]: [
            { type: '系統', count: 35 },
            { type: '系統功能', count: 27 },
            { type: '網路', count: 22 },
            { type: '設備', count: 18 }
          ],
          [yearLabels[2]]: [
            { type: '系統', count: 45 },
            { type: '系統功能', count: 30 },
            { type: '網路', count: 25 },
            { type: '設備', count: 20 }
          ]
        },
        growthRate: {
          overall: 18.5, // 百分比
          byType: {
            '系統': 22.5,
            '系統功能': 11.8,
            '網路': 15.2,
            '設備': 25.0
          }
        }
      };
      
      // 如果需要4或5年数据，动态添加
      if (years > 3) {
        for (let i = 3; i < years; i++) {
          const year = yearLabels[i];
          simulatedData.totalIssuesByYear[year] = 75 - (i-3) * 10;
          
          simulatedData.issuesByStatus.Pending[year] = 8 - (i-3) * 2;
          simulatedData.issuesByStatus['In Progress'][year] = 4 - (i-3);
          simulatedData.issuesByStatus.Closed[year] = 65 - (i-3) * 7;
          
          simulatedData.averageResolutionTime[year] = 40 + (i-3) * 5;
          
          simulatedData.topIssueTypes[year] = [
            { type: '系統', count: 25 - (i-3) * 5 },
            { type: '系統功能', count: 20 - (i-3) * 5 },
            { type: '網路', count: 18 - (i-3) * 4 },
            { type: '設備', count: 8 - (i-3) * 2 }
          ];
        }
      }
      
      setTrendData(simulatedData);
      setError(null);
    } catch (err) {
      console.error('获取年度趋势数据失败:', err);
      setError('无法加载趋势数据，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTrendData(yearRange);
  }, [yearRange]);
  
  // 配置总问题数趋势图表数据
  const getTotalIssuesTrendData = () => {
    if (!trendData) return null;
    
    return {
      labels: trendData.years,
      datasets: [
        {
          label: '总问题数',
          data: Object.values(trendData.totalIssuesByYear),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // 配置问题状态趋势图表数据
  const getStatusTrendData = () => {
    if (!trendData) return null;
    
    return {
      labels: trendData.years,
      datasets: [
        {
          label: '待处理',
          data: Object.values(trendData.issuesByStatus.Pending),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          tension: 0.4
        },
        {
          label: '处理中',
          data: Object.values(trendData.issuesByStatus['In Progress']),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        },
        {
          label: '已解决',
          data: Object.values(trendData.issuesByStatus.Closed),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }
      ]
    };
  };
  
  // 配置平均解决时间趋势图表数据
  const getResolutionTimeTrendData = () => {
    if (!trendData) return null;
    
    return {
      labels: trendData.years,
      datasets: [
        {
          label: '平均解决时间(小时)',
          data: Object.values(trendData.averageResolutionTime),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.4,
          fill: true
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
        text: '年度趋势分析'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  // 计算年度增长率
  const calculateGrowthRate = (currentYear, previousYear) => {
    if (!previousYear || previousYear === 0) return 0;
    return ((currentYear - previousYear) / previousYear * 100).toFixed(1);
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
        <div className="card-header bg-info bg-gradient text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              年度趨勢分析
            </h5>
            <div className="d-flex align-items-center">
              <label className="text-white me-2">顯示年數:</label>
              <select 
                className="form-select form-select-sm w-auto"
                value={yearRange}
                onChange={(e) => setYearRange(parseInt(e.target.value))}
              >
                <option value="3">近3年</option>
                <option value="4">近4年</option>
                <option value="5">近5年</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          {trendData && (
            <>
              {/* 年度增长指标卡片 */}
              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                  <div>
                    <h6 className="mb-1">趨勢總結</h6>
                    <p className="mb-0">
                      從 {trendData.years[0]} 到 {trendData.years[trendData.years.length - 1]} 年，問題總數增長了 <strong>{trendData.growthRate.overall}%</strong>。其中 <strong>設備</strong> 類型問題增長幅度最大，達到了 <strong>{trendData.growthRate.byType['設備']}%</strong>。
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 年度数据比较 */}
              <div className="table-responsive mb-4">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>指標</th>
                      {trendData.years.map(year => (
                        <th key={year} className="text-center">{year}年</th>
                      ))}
                      <th className="text-center bg-light">變化趨勢</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold">總問題數</td>
                      {trendData.years.map(year => (
                        <td key={year} className="text-center">{trendData.totalIssuesByYear[year]}</td>
                      ))}
                      <td className="text-center bg-light">
                        {calculateGrowthRate(
                          trendData.totalIssuesByYear[trendData.years[trendData.years.length - 1]],
                          trendData.totalIssuesByYear[trendData.years[0]]
                        )}% {' '}
                        <i className={`bi ${parseFloat(calculateGrowthRate(
                          trendData.totalIssuesByYear[trendData.years[trendData.years.length - 1]],
                          trendData.totalIssuesByYear[trendData.years[0]]
                        )) > 0 ? 'bi-arrow-up-right text-danger' : 'bi-arrow-down-right text-success'}`}></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">平均解決時間 (小時)</td>
                      {trendData.years.map(year => (
                        <td key={year} className="text-center">{trendData.averageResolutionTime[year]}</td>
                      ))}
                      <td className="text-center bg-light">
                        {calculateGrowthRate(
                          trendData.averageResolutionTime[trendData.years[trendData.years.length - 1]],
                          trendData.averageResolutionTime[trendData.years[0]]
                        )}% {' '}
                        <i className={`bi ${parseFloat(calculateGrowthRate(
                          trendData.averageResolutionTime[trendData.years[trendData.years.length - 1]],
                          trendData.averageResolutionTime[trendData.years[0]]
                        )) > 0 ? 'bi-arrow-up-right text-danger' : 'bi-arrow-down-right text-success'}`}></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">已解決問題</td>
                      {trendData.years.map(year => (
                        <td key={year} className="text-center">{trendData.issuesByStatus.Closed[year]}</td>
                      ))}
                      <td className="text-center bg-light">
                        {calculateGrowthRate(
                          trendData.issuesByStatus.Closed[trendData.years[trendData.years.length - 1]],
                          trendData.issuesByStatus.Closed[trendData.years[0]]
                        )}% {' '}
                        <i className={`bi ${parseFloat(calculateGrowthRate(
                          trendData.issuesByStatus.Closed[trendData.years[trendData.years.length - 1]],
                          trendData.issuesByStatus.Closed[trendData.years[0]]
                        )) > 0 ? 'bi-arrow-up-right text-success' : 'bi-arrow-down-right text-danger'}`}></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* 图表区域 */}
              <div className="row g-4">
                {/* 总问题数趋势 */}
                <div className="col-md-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-graph-up-arrow me-2 text-info"></i>
                        總問題數趨勢
                      </h6>
                    </div>
                    <div className="card-body">
                      <Line data={getTotalIssuesTrendData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* 平均解决时间趋势 */}
                <div className="col-md-6">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-clock-history me-2 text-info"></i>
                        平均解決時間趨勢
                      </h6>
                    </div>
                    <div className="card-body">
                      <Line data={getResolutionTimeTrendData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* 问题状态趋势 */}
                <div className="col-md-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-layers me-2 text-info"></i>
                        各狀態問題數量趨勢
                      </h6>
                    </div>
                    <div className="card-body">
                      <Line data={getStatusTrendData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 问题类型年度对比 */}
              <div className="card shadow-sm mt-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-bar-chart-line me-2 text-info"></i>
                    問題類型年度對比
                  </h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>類型</th>
                          {trendData.years.map(year => (
                            <th key={year} className="text-center">{year}年</th>
                          ))}
                          <th className="text-center">增長率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(trendData.growthRate.byType).map(type => (
                          <tr key={type}>
                            <td><span className="badge bg-secondary">{type}</span></td>
                            {trendData.years.map(year => {
                              const typeData = trendData.topIssueTypes[year].find(t => t.type === type);
                              return <td key={year} className="text-center">{typeData ? typeData.count : 0}</td>;
                            })}
                            <td className="text-center">
                              <span className={`badge ${parseFloat(trendData.growthRate.byType[type]) > 15 ? 'bg-danger' : 'bg-success'}`}>
                                {trendData.growthRate.byType[type]}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default AnnualTrendAnalysis; 