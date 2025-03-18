import { useState } from 'react';
import axios from '../utils/api';

const ReportExport = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 取得可選年份列表
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      years.push(y);
    }
    return years.reverse();
  };
  
  // 取得可選月份列表
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };
  
  // 匯出Excel
  const exportExcel = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 以下透過直接請求API端點的方式下載檔案，而不是使用AJAX
      window.location.href = `${axios.defaults.baseURL}/report/export/excel/monthly?year=${year}&month=${month}`;
      
      // 不設定loading為false，因為會離開當前頁面
    } catch (error) {
      console.error('匯出Excel失敗:', error);
      setError('匯出報表時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };
  
  // 匯出PDF
  const exportPdf = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 以下透過直接請求API端點的方式下載檔案，而不是使用AJAX
      window.location.href = `${axios.defaults.baseURL}/report/export/pdf/monthly?year=${year}&month=${month}`;
      
      // 不設定loading為false，因為會離開當前頁面
    } catch (error) {
      console.error('匯出PDF失敗:', error);
      setError('匯出報表時發生錯誤，請稍後再試');
      setLoading(false);
    }
  };
  
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0">
        <h5 className="card-title mb-0">📊 匯出報表</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="reportYear" className="form-label">年份</label>
            <select
              id="reportYear"
              className="form-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {getYearOptions().map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label htmlFor="reportMonth" className="form-label">月份</label>
            <select
              id="reportMonth"
              className="form-select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {getMonthOptions().map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="d-flex">
          <button
            className="btn btn-primary me-2"
            onClick={exportExcel}
            disabled={loading}
          >
            <i className="bi bi-file-earmark-excel me-1"></i>
            匯出Excel報表
          </button>
          
          <button
            className="btn btn-danger"
            onClick={exportPdf}
            disabled={loading}
          >
            <i className="bi bi-file-earmark-pdf me-1"></i>
            匯出PDF報表
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExport; 