import { TAGS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const tagsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query({
      query: () => ({
        url: TAGS_URL,
        method: "GET",
        providesTags: ["Tag"],
      }),
      keepUnusedDataFor: 60,
    }),
    getTagCloud: builder.query({
      query: () => ({
        url: `${TAGS_URL}/cloud`,
        method: "GET",
        providesTags: ["Tag"],
      }),
    }),
  }),
});

export const { useGetTagsQuery, useGetTagCloudQuery } = tagsApiSlice;
