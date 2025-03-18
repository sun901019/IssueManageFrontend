// pages/index.js
import { useState } from "react";
import IssueBoard from "../components/IssueBoard";
import Dashboard from "../components/Dashboard";
import EnhancedDashboard from "../components/EnhancedDashboard"; // 添加增強版儀表板
// 匯入我們剛做的年度頁面
import AnnualSummaryPage from "./annual";
import AnnualTrendPage from "./annualTrend";

export default function Home() {
  const [view, setView] = useState("board");

  return (
    <div className="p-4">
      <div className="mb-3">
        <button onClick={() => setView("board")} className={`btn ${view === "board" ? "btn-primary" : "btn-outline-primary"} me-2`}>Issue 看板</button>
        
        <div className="btn-group me-2">
          <button 
            className={`btn ${view === "dashboard" || view === "enhanced-dashboard" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setView("enhanced-dashboard")} // 預設使用增強版儀表板
          >
            Dashboard
          </button>
          <button 
            type="button" 
            className={`btn ${view === "dashboard" || view === "enhanced-dashboard" ? "btn-primary" : "btn-outline-primary"} dropdown-toggle dropdown-toggle-split`}
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <span className="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setView("dashboard"); }}>原始儀表板</a></li>
            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setView("enhanced-dashboard"); }}>增強版儀表板</a></li>
          </ul>
        </div>
        
        <button onClick={() => setView("annual")} className={`btn ${view === "annual" ? "btn-primary" : "btn-outline-primary"} me-2`}>年度累計</button>
        <button onClick={() => setView("annualTrend")} className={`btn ${view === "annualTrend" ? "btn-primary" : "btn-outline-primary"} me-2`}>年度趨勢</button>
      </div>

      {view === "board" && <IssueBoard />}
      {view === "dashboard" && <Dashboard />}
      {view === "enhanced-dashboard" && <EnhancedDashboard />}
      {view === "annual" && <AnnualSummaryPage />}
      {view === "annualTrend" && <AnnualTrendPage />}
    </div>
  );
}
