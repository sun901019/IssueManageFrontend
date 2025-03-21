import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function DashboardLayout({ children, title }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 檢查當前路徑是否為指定頁面
  const isActive = (path) => {
    return router.pathname === path;
  };

  // 處理搜尋功能
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push({
        pathname: '/issues',
        query: { search: searchQuery }
      });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 頂部導航欄 */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
        <div className="container-fluid">
          <Link href="/" legacyBehavior>
            <a className="navbar-brand d-flex align-items-center">
              <i className="bi bi-kanban fs-4 me-2"></i>
              <span>問題管理系統</span>
            </a>
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/issues" legacyBehavior>
                  <a className={`nav-link ${isActive('/issues') ? 'active' : ''}`}>
                    <i className="bi bi-kanban me-1"></i> Issue 看板
                  </a>
                </Link>
              </li>
              
              <li className="nav-item dropdown">
                <a className={`nav-link dropdown-toggle ${isActive('/annual') || isActive('/annualTrend') ? 'active' : ''}`} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-pie-chart me-1"></i> 統計報表
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link href="/annual" legacyBehavior>
                      <a className={`dropdown-item ${isActive('/annual') ? 'active' : ''}`}>
                        <i className="bi bi-calendar-check me-2"></i> 年度累計報表
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/annualTrend" legacyBehavior>
                      <a className={`dropdown-item ${isActive('/annualTrend') ? 'active' : ''}`}>
                        <i className="bi bi-graph-up me-2"></i> 年度趨勢分析
                      </a>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="#">
                      <i className="bi bi-file-earmark-excel me-2"></i> 匯出統計數據
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
            
            <form className="d-flex me-2" onSubmit={handleSearch}>
              <div className="input-group">
                <input 
                  className="form-control" 
                  type="search" 
                  placeholder="搜尋問題..." 
                  aria-label="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-outline-light" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
            
            <div className="dropdown">
              <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-person-circle me-2"></i>
                <span>管理員</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>個人資料</a></li>
                <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>設定</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#"><i className="bi bi-box-arrow-right me-2"></i>登出</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* 頁面標題區域 */}
      {title && (
        <div className="container-fluid mb-4">
          <div className="d-flex align-items-center">
            {title.icon && (
              <i className={`${title.icon} text-primary fs-2 me-3`}></i>
            )}
            <div>
              <h3 className="mb-1">{title.text}</h3>
              {title.subtitle && (
                <p className="text-muted mb-0">{title.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="container-fluid pb-5">
        {children}
      </div>

      {/* 頁腳 */}
      <footer className="footer py-3 bg-light mt-auto border-top">
        <div className="container-fluid">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="text-muted">
              © {new Date().getFullYear()} 問題管理系統
            </div>
            <div className="text-muted">
              <span>版本 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );    
} 