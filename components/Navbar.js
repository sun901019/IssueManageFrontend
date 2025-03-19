import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  
  // 檢查當前路徑是否為活動項目
  const isActive = (path) => {
    return router.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container-fluid">
        <Link href="/" legacyBehavior>
          <a className="navbar-brand d-flex align-items-center">
            <i className="bi bi-clipboard-check fs-4 me-2"></i>
            <span className="fw-bold">問題管理系統</span>
          </a>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" legacyBehavior>
                <a className={`nav-link ${isActive('/')}`}>
                  <i className="bi bi-house-door me-1"></i>
                  首頁
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/issues" legacyBehavior>
                <a className={`nav-link ${isActive('/issues')}`}>
                  <i className="bi bi-list-check me-1"></i>
                  問題列表
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/analytics" legacyBehavior>
                <a className={`nav-link ${isActive('/analytics')}`}>
                  <i className="bi bi-bar-chart-line me-1"></i>
                  數據分析
                </a>
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-gear me-1"></i>
                系統管理
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link href="/users" legacyBehavior>
                    <a className="dropdown-item">
                      <i className="bi bi-people me-2"></i>
                      使用者管理
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/settings" legacyBehavior>
                    <a className="dropdown-item">
                      <i className="bi bi-sliders me-2"></i>
                      系統設置
                    </a>
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link href="/backups" legacyBehavior>
                    <a className="dropdown-item">
                      <i className="bi bi-cloud-arrow-down me-2"></i>
                      數據備份
                    </a>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          
          <div className="d-flex">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="搜尋問題..." 
                aria-label="搜尋問題"
              />
              <button className="btn btn-light" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
            
            <div className="dropdown ms-2">
              <button 
                className="btn btn-outline-light dropdown-toggle" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-1"></i>
                管理員
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-person me-2"></i>
                    個人資料
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-bell me-2"></i>
                    通知 <span className="badge bg-danger rounded-pill">3</span>
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    登出
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 