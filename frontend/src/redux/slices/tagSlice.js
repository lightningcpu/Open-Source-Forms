import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tagList: localStorage.getItem("tagList")
    ? JSON.parse(localStorage.getItem("tagList"))
    : [],
};

const tagSlice = createSlice({
  name: "tag",
  initialState,
  reducers: {
    setTagList: (state, action) => {
      const newList = action.payload;
      state.tagList = newList;
      localStorage.setItem("tagList", JSON.stringify(state.tagList));
    },
  },
});

export const { setTagList } = tagSlice.actions;
export default tagSlice.reducer;
