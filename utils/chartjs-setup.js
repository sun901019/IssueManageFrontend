// frontend/utils/chartjs-setup.js

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  } from "chart.js";
  
  // 在這裡一次註冊你需要的所有元素
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );
  
  // 如果要進一步自訂全域設定（例如 tooltip 顯示方式等），可以在這裡設定
  // ChartJS.defaults.plugins.tooltip = {...};
  // ChartJS.defaults.font.family = "微軟正黑體"; // 只是範例
  
  // 此檔案不需要 export 任何東西
  // 只要被 import 之後，就會執行 ChartJS.register(...) 了
  