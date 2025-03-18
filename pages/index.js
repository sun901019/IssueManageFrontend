// pages/index.js
import { useState } from "react";
import IssueBoard from "../components/IssueBoard";
import Dashboard from "../components/Dashboard";
// 匯入我們剛做的年度頁面
import AnnualSummaryPage from "./annual";
import AnnualTrendPage from "./annualTrend";

export default function Home() {
  const [view, setView] = useState("board");

  return (
    <div className="p-4">
      <div className="mb-3">
        <button onClick={() => setView("board")} className="btn btn-primary me-2">Issue 看板</button>
        <button onClick={() => setView("dashboard")} className="btn btn-secondary me-2">Dashboard</button>
        <button onClick={() => setView("annual")} className="btn btn-secondary me-2">年度累計</button>
        <button onClick={() => setView("annualTrend")} className="btn btn-secondary me-2">年度趨勢</button>
      </div>

      {view === "board" && <IssueBoard />}
      {view === "dashboard" && <Dashboard />}
      {view === "annual" && <AnnualSummaryPage />}
      {view === "annualTrend" && <AnnualTrendPage />}
    </div>
  );
}
