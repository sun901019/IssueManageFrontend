// frontend/pages/annualTrend.js
import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Line } from "react-chartjs-2";   // ★ 匯入 Line
import "../utils/chartjs-setup";

export default function AnnualTrendPage() {
  const [year, setYear] = useState("2025");
  const [monthsData, setMonthsData] = useState([]);

  useEffect(() => {
    fetchAnnualTrend(year);
  }, [year]);

  const fetchAnnualTrend = async (y) => {
    try {
      // 依你實際路徑：例如 /summaries/immediateAnnualTrend?year=XXXX
      const res = await axios.get(`/summaries/immediateAnnualTrend?year=${y}`);
      setMonthsData(res.data.months || []);
    } catch (error) {
      console.error("無法取得年度趨勢:", error);
    }
  };

  const lineData = {
    labels: monthsData.map(m => `${m.month}月`),
    datasets: [
      {
        label: "Issue 數量",
        data: monthsData.map(m => m.issueCount),
        borderColor: "rgba(54,162,235,1)",   // 線條顏色
        backgroundColor: "rgba(54,162,235,0.2)", // 折線下方填色 (若 fill=true)
        fill: false,  // 若想要線下方區域填滿，改成 true
        tension: 0.1  // 線條平滑度 (0=折線, 0.4以上=平滑曲線)
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">📊 {year} 年度趨勢 (即時 - 折線圖)</h2>

      <div className="mb-3">
        <label className="me-2">選擇年份：</label>
        <input
          type="number"
          style={{ width: "80px" }}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <div style={{ height: "400px" }}>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
}
