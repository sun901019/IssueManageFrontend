import { useState } from 'react';

const IssueFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    issue_type: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_direction: 'desc'
  });

  // 處理篩選條件變更
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // 清除所有篩選條件
  const clearFilters = () => {
    const resetFilters = {
      search: '',
      status: '',
      source: '',
      issue_type: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_direction: 'desc'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🔍 篩選選項</h5>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={clearFilters}
        >
          清除篩選
        </button>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* 關鍵字搜尋 */}
          <div className="col-md-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="search"
                name="search"
                placeholder="搜尋標題或描述..."
                value={filters.search}
                onChange={handleFilterChange}
              />
              <label htmlFor="search">關鍵字搜尋</label>
            </div>
          </div>
          
          {/* 狀態篩選 */}
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">全部</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <label htmlFor="status">狀態</label>
            </div>
          </div>
          
          {/* 來源篩選 */}
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="source"
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
              >
                <option value="">全部</option>
                <option value="Email">Email</option>
                <option value="Line">Line</option>
                <option value="電話">電話</option>
                <option value="現場">現場</option>
                <option value="其他">其他</option>
              </select>
              <label htmlFor="source">來源</label>
            </div>
          </div>
          
          {/* 問題類型篩選 */}
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="issue_type"
                name="issue_type"
                value={filters.issue_type}
                onChange={handleFilterChange}
              >
                <option value="">全部</option>
                <option value="硬體">硬體</option>
                <option value="軟體">軟體</option>
                <option value="網路">網路</option>
                <option value="系統">系統</option>
                <option value="其他">其他</option>
              </select>
              <label htmlFor="issue_type">問題類型</label>
            </div>
          </div>
          
          {/* 排序方式 */}
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="sort_by"
                name="sort_by"
                value={filters.sort_by}
                onChange={handleFilterChange}
              >
                <option value="created_at">建立日期</option>
                <option value="title">標題</option>
                <option value="status">狀態</option>
                <option value="source">來源</option>
              </select>
              <label htmlFor="sort_by">排序依據</label>
            </div>
          </div>
        </div>
        
        <div className="row g-3 mt-1">
          {/* 日期區間 */}
          <div className="col-md-3">
            <div className="form-floating">
              <input
                type="date"
                className="form-control"
                id="date_from"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
              <label htmlFor="date_from">起始日期</label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-floating">
              <input
                type="date"
                className="form-control"
                id="date_to"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
              <label htmlFor="date_to">結束日期</label>
            </div>
          </div>
          
          {/* 排序方向 */}
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="sort_direction"
                name="sort_direction"
                value={filters.sort_direction}
                onChange={handleFilterChange}
              >
                <option value="desc">降序 (新→舊)</option>
                <option value="asc">升序 (舊→新)</option>
              </select>
              <label htmlFor="sort_direction">排序方向</label>
            </div>
          </div>
          
          {/* 應用按鈕 */}
          <div className="col-md-4 d-flex align-items-center">
            <div className="d-flex">
              <button
                type="button"
                className="btn btn-primary ms-auto"
                onClick={() => onFilterChange(filters)}
              >
                應用篩選
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueFilter; 