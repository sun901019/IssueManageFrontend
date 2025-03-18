import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", 
  // 若你有 proxy 或其他設定，可調整此路徑
});

export default API;
