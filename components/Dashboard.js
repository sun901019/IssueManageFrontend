import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Bar, Pie } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Dashboard：顯示當月(或選取月份)的即時數據，包含：
 * - 每月 Issue 數量 (Bar)
 * - 問題類型 (Pie)
 * - 完成 vs 未完成 (Bar)
 * - 來源分佈 (Pie)
 */
export default function Dashboard() {
  // 狀態儲存
  const [issueCount, setIssueCount] = useState(0);
  const [issueTypes, setIssueTypes] = useState({});
  const [completed, setCompleted] = useState(0);
  const [uncompleted, setUncompleted] = useState(0);
  const [sourceStats, setSourceStats] = useState({});

  // 預設選擇「當前年月」，格式 "2025-03"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });

  useEffect(() => {
    fetchReportData(selectedMonth);
  }, [selectedMonth]);

  // 從後端 API 取即時月度統計
  const fetchReportData = async (month) => {
    try {
      // month 形如 "2025-03"
      const res = await axios.get(`/summaries/monthly?month=${month}`);
      const data = res.data || {};
      setIssueCount(data.issueCount || 0);
      setIssueTypes(data.issueTypes || {});
      setCompleted(data.completed || 0);
      setUncompleted(data.uncompleted || 0);
      setSourceStats(data.sourceStats || {});
    } catch (error) {
      console.error("❌ 取得報表數據失敗", error);
    }
  };

  // (1) 「每月 Issue 數量」的長條圖資料
  const barData = {
    labels: [selectedMonth],
    datasets: [
      {
        label: "Issue 數量",
        data: [issueCount],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false, // 關閉預設比例，讓圖表依容器大小縮放
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // (2) 問題類型 (Pie)
  const pieDataType = {
    labels: Object.keys(issueTypes),
    datasets: [
      {
        data: Object.values(issueTypes),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // (3) 完成 vs 未完成 (Bar)
  const barDataCompletion = {
    labels: ["已完成", "未完成"],
    datasets: [
      {
        label: "Issue 數量",
        data: [completed, uncompleted],
        backgroundColor: ["green", "red"],
      },
    ],
  };
  const barCompletionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // (4) 來源分佈 (Pie)
  const pieDataSource = {
    labels: Object.keys(sourceStats),
    datasets: [
      {
        data: Object.values(sourceStats),
        backgroundColor: ["#E74C3C", "#3498DB", "#27AE60", "#8E44AD", "#FFCE56"],
      },
    ],
  };
  const pieSourceOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="text-center mb-4">📊 數據分析儀表板</h2>

      {/* 月份選擇器 */}
      <div className="mb-4">
        <label className="me-2">選擇月份：</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {/* (1) 每月 Issue 數量 (Bar) */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title">📊 每月 Issue 數量</h5>
            <div style={{ height: "300px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* (2) 問題類型統計 (Pie) */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title">📝 問題類型統計</h5>
            <div style={{ height: "300px" }}>
              <Pie data={pieDataType} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* (3) 完成 vs 未完成 (Bar) */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title">✅ 完成 vs 未完成</h5>
            <div style={{ height: "300px" }}>
              <Bar data={barDataCompletion} options={barCompletionOptions} />
            </div>
          </div>
        </div>

        {/* (4) 來源統計 (Pie) */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title">🌐 來源統計</h5>
            <div style={{ height: "300px" }}>
              <Pie data={pieDataSource} options={pieSourceOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
