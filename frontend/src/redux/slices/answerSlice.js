import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  answerMap: localStorage.getItem("answerMap")
    ? JSON.parse(localStorage.getItem("answerMap"))
    : {},
};

const answerSlice = createSlice({
  name: "answer",
  initialState,
  reducers: {
    updateAnswer: (state, action) => {
      const { templateId, questionId, answer } = action.payload;
      if (!state.answerMap[templateId]) {
        state.answerMap[templateId] = {};
      }
      state.answerMap[templateId][questionId] = answer;
      localStorage.setItem("answerMap", JSON.stringify(state.answerMap));
    },
    clearTemplateAnswers: (state, action) => {
      const templateId = action.payload;
      if (state.answerMap[templateId]) {
        delete state.answerMap[templateId];
        localStorage.setItem("answerMap", JSON.stringify(state.answerMap));
      }
    },
  },
});

export const { clearTemplateAnswers, updateAnswer } = answerSlice.actions;
export default answerSlice.reducer;
