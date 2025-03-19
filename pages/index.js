// pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '../utils/api';
import DashboardLayout from "../components/DashboardLayout";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    closedIssues: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 獲取問題統計數據
        const [statsRes, issuesRes] = await Promise.all([
          axios.get('/issues/stats'),
          axios.get('/issues?limit=5&sort=created_at:desc')
        ]);
        
        setStats(statsRes.data || {
          totalIssues: 0,
          pendingIssues: 0,
          inProgressIssues: 0,
          closedIssues: 0
        });
        
        setRecentIssues(issuesRes.data || []);
      } catch (error) {
        console.error('獲取儀表板數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 獲取狀態對應的顏色和圖標
  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { color: 'warning', icon: 'bi-hourglass-split' },
      'In Progress': { color: 'primary', icon: 'bi-arrow-repeat' },
      'Closed': { color: 'success', icon: 'bi-check-circle' }
    };
    const { color, icon } = statusMap[status] || { color: 'secondary', icon: 'bi-question-circle' };
    
    return (
      <span className={`badge bg-${color} text-white d-inline-flex align-items-center`}>
        <i className={`bi ${icon} me-1`}></i> {status}
      </span>
    );
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout
      title={{
        icon: "bi bi-speedometer2",
        text: "問題管理儀表板",
        subtitle: "系統概覽與最新統計"
      }}
    >
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 統計卡片區域 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <i className="bi bi-database fs-4 text-primary"></i>
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">總問題數</h6>
                      <h2 className="mt-2 mb-0">{stats.totalIssues}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                      <i className="bi bi-hourglass-split fs-4 text-warning"></i>
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">待處理</h6>
                      <h2 className="mt-2 mb-0">{stats.pendingIssues}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <i className="bi bi-arrow-repeat fs-4 text-info"></i>
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">進行中</h6>
                      <h2 className="mt-2 mb-0">{stats.inProgressIssues}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <i className="bi bi-check-circle fs-4 text-success"></i>
                    </div>
                    <div>
                      <h6 className="card-title text-muted mb-0">已完成</h6>
                      <h2 className="mt-2 mb-0">{stats.closedIssues}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作與報表區域 */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-lightning-charge me-2 text-warning"></i>
                    快速操作
                  </h5>
                  <div className="d-grid gap-2">
                    <Link href="/issues" legacyBehavior>
                      <a className="btn btn-outline-primary">
                        <i className="bi bi-columns-gap me-1"></i>
                        查看問題看板
                      </a>
                    </Link>
                    <Link href="/annual" legacyBehavior>
                      <a className="btn btn-outline-success">
                        <i className="bi bi-calendar-check me-1"></i>
                        年度報表查詢
                      </a>
                    </Link>
                    <Link href="/annualTrend" legacyBehavior>
                      <a className="btn btn-outline-info">
                        <i className="bi bi-graph-up me-1"></i>
                        趨勢分析查詢
                      </a>
                    </Link>
                    <button className="btn btn-outline-dark">
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      匯出報表數據
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title d-flex justify-content-between mb-3">
                    <span>
                      <i className="bi bi-clock-history me-2 text-primary"></i>
                      最近問題
                    </span>
                    <Link href="/issues" legacyBehavior>
                      <a className="btn btn-sm btn-outline-primary">
                        查看全部
                      </a>
                    </Link>
                  </h5>
                  
                  {recentIssues.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      暫無最近問題記錄
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {recentIssues.map(issue => (
                        <li key={issue.id} className="list-group-item border-0 px-0 py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="d-flex align-items-center">
                                <span className="fw-medium">{issue.title}</span>
                                <span className="ms-2 badge bg-secondary bg-opacity-10 text-secondary">
                                  {issue.issue_type}
                                </span>
                              </div>
                              <small className="text-muted d-block">
                                <i className="bi bi-calendar3 me-1"></i>
                                {formatDate(issue.created_at)}
                              </small>
                            </div>
                            <div>
                              {getStatusBadge(issue.status)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 系統資訊 */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                系統資訊
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted">版本資訊</h6>
                    <p className="mb-1">問題管理系統 v1.0.0</p>
                    <p className="mb-1">最後更新：2023-05-15</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted">系統狀態</h6>
                    <p className="mb-1">
                      <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: '0.5rem' }}></i>
                      資料庫連線正常
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: '0.5rem' }}></i>
                      API 服務運行中
                    </p>
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
