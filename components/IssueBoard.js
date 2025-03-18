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

  useEffect(() => {
    fetchIssues();
  }, []);

  // 取得 Issue 清單
  const fetchIssues = async () => {
    try {
      const res = await axios.get("/issues");
      setIssues(res.data.issues || []);
    } catch (error) {
      console.error("載入 Issue 失敗", error);
    }
  };

  // 變更 Issue 狀態
  const updateIssueStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `/issues/${id}`,
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
      } else {
        console.error("更新狀態失敗，API 回應錯誤", res);
      }
    } catch (error) {
      console.error("更新 Issue 狀態失敗", error);
      alert("更改狀態失敗，請確認 API 是否正常運行！");
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>📌 Issue 紀錄管理</h1>
        <div>
          <button className="btn btn-outline-secondary me-2">📊 Dashboard</button>
          <button className="btn btn-outline-primary">📁 Issue 看板</button>
        </div>
      </div>

      {/* 新增 Issue 按鈕 */}
      <button className="btn btn-success mb-3" onClick={() => setIsAdding(true)}>
        ➕ 新增 Issue
      </button>

      {/* 新增 Issue 表單 */}
      {isAdding && (
        <NewIssueForm
          onClose={() => setIsAdding(false)}
          onIssueAdded={fetchIssues}
        />
      )}

      {/* Issue 列表 */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>標題</th>
                <th>來源</th>
                <th>問題類型</th>
                <th>狀態</th>
                <th>建立日期</th>
                <th style={{minWidth: '200px'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    📭 沒有 Issue
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <tr>
                      <td>{issue.title}</td>
                      <td>{issue.source}</td>
                      <td>{issue.issue_type || "未分類"}</td>
                      <td>
                        <select
                          className="form-select"
                          value={issue.status}
                          onChange={(e) =>
                            updateIssueStatus(issue.id, e.target.value)
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {issue.created_at
                          ? new Date(issue.created_at).toLocaleDateString()
                          : "無效日期"}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap">
                          <button
                            className="btn btn-primary btn-sm me-1 mb-1"
                            onClick={() => handleExpand(issue.id)}
                          >
                            {expandedIssueId === issue.id ? "收起" : "展開"}
                          </button>
                          
                          {/* 新增：快速編輯按鈕 */}
                          <button
                            className="btn btn-info btn-sm me-1 mb-1"
                            onClick={() => setEditingIssueId(issue.id)}
                          >
                            編輯
                          </button>
                          
                          <button
                            className="btn btn-danger btn-sm mb-1"
                            onClick={() => {
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
                        <td colSpan="6">
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
                        <td colSpan="6">
                          <div className="p-3 bg-light">
                            {/* 添加標籤頁切換 */}
                            <ul className="nav nav-tabs mb-3">
                              <li className="nav-item">
                                <button 
                                  className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                  onClick={() => setActiveTab('details')}
                                >
                                  📋 問題詳情
                                </button>
                              </li>
                              <li className="nav-item">
                                <button 
                                  className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                  onClick={() => setActiveTab('comments')}
                                >
                                  💬 處理記錄
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
                              <CommentSection issueId={issue.id} />
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
  );
}
