// frontend/components/IssueBoard.js

import { useEffect, useState } from "react";
import axios from "../utils/api";
import NewIssueForm from "./NewIssueForm"; // ✅ 確保 NewIssueForm 正確引入
import React from "react";

export default function IssueBoard() {
  const [issues, setIssues] = useState([]);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // 控制「新增 Issue」表單開關

  useEffect(() => {
    fetchIssues();
  }, []);

  // 取得 Issue 清單
  const fetchIssues = async () => {
    try {
      const res = await axios.get("/issues");
      setIssues(res.data);
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
      }
    } catch (error) {
      console.error("刪除 Issue 失敗", error);
      alert("刪除 Issue 失敗，請檢查 API 連線或後端狀態");
    }
  };

  const statuses = ["Pending", "In Progress", "Closed"];


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
                <th>操作</th>
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
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            setExpandedIssueId(
                              expandedIssueId === issue.id ? null : issue.id
                            )
                          }
                        >
                          {expandedIssueId === issue.id ? "收起" : "編輯"}
                        </button>
                        {/* ★ 新增：刪除按鈕 */}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (window.confirm("確定要刪除這個 Issue 嗎？")) {
                              deleteIssue(issue.id);
                            }
                          }}
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                    {expandedIssueId === issue.id && (
                      <tr>
                        <td colSpan="6">
                          <div className="p-3 bg-light">
                            <h6>問題描述：</h6>
                            <p>{issue.description || "無詳細描述"}</p>
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
