import { QUESTIONS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const questionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionById: builder.query({
      query: (questionId) => ({
        url: `${QUESTIONS_URL}/${questionId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${QUESTIONS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    updateQuestion: builder.mutation({
      query: (data) => ({
        url: `${QUESTIONS_URL}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `${QUESTIONS_URL}/${questionId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionsApiSlice;
