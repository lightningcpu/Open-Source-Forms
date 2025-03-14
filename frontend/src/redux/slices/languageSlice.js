import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: localStorage.getItem("language")
    ? JSON.parse(localStorage.getItem("language"))
    : "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("language", JSON.stringify(state.language));
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
