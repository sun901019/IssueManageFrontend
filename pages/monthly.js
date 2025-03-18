import { useEffect, useState } from "react";
import axios from "../utils/api";
import StatsCard from "../components/StatsCard";

/**
 * 月報表頁面：從後端 /api/summaries/stored 取得指定年份+月份的彙總資料
 */
export default function MonthlyReportPage() {
  const [month, setMonth] = useState("3");    // 1~12
  const [year, setYear] = useState("2025");   // 預設年份
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    try {
      // 呼叫後端 API：例如 /api/summaries/stored?year=2025&month=3
      const res = await axios.get(`/summaries/stored?year=${year}&month=${month}`);
      // 後端若回傳 { data: {...} }，可直接取 res.data.data
      // 也可能是直接回傳 {...}，依你後端結構而定
      if (res.data?.data) {
        setReportData(res.data.data);
      } else {
        // 若查無紀錄
        setReportData(null);
      }
    } catch (error) {
      console.error("取得數據失敗:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">📅 月報表</h2>

      {/* 篩選年份 / 月份 */}
      <div className="mb-4">
        <label className="me-2">選擇年份：</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: "80px", marginRight: "20px" }}
        />
        <label className="me-2">選擇月份：</label>
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ width: "60px" }}
        />
      </div>

      {reportData ? (
        <div className="row g-4">
          <div className="col-md-4">
            <StatsCard title="📌 總 Issue 數" value={reportData.issueCount} color="primary" />
          </div>
          <div className="col-md-4">
            <StatsCard title="✅ 已完成" value={reportData.completed} color="success" />
          </div>
          <div className="col-md-4">
            <StatsCard title="⏳ 未完成" value={reportData.uncompleted} color="danger" />
          </div>
        </div>
      ) : (
        <div className="alert alert-info mt-4">查無紀錄或尚未彙總</div>
      )}
    </div>
  );
}
