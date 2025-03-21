// frontend/components/IssueBoard.js

import { useEffect, useState } from "react";
import axios from "../utils/api";
import NewIssueForm from "./NewIssueForm"; // ✅ 確保 NewIssueForm 正確引入
import CommentSection from "./CommentSection"; // 添加評論組件
import QuickEditForm from "./QuickEditForm"; // 添加快速編輯組件
import React from "react";
import { useRouter } from "next/router";

export default function IssueBoard() {
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // 控制「新增 Issue」表單開關
  const [activeTab, setActiveTab] = useState("details"); // 添加 tab 狀態: details 或 comments
  const [editingIssueId, setEditingIssueId] = useState(null); // 添加編輯狀態
  const [loading, setLoading] = useState(true); // 添加載入狀態
  
  // 添加分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 添加筛选状态
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  // 監聽 URL 查詢參數的變化
  useEffect(() => {
    if (router.query.search) {
      setSearchTerm(router.query.search);
      setCurrentPage(1); // 重置到第一頁顯示搜尋結果
    }
  }, [router.query.search]);

  // 添加筛选逻辑，包含搜尋功能
  useEffect(() => {
    filterIssues();
  }, [issues, statusFilter, startDate, endDate, searchTerm]);

  // 筛选功能
  const filterIssues = () => {
    let filtered = [...issues];

    // 关键字搜索
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(issue => 
        (issue.title && issue.title.toLowerCase().includes(searchLower)) ||
        (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
        (issue.assigned_to && issue.assigned_to.toLowerCase().includes(searchLower)) ||
        (issue.customer_name && issue.customer_name.toLowerCase().includes(searchLower))
      );
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // 日期筛选
    if (startDate) {
      filtered = filtered.filter(issue => 
        issue.created_at && new Date(issue.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(issue => 
        issue.created_at && new Date(issue.created_at) <= new Date(endDate)
      );
    }

    setFilteredIssues(filtered);
  };

  // 重置筛选
  const resetFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1); // 重置页码
    
    // 如果是從搜尋結果頁面重置，清除 URL 查詢參數
    if (router.query.search) {
      router.push('/issues', undefined, { shallow: true });
    }
  };

  // 清除搜尋關鍵字
  const clearSearch = () => {
    setSearchTerm('');
    if (router.query.search) {
      router.push('/issues', undefined, { shallow: true });
    }
  };

  // 计算当前页的数据
  const getCurrentPageData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredIssues.slice(indexOfFirstItem, indexOfLastItem);
  };

  // 处理页码变化
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedIssueId(null); // 换页时收起展开的行
    setEditingIssueId(null); // 换页时关闭编辑状态
  };

  // 计算总页数
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // 最多显示5个页码
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 如果总页数大于5，显示当前页附近的页码
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

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
        return 'bg-warning bg-opacity-75 text-dark';
      case 'In Progress':
        return 'bg-primary bg-opacity-75';
      case 'Closed':
        return 'bg-success bg-opacity-75';
      default:
        return 'bg-secondary bg-opacity-75';
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
        <button className="btn btn-success shadow-sm" onClick={() => setIsAdding(true)}>
          <i className="bi bi-plus-circle me-1"></i> 新增 Issue
        </button>

        <div className="d-flex align-items-center gap-2 bg-light p-2 rounded shadow-sm">
          {/* 搜尋框 */}
          <div className="input-group me-2" style={{ width: "280px" }}>
            <input
              type="text"
              className="form-control form-control-sm shadow-sm"
              placeholder="搜尋問題..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearSearch}
                title="清除搜尋"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => router.push({ pathname: '/issues', query: { search: searchTerm } }, undefined, { shallow: true })}
              disabled={!searchTerm}
              title="搜尋"
            >
              <i className="bi bi-search"></i>
            </button>
          </div>

          {/* 日期筛选 */}
          <div className="d-flex align-items-center">
            <span className="text-secondary me-2">
              <i className="bi bi-calendar-event me-1"></i>
              日期:
            </span>
            <input
              type="date"
              className="form-control form-control-sm me-1 shadow-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="开始日期"
            />
            <span className="text-secondary mx-1">至</span>
            <input
              type="date"
              className="form-control form-control-sm me-2 shadow-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="结束日期"
            />
          </div>
          
          {/* 状态筛选 */}
          <div className="dropdown me-2">
            <button 
              className="btn btn-sm btn-outline-secondary shadow-sm dropdown-toggle"
              type="button" 
              id="dropdownMenuButton" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i className="bi bi-funnel me-1"></i>
              {statusFilter === 'all' ? '全部狀態' : 
               statusFilter === 'Pending' ? '待處理' :
               statusFilter === 'In Progress' ? '處理中' : '已完成'}
            </button>
            <ul className="dropdown-menu shadow" aria-labelledby="dropdownMenuButton">
              <li>
                <button 
                  className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  <i className="bi bi-check-all me-2"></i>
                  顯示全部
                </button>
              </li>
              {statusOptions.map(option => (
                <li key={option.value}>
                  <button 
                    className={`dropdown-item ${statusFilter === option.value ? 'active' : ''}`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    <i className={`bi ${option.icon} me-2`}></i>
                    僅顯示{option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 重置筛选按钮 */}
          <button 
            className="btn btn-sm btn-outline-secondary shadow-sm me-2"
            onClick={resetFilters}
            title="重置筛选"
          >
            <i className="bi bi-x-circle me-1"></i>
            重置
          </button>
          
          <button 
            className="btn btn-sm btn-outline-primary shadow-sm"
            onClick={fetchIssues}
            title="刷新数据"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            刷新
          </button>
        </div>
      </div>

      {/* 顯示搜尋結果提示 */}
      {searchTerm && (
        <div className="alert alert-info d-flex align-items-center mb-3">
          <i className="bi bi-info-circle me-2"></i>
          <span>
            搜尋 "{searchTerm}" 的結果: <strong>{filteredIssues.length}</strong> 筆問題
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary ms-auto"
            onClick={clearSearch}
          >
            <i className="bi bi-x me-1"></i>
            清除搜尋
          </button>
        </div>
      )}

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
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-secondary">
                    <th style={{ width: "20%" }} className="px-3 py-2">客戶名稱</th>
                    <th style={{ width: "10%" }} className="px-3 py-2">來源</th>
                    <th style={{ width: "10%" }} className="px-3 py-2">問題類型</th>
                    <th style={{ width: "10%" }} className="px-3 py-2">狀態</th>
                    <th style={{ width: "10%" }} className="px-3 py-2">負責人</th>
                    <th style={{ width: "12%" }} className="px-3 py-2">建立日期</th>
                    <th style={{ width: "12%" }} className="px-3 py-2">保固到期日</th>
                    <th style={{ width: "16%" }} className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">載入中...</p>
                      </td>
                    </tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <p className="text-muted mb-0">
                          <i className="bi bi-inbox me-2"></i>
                          目前沒有任何 Issue
                        </p>
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageData().map((issue, idx) => (
                      <React.Fragment key={issue.id}>
                        <tr
                          className={`${expandedIssueId === issue.id ? "table-active" : idx % 2 === 0 ? "table-light" : ""}`}
                          onClick={() => handleExpand(issue.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="px-3 py-2 text-truncate" style={{ maxWidth: "250px" }}>{issue.title}</td>
                          <td className="px-3 py-2">{issue.source || "-"}</td>
                          <td className="px-3 py-2">{issue.issue_type || "-"}</td>
                          <td className="px-3 py-2">
                            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                              <span
                                className={`badge rounded-pill ${getStatusBadgeClass(issue.status)} px-3 py-2 shadow-sm dropdown-toggle`}
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className={`bi ${statusOptions.find(s => s.value === issue.status)?.icon} me-1`}></i>
                                {statusOptions.find(s => s.value === issue.status)?.label || issue.status}
                              </span>
                              <ul className="dropdown-menu shadow-sm">
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
                          <td className="px-3 py-2">
                            {issue.assigned_to ? 
                              <span className="d-inline-flex align-items-center">
                                <i className="bi bi-person-circle me-1 text-secondary"></i>
                                {issue.assigned_to}
                              </span> : 
                              <span className="text-muted fst-italic">未指派</span>
                            }
                          </td>
                          <td className="px-3 py-2">
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleDateString()
                              : <span className="text-muted fst-italic">-</span>}
                          </td>
                          <td className="px-3 py-2">
                            {issue.warranty_end_date
                              ? new Date(issue.warranty_end_date).toLocaleDateString()
                              : <span className="text-muted fst-italic">-</span>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-circle"
                                style={{ width: "32px", height: "32px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpand(issue.id);
                                }}
                                title={expandedIssueId === issue.id ? "收起" : "展開"}
                              >
                                <i className={`bi ${expandedIssueId === issue.id ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                              </button>
                              
                              <button
                                className="btn btn-sm btn-outline-info rounded-circle"
                                style={{ width: "32px", height: "32px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingIssueId(issue.id);
                                }}
                                title="編輯"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle"
                                style={{ width: "32px", height: "32px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("確定要刪除這個 Issue 嗎？")) {
                                    deleteIssue(issue.id);
                                  }
                                }}
                                title="刪除"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* 快速編輯表單 */}
                        {editingIssueId === issue.id && (
                          <tr>
                            <td colSpan="8">
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
                            <td colSpan="8">
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

            {/* 分页导航 */}
            {filteredIssues.length > 0 && (
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-bottom border-top">
                <div className="text-secondary small">
                  <i className="bi bi-info-circle me-1"></i>
                  共 <span className="fw-bold">{filteredIssues.length}</span> 筆資料，第 <span className="fw-bold">{currentPage}</span> 頁，共 <span className="fw-bold">{totalPages}</span> 頁
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination pagination-sm mb-0">
                    {/* 上一页按钮 */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {/* 页码按钮 */}
                    {getPageNumbers().map((pageNum, index) => (
                      <li
                        key={index}
                        className={`page-item ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}

                    {/* 下一页按钮 */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
