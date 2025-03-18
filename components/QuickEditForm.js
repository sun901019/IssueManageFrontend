import { useState } from 'react';
import axios from '../utils/api';

const QuickEditForm = ({ issue, onUpdate, onCancel }) => {
  // 初始化表單數據
  const [formData, setFormData] = useState({
    title: issue.title,
    description: issue.description || '',
    source: issue.source,
    issue_type: issue.issue_type || '',
    status: issue.status
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      
      const response = await axios.put(`/issues/${issue.id}`, formData);
      
      if (response.status === 200) {
        // 告訴父組件更新已完成
        onUpdate(response.data);
      }
    } catch (err) {
      console.error('更新問題失敗:', err);
      setError('更新問題時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="quick-edit-form p-3 bg-light border rounded">
      <h5 className="mb-3">✏️ 快速編輯問題</h5>
      
      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">標題 *</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">描述</label>
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
            <label htmlFor="source" className="form-label">來源</label>
            <select
              className="form-select"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="業務">業務</option>
              <option value="Line chat">Line chat</option>
              <option value="現場">現場</option>
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="issue_type" className="form-label">問題類型</label>
            <select
              className="form-select"
              id="issue_type"
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
            >
              <option value="">--選擇類型--</option>
              <option value="硬體">硬體</option>
              <option value="軟體">軟體</option>
              <option value="網路">網路</option>
              <option value="系統">系統</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <label htmlFor="status" className="form-label">狀態</label>
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
        
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '處理中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickEditForm; 