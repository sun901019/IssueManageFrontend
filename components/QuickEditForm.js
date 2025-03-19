import { useState } from 'react';
import axios from '../utils/api';

const QuickEditForm = ({ issue, onUpdate, onCancel }) => {
  // 初始化表單數據
  const [formData, setFormData] = useState({
    title: issue.title,
    description: issue.description || '',
    source: issue.source,
    issue_type: issue.issue_type || '',
    status: issue.status,
    priority: issue.priority || '中',
    estimated_hours: issue.estimated_hours || '',
    assigned_to: issue.assigned_to || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  
  // 處理表單字段變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('標題不能為空！');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setErrorDetails('');
      
      console.log(`準備更新問題 ID: ${issue.id}，數據:`, formData);
      
      // 使用兩種方式嘗試請求：先用標準JSON格式
      const response = await axios.put(
        `/issues/${issue.id}`, 
        formData,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10秒超時
        }
      );
      
      console.log('更新成功，響應狀態:', response.status);
      console.log('更新成功，響應數據:', response.data);
      
      if (response.status === 200) {
        // 告訴父組件更新已完成
        onUpdate(response.data);
      }
    } catch (err) {
      console.error('更新問題失敗:', err);
      setError('更新問題時發生錯誤，請稍後再試。');
      
      // 詳細錯誤處理
      if (err.response) {
        // 伺服器回應的錯誤
        const status = err.response.status;
        const data = err.response.data;
        
        console.error(`HTTP 錯誤 ${status}:`, data);
        setErrorDetails(`伺服器錯誤 (${status}): ${data.error || data.message || JSON.stringify(data)}`);
        
        // 如果是 400 錯誤，可能是缺少必要欄位
        if (status === 400) {
          setError(`請求格式錯誤: ${data.error || '請檢查所有必填欄位'}`);
        }
      } else if (err.request) {
        // 請求發送但未收到回應
        console.error("未收到伺服器回應:", err.request);
        setErrorDetails("伺服器無回應，請確認後端服務是否正常運行");
      } else {
        // 發送請求前的錯誤
        console.error("請求配置錯誤:", err.message);
        setErrorDetails(`請求錯誤: ${err.message}`);
      }
      
      // 嘗試使用兩種不同的備用方式
      
      // 備用方式1: 使用FormData格式
      try {
        console.log("嘗試使用FormData格式重新提交...");
        const formDataObj = new FormData();
        Object.keys(formData).forEach(key => {
          formDataObj.append(key, formData[key]);
        });
        
        const retryResponse = await axios.put(`/issues/${issue.id}`, formDataObj, {
          timeout: 10000
        });
        
        console.log('FormData方式更新成功，狀態:', retryResponse.status);
        console.log('FormData方式更新成功，數據:', retryResponse.data);
        
        if (retryResponse.status === 200) {
          setError('');
          setErrorDetails('');
          onUpdate(retryResponse.data);
          return;
        }
      } catch (retryErr) {
        console.error('FormData方式失敗:', retryErr);
        setErrorDetails((prev) => `${prev}\n\n備用方式(FormData)失敗: ${retryErr.message}`);
      }
      
      // 備用方式2: 使用直接fetch調用完整URL
      try {
        console.log("嘗試使用fetch直接調用完整URL...");
        const directResponse = await fetch(`http://localhost:5000/api/issues/${issue.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('直接fetch方式成功:', data);
          setError('');
          setErrorDetails('');
          onUpdate(data);
          return;
        } else {
          console.error('直接fetch方式失敗:', directResponse.status);
          setErrorDetails(prev => `${prev}\n\n直接fetch方式也失敗 (${directResponse.status})`);
        }
      } catch (fetchErr) {
        console.error('直接fetch方式失敗:', fetchErr);
        setErrorDetails(prev => `${prev}\n\n直接fetch方式失敗: ${fetchErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 可用的來源選項
  const sourceOptions = ["業務", "Line chat", "現場", "Email", "電話", "客戶主動回報"];
  
  // 可用的問題類型選項
  const issueTypeOptions = [
    "系統功能", "硬體", "網路", "軟體", "資料庫", "帳號權限", 
    "操作問題", "培訓需求", "安全性問題", "效能問題", "其他"
  ];
  
  // 優先級選項
  const priorityOptions = ["高", "中", "低"];
  
  return (
    <div className="quick-edit-form">
      <h5 className="mb-3 d-flex align-items-center">
        <i className="bi bi-pencil-square text-primary me-2"></i>
        快速編輯問題 #{issue.id}
      </h5>
      
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>{error}</strong>
          {errorDetails && (
            <div className="mt-2 small">
              <hr />
              <details>
                <summary>詳細錯誤信息</summary>
                <p className="mt-2 text-break">{errorDetails}</p>
              </details>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label fw-bold">標題 <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label fw-bold">描述</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="source" className="form-label fw-bold">來源</label>
            <select
              className="form-select"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              {sourceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="issue_type" className="form-label fw-bold">問題類型</label>
            <select
              className="form-select"
              id="issue_type"
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
            >
              <option value="">--選擇類型--</option>
              {issueTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="status" className="form-label fw-bold">狀態</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="priority" className="form-label fw-bold">優先級</label>
            <select
              className="form-select"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="estimated_hours" className="form-label fw-bold">預估時數</label>
            <input
              type="number"
              className="form-control"
              id="estimated_hours"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={handleChange}
              min="0"
              step="0.5"
            />
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="assigned_to" className="form-label fw-bold">負責人</label>
            <input
              type="text"
              className="form-control"
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary me-2"
            onClick={onCancel}
            disabled={loading}
          >
            <i className="bi bi-x-circle me-1"></i>
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                處理中...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                儲存變更
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickEditForm; 