import { useState } from "react";
import axios from "../utils/api";

export default function NewIssueForm({ onClose, onIssueAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "Line chat",
    issue_type: "系統功能",
    status: "Pending",
    created_at: "",
    priority: "中",
    estimated_hours: "",
    assigned_to: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  // 處理表單字段變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("請輸入客戶名稱");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setErrorDetails("");
      
      console.log('提交的資料:', formData);
      
      // 修正請求路径和格式
      // 注意: axios 已經在 ../utils/api.js 設置了 baseURL 為 'http://localhost:5000/api'
      // 所以這裡直接使用相對路徑 '/issues'
      const response = await axios.post(
        "/issues",
        formData,
        { 
          headers: { 
            "Content-Type": "application/json" 
          },
          // 添加調試信息
          timeout: 10000 // 10秒超時
        }
      );
      
      console.log('API響應狀態:', response.status);
      console.log('API響應數據:', response.data);
      
      if (response.status === 201) {
        console.log('成功創建:', response.data);
        onIssueAdded();
        onClose();
      }
    } catch (error) {
      console.error("新增 Issue 失敗", error);
      
      // 更詳細的錯誤處理
      setError("新增 Issue 失敗，請檢查連線或輸入資料");
      
      if (error.response) {
        // 伺服器回應的錯誤
        const status = error.response.status;
        const data = error.response.data;
        
        console.error(`HTTP 錯誤 ${status}:`, data);
        setErrorDetails(`伺服器錯誤 (${status}): ${data.error || data.message || JSON.stringify(data)}`);
      } else if (error.request) {
        // 請求發送但未收到回應
        console.error("未收到伺服器回應:", error.request);
        setErrorDetails("伺服器無回應，請確認後端服務是否正常運行");
      } else {
        // 發送請求前的錯誤
        console.error("請求配置錯誤:", error.message);
        setErrorDetails(`請求錯誤: ${error.message}`);
      }
      
      // 嘗試使用直接URL方式作為備用
      try {
        console.log("嘗試使用備用方式重新提交...");
        const directResponse = await fetch('http://localhost:5000/api/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('備用方式成功:', data);
          onIssueAdded();
          onClose();
          return;
        } else {
          console.error('備用方式失敗:', directResponse.status);
          setErrorDetails(prev => `${prev}\n\n備用請求也失敗 (${directResponse.status})`);
        }
      } catch (backupError) {
        console.error('備用請求出錯:', backupError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 問題類型選項
  const issueTypes = [
    "系統功能", "硬體", "網路", "軟體", "資料庫", "帳號權限", 
    "操作問題", "培訓需求", "安全性問題", "效能問題", "其他"
  ];
  
  // 來源選項
  const sourceOptions = ["業務", "Line chat", "現場", "Email", "電話", "客戶主動回報"];
  
  // 優先級選項
  const priorityOptions = ["高", "中", "低"];

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              新增 Issue
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>{error}</strong>
                {errorDetails && (
                  <div className="mt-2 small">
                    <hr />
                    <details>
                      <summary>詳細錯誤信息</summary>
                      <p className="mt-2">{errorDetails}</p>
                    </details>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* 左側欄位 */}
                <div className="col-md-6">
                  {/* 標題 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      客戶名稱 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="輸入客戶名稱或問題主旨"
                    />
                  </div>

                  {/* 來源 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">來源</label>
                    <select
                      className="form-select"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                    >
                      {sourceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* 問題類型 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">問題類型</label>
                    <select
                      className="form-select"
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleChange}
                    >
                      {issueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 建立日期 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">建立日期</label>
                    <input
                      type="date"
                      className="form-control"
                      name="created_at"
                      value={formData.created_at}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* 右側欄位 */}
                <div className="col-md-6">
                  {/* 優先級 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">優先級</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {priorityOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 預估時數 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">預估處理時數</label>
                    <input
                      type="number"
                      className="form-control"
                      name="estimated_hours"
                      value={formData.estimated_hours}
                      onChange={handleChange}
                      placeholder="輸入預估時數"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  
                  {/* 負責人 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">負責人</label>
                    <input
                      type="text"
                      className="form-control"
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                      placeholder="輸入負責處理人員"
                    />
                  </div>
                </div>
              </div>
              
              {/* 描述 - 橫跨整行 */}
              <div className="mb-4">
                <label className="form-label fw-bold">問題描述</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="詳細描述問題情況、重現步驟或客戶需求..."
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  取消
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      處理中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      新增問題
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
