import { FORMS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const formsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersForms: builder.query({
      query: () => ({
        url: FORMS_URL,
        method: "GET",
        providesTags: ["Form"],
      }),
      keepUnusedDataFor: 60,
    }),
    getTemplateForms: builder.query({
      query: (templateId) => ({
        url: `${FORMS_URL}/template/${templateId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    getFormById: builder.query({
      query: (formId) => ({
        url: `${FORMS_URL}/${formId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    createForm: builder.mutation({
      query: (data) => ({
        url: `${FORMS_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateForm: builder.mutation({
      query: (data) => ({
        url: `${FORMS_URL}`,
        method: "PUT",
        body: data,
        invalidatesTags: ["Form"],
      }),
    }),
    deleteForm: builder.mutation({
      query: (formId) => ({
        url: `${FORMS_URL}/${formId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUsersFormsQuery,
  useGetTemplateFormsQuery,
  useGetFormByIdQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
} = formsApiSlice;
