import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questionList: localStorage.getItem("questionList")
    ? JSON.parse(localStorage.getItem("questionList"))
    : [],
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQuestionList: (state, action) => {
      state.questionList = action.payload;
      localStorage.setItem("questionList", JSON.stringify(state.questionList));
    },
    addToQuestionList: (state, action) => {
      state.questionList = [...state.questionList, action.payload];
      localStorage.setItem("questionList", JSON.stringify(state.questionList));
    },
  },
});

export const { setQuestionList, addToQuestionList } = questionSlice.actions;

export default questionSlice.reducer;
