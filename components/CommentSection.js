import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const CommentSection = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState([]);
  const [error, setError] = useState('');

  // 一進入頁面就取得評論列表
  useEffect(() => {
    if (issueId) {
      fetchComments();
    }
  }, [issueId]);

  // 取得評論
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('正在獲取 issue ID 為', issueId, '的評論');
      
      // 使用完整 URL，而不是依賴 axios 配置
      const res = await axios.get(`http://localhost:5000/api/comments/issue/${issueId}`);
      console.log('獲取到評論:', res.data);
      setComments(res.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError('載入評論失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 處理檔案選擇 (新評論)
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 處理檔案選擇 (編輯評論)
  const handleEditFileChange = (e) => {
    if (e.target.files) {
      setEditFiles(Array.from(e.target.files));
    }
  };

  // 提交評論
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      // 建立 FormData 處理檔案
      const formData = new FormData();
      formData.append('issue_id', issueId);
      formData.append('content', newComment);
      formData.append('created_by', 'User'); // 使用正確的欄位名稱
      
      // 添加檔案
      files.forEach(file => {
        formData.append('attachments', file);
      });
      
      console.log('提交評論，參數：', {
        issue_id: issueId,
        content: newComment,
        files: files.length
      });
      
      // 使用完整 URL，注意：使用 FormData 時，axios 會自動設置正確的 Content-Type
      await axios.post('http://localhost:5000/api/comments', formData);
      
      // 重新獲取評論
      fetchComments();
      setNewComment('');
      setFiles([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('添加評論失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 開始編輯評論
  const startEditingComment = (comment) => {
    console.log('開始編輯評論:', comment);
    setEditingCommentId(comment.id);
    setEditText(comment.content);
    setEditFiles([]);
    setAttachmentsToRemove([]);
  };

  // 取消編輯
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
    setEditFiles([]);
    setAttachmentsToRemove([]);
  };

  // 標記附件為刪除
  const markAttachmentForRemoval = (attachmentPath) => {
    setAttachmentsToRemove(prev => [...prev, attachmentPath]);
  };

  // 取消標記附件為刪除
  const unmarkAttachmentForRemoval = (attachmentPath) => {
    setAttachmentsToRemove(prev => prev.filter(path => path !== attachmentPath));
  };

  // 更新評論
  const updateComment = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('提交評論編輯:');
      console.log('- 評論 ID:', commentId);
      console.log('- 新內容:', editText);
      
      // 直接使用 JSON 格式發送請求
      const response = await axios({
        method: 'PUT',
        url: `http://localhost:5000/api/comments/${commentId}`,
        data: {
          content: editText
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('編輯成功，響應:', response.data);
      
      // 更新本地評論列表
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? { ...comment, ...response.data } : comment
        )
      );
      
      // 重置編輯狀態
      setEditingCommentId(null);
      setEditText('');
      setEditFiles([]);
      setAttachmentsToRemove([]);
    } catch (error) {
      console.error('更新評論失敗:', error);
      if (error.response) {
        console.error('錯誤響應:', error.response.data);
        setError(`更新失敗: ${error.response.data.error || error.message}`);
      } else {
        setError(`更新失敗: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 刪除評論
  const deleteComment = async (commentId) => {
    if (!window.confirm('確定要刪除此評論嗎？')) return;
    
    try {
      setLoading(true);
      setError('');
      // 使用完整 URL
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`);
      
      // 從本地狀態移除評論
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError('刪除評論失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: zhTW
      });
    } catch (error) {
      return '未知時間';
    }
  };

  return (
    <div className="mt-4 card">
      <div className="card-header bg-light">
        <h5 className="mb-0">💬 問題處理記錄 ({comments.length})</h5>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        {/* 評論列表 */}
        {comments.length === 0 ? (
          <div className="text-center text-muted py-3">
            目前還沒有處理記錄，請添加第一條記錄...
          </div>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold">
                    {comment.created_by || 'Anonymous'}
                    <span className="text-muted ms-2 small">
                      {formatDate(comment.created_at)}
                      {comment.edited && <span className="ms-1">(已編輯)</span>}
                    </span>
                  </div>
                  <div>
                    {editingCommentId !== comment.id && (
                      <>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => startEditingComment(comment)}
                        >
                          編輯
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteComment(comment.id)}
                        >
                          刪除
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {editingCommentId === comment.id ? (
                  // 編輯模式
                  <div className="mt-2">
                    <textarea
                      className="form-control mb-2"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
                    
                    <button 
                      className="btn btn-sm btn-success me-1"
                      onClick={() => {
                        console.log('點擊確認修改按鈕，ID:', comment.id);
                        updateComment(comment.id);
                      }}
                      disabled={loading || !editText.trim()}
                    >
                      {loading ? '處理中...' : '確認修改'}
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={cancelEditing}
                      disabled={loading}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  // 顯示模式
                  <div className="mt-2">
                    <div className="comment-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </div>
                    
                    {/* 附件列表 */}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        <div className="small fw-bold text-muted">附件：</div>
                        <div className="d-flex flex-wrap">
                          {comment.attachments.map((attachment, index) => (
                            <div key={index} className="attachment mt-1 me-2">
                              <a 
                                href={`http://localhost:5000/uploads/${attachment.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                              >
                                <span className="badge bg-light text-dark p-2 border">
                                  📎 {attachment.filename}
                                </span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 新增評論表單 */}
        <form onSubmit={submitComment} className="mt-3">
          <div className="mb-3">
            <label htmlFor="commentText" className="form-label fw-bold">
              添加處理記錄
            </label>
            <textarea
              id="commentText"
              className="form-control"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="記錄問題處理進展、解決方案或其他相關信息..."
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="attachments" className="form-label">
              附件 (可選，最多5個)
            </label>
            <input
              type="file"
              className="form-control"
              id="attachments"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xlsx,.pptx"
            />
            {files.length > 0 && (
              <div className="mt-2 small text-muted">
                已選擇 {files.length} 個文件
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !newComment.trim()}
          >
            {loading ? '處理中...' : '添加處理記錄'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection; 