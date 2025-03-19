// frontend/components/IssueBoard.js

import { useEffect, useState } from "react";
import axios from "../utils/api";
import NewIssueForm from "./NewIssueForm"; // ✅ 確保 NewIssueForm 正確引入
import CommentSection from "./CommentSection"; // 添加評論組件
import QuickEditForm from "./QuickEditForm"; // 添加快速編輯組件
import React from "react";

export default function IssueBoard() {
  const [issues, setIssues] = useState([]);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // 控制「新增 Issue」表單開關
  const [activeTab, setActiveTab] = useState("details"); // 添加 tab 狀態: details 或 comments
  const [editingIssueId, setEditingIssueId] = useState(null); // 添加編輯狀態
  const [loading, setLoading] = useState(true); // 添加載入狀態

  useEffect(() => {
    fetchIssues();
  }, []);

  // 取得 Issue 清單
  const fetchIssues = async () => {
    try {
      setLoading(true);
      // 默认按创建日期降序排序
      const res = await axios.get("/issues?sort=created_at:desc");
      setIssues(res.data || []);
      console.log("API 返回數據:", res.data);
    } catch (error) {
      console.error("載入 Issue 失敗", error);
    } finally {
      setLoading(false);
    }
  };

  // 變更 Issue 狀態
  const updateIssueStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `/issues/${id}/status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );

      // 200 OK 時進行前端即時更新
      if (res.status === 200) {
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === id ? { ...issue, status: newStatus } : issue
          )
        );
      }
    } catch (error) {
      console.error("更新狀態失敗", error);
      alert("更新狀態失敗，請檢查連線或後端狀態");
    }
  };
   // 刪除 Issue
   const deleteIssue = async (id) => {
    try {
      // 注意：此時對應 /api/issues/:id -> "DELETE http://localhost:5000/api/issues/123"
      const res = await axios.delete(`/issues/${id}`);

      // 若成功，HTTP 狀態碼預設為 200
      if (res.status === 200) {
        // 從前端 state 移除那筆被刪的 Issue
        setIssues((prev) => prev.filter((issue) => issue.id !== id));
        
        // 如果刪除的正是展開的那個，重置展開狀態
        if (expandedIssueId === id) {
          setExpandedIssueId(null);
        }
      }
    } catch (error) {
      console.error("刪除 Issue 失敗", error);
      alert("刪除 Issue 失敗，請檢查 API 連線或後端狀態");
    }
  };

  // 處理快速編輯的儲存
  const handleQuickEditSave = (updatedIssue) => {
    // 更新本地狀態
    setIssues(prev => 
      prev.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
    
    // 關閉編輯模式
    setEditingIssueId(null);
  };

  const statuses = ["Pending", "In Progress", "Closed"];

  // 處理展開邏輯
  const handleExpand = (issueId) => {
    setExpandedIssueId(expandedIssueId === issueId ? null : issueId);
    setActiveTab("details"); // 預設顯示詳情標籤
  };

  // 根据状态返回对应的Bootstrap样式类
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'In Progress':
        return 'bg-primary';
      case 'Closed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  // 可用的狀態選項
  const statusOptions = [
    { value: "Pending", label: "待處理", icon: "bi-hourglass" },
    { value: "In Progress", label: "處理中", icon: "bi-play-circle" },
    { value: "Closed", label: "已完成", icon: "bi-check-circle" }
  ];

  // 快速更新狀態
  const handleQuickStatusUpdate = async (issueId, newStatus) => {
    try {
      await updateIssueStatus(issueId, newStatus);
    } catch (error) {
      console.error("更新狀態失敗:", error);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* 新增 Issue 按鈕 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={() => setIsAdding(true)}>
          <i className="bi bi-plus-circle me-1"></i> 新增 Issue
        </button>
        <div className="d-flex">
          <button className="btn btn-outline-primary me-2" onClick={fetchIssues}>
            <i className="bi bi-arrow-clockwise me-1"></i> 刷新資料
          </button>
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-sliders me-1"></i> 篩選選項
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><a className="dropdown-item" href="#">僅顯示待處理</a></li>
              <li><a className="dropdown-item" href="#">僅顯示進行中</a></li>
              <li><a className="dropdown-item" href="#">僅顯示已完成</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#">顯示全部</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 新增 Issue 表單 */}
      {isAdding && (
        <NewIssueForm
          onClose={() => setIsAdding(false)}
          onIssueAdded={fetchIssues}
        />
      )}

      {/* Loading 狀態 */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      ) : (
        /* Issue 列表 */
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "15%" }}>客戶名稱</th>
                    <th style={{ width: "10%" }}>來源</th>
                    <th style={{ width: "10%" }}>問題類型</th>
                    <th style={{ width: "10%" }}>狀態</th>
                    <th style={{ width: "10%" }}>負責人</th>
                    <th style={{ width: "10%" }}>建立日期</th>
                    <th style={{ width: "10%" }}>保固到期日</th>
                    <th style={{ width: "20%" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">載入中...</p>
                      </td>
                    </tr>
                  ) : issues.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <p className="text-muted mb-0">
                          <i className="bi bi-inbox me-2"></i>
                          目前沒有任何 Issue
                        </p>
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue) => (
                      <React.Fragment key={issue.id}>
                        <tr
                          className={expandedIssueId === issue.id ? "table-active" : ""}
                          onClick={() => handleExpand(issue.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{issue.id}</td>
                          <td>{issue.title}</td>
                          <td>{issue.source || "-"}</td>
                          <td>{issue.issue_type || "-"}</td>
                          <td>
                            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                              <span
                                className={`badge ${getStatusBadgeClass(issue.status)} dropdown-toggle`}
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                {statusOptions.find(s => s.value === issue.status)?.label || issue.status}
                              </span>
                              <ul className="dropdown-menu">
                                {statusOptions.map(option => (
                                  <li key={option.value}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleQuickStatusUpdate(issue.id, option.value)}
                                    >
                                      <i className={`bi ${option.icon} me-2`}></i>
                                      {option.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                          <td>{issue.assigned_to || "-"}</td>
                          <td>
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            {issue.warranty_end_date
                              ? new Date(issue.warranty_end_date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-primary btn-sm me-1 mb-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpand(issue.id);
                                }}
                              >
                                {expandedIssueId === issue.id ? "收起" : "展開"}
                              </button>
                              
                              <button
                                className="btn btn-info btn-sm me-1 mb-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingIssueId(issue.id);
                                }}
                              >
                                編輯
                              </button>
                              
                              <button
                                className="btn btn-danger btn-sm mb-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("確定要刪除這個 Issue 嗎？")) {
                                    deleteIssue(issue.id);
                                  }
                                }}
                              >
                                刪除
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* 快速編輯表單 */}
                        {editingIssueId === issue.id && (
                          <tr>
                            <td colSpan="9">
                              <QuickEditForm 
                                issue={issue} 
                                onUpdate={handleQuickEditSave}
                                onCancel={() => setEditingIssueId(null)}
                              />
                            </td>
                          </tr>
                        )}
                        
                        {/* 展開的詳情或評論 */}
                        {expandedIssueId === issue.id && (
                          <tr>
                            <td colSpan="9">
                              <div className="p-3 bg-light rounded">
                                {/* 添加標籤頁切換 */}
                                <ul className="nav nav-tabs mb-3">
                                  <li className="nav-item">
                                    <button 
                                      className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                      onClick={() => setActiveTab('details')}
                                    >
                                      <i className="bi bi-file-text me-1"></i> 問題詳情
                                    </button>
                                  </li>
                                  <li className="nav-item">
                                    <button 
                                      className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                      onClick={() => setActiveTab('comments')}
                                    >
                                      <i className="bi bi-chat-dots me-1"></i> 處理記錄
                                    </button>
                                  </li>
                                </ul>
                                
                                {/* 詳情內容 */}
                                {activeTab === 'details' && (
                                  <div>
                                    <h6>問題描述：</h6>
                                    <p className="p-2 bg-white rounded border">
                                      {issue.description || "無詳細描述"}
                                    </p>
                                  </div>
                                )}
                                
                                {/* 評論區域 */}
                                {activeTab === 'comments' && (
                                  <CommentSection 
                                    issueId={issue.id} 
                                    key={`comments-${issue.id}`}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
