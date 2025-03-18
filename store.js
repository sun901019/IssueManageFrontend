import { configureStore } from "@reduxjs/toolkit";
import issueReducer from "./reducers/issueReducer"; // 確保這個檔案存在

const store = configureStore({
  reducer: {
    issue: issueReducer, // 確保這裡的 key 有對應的 reducer
  },
});

export default store;
