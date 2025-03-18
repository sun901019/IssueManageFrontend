import { useState } from "react";
import axios from "../utils/api";

export default function NewIssueForm({ onClose, onIssueAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("Line chat");
  const [issueType, setIssueType] = useState("系統");
  const defaultStatus = "Pending";

  // ★[新增] 建立日期的 state，預設給空字串即可
  const [createdAt, setCreatedAt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("請輸入標題");

    try {
      const response = await axios.post(
        "/issues",
        {
          title,
          description,
          source,
          issue_type: issueType,
          status: defaultStatus,
          // ★[新增] 在這裡帶給後端
          created_at: createdAt,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 201) {
        onIssueAdded();
        onClose();
      } else {
        console.error("新增 Issue 失敗，API 回應錯誤", response);
      }
    } catch (error) {
      console.error("新增 Issue 失敗", error);
      alert("新增 Issue 失敗，請檢查 API 連線！");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📄 新增 Issue</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* 標題 */}
              <div className="mb-3">
                <label className="form-label">客戶名稱</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* 描述 */}
              <div className="mb-3">
                <label className="form-label">描述</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* 來源 */}
              <div className="mb-3">
                <label className="form-label">來源</label>
                <select
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="業務">業務</option>
                  <option value="Line chat">Line chat</option>
                  <option value="現場">現場</option>
                </select>
              </div>

              {/* 問題類型 */}
              <div className="mb-3">
                <label className="form-label">問題類型</label>
                <select
                  className="form-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="系統">系統功能</option>
                  <option value="系統">系統</option>
                  <option value="硬體">硬體</option>
                  {/* 其他選項可自行增加 */}
                </select>
              </div>

              {/* ★[新增] 建立日期欄位 */}
              <div className="mb-3">
                <label className="form-label">建立日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                新增
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
