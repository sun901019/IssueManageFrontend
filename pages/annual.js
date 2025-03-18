// frontend/pages/annual.js
import { useEffect, useState } from "react";
import axios from "../utils/api";

export default function AnnualSummaryPage() {
  const [year, setYear] = useState("2025");
  const [annualData, setAnnualData] = useState(null);

  useEffect(() => {
    fetchAnnualData(year);
  }, [year]);

  const fetchAnnualData = async (y) => {
    try {
      // 呼叫 /api/summaries/annual?year=2025
      const res = await axios.get(`/summaries/annual?year=${y}`);
      setAnnualData(res.data);
    } catch (error) {
      console.error("無法取得年度數據:", error);
      setAnnualData(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">📅 年度累計報表</h2>
      <div className="mb-3">
        <label className="me-2">選擇年份：</label>
        <input
          type="number"
          style={{ width: "80px" }}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      {annualData ? (
        <div className="card p-3">
          <h5>年度：{annualData.year}</h5>
          <p>總 Issue：{annualData.totalIssues}</p>
          <p>已完成：{annualData.completed}</p>
          <p>未完成：{annualData.uncompleted}</p>

          {/* 來源 */}
          <div>
            <h6>來源分佈</h6>
            {Object.entries(annualData.sourceStats || {}).map(([src, cnt]) => (
              <div key={src}>{src}：{cnt}</div>
            ))}
          </div>

          {/* 類型 */}
          <div className="mt-3">
            <h6>問題類型分佈</h6>
            {Object.entries(annualData.typeStats || {}).map(([typ, cnt]) => (
              <div key={typ}>{typ}：{cnt}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="alert alert-info">尚無年度資料</div>
      )}
    </div>
  );
}
