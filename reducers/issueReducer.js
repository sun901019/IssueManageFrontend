import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  issues: [],
};

const issueSlice = createSlice({
  name: "issue",
  initialState,
  reducers: {
    setIssues: (state, action) => {
      state.issues = action.payload;
    },
    addIssue: (state, action) => {
      state.issues.push(action.payload);
    },
  },
});

export const { setIssues, addIssue } = issueSlice.actions;
export default issueSlice.reducer;
