import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Exercise, VideoFavorite, VideoFavoriteId } from '../types'

export const BASE_URL = `${window.location.origin.toString()}`
export const SERVER_BASE_URL = `${BASE_URL}/schreibtisch`

/****************
 * RTK Queries *
 ***************/

export const SchreibtischApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: 'schreibtischApi',
  tagTypes: ['Exercises', 'Videos', 'Material'],
  endpoints: (build) => ({
    exercises: build.query<Array<Exercise>, void>({
      query: () => 'exercises',
      providesTags: ['Exercises'],
    }),

    videoFavorites: build.query<Array<VideoFavorite>, void>({
      query: () => 'video-favorites',
      providesTags: ['Videos'],
    }),

    toggleVideoFavorite: build.mutation<void, VideoFavoriteId>({
      query: (videoFavoriteId) => ({
        url: `video-favorites/toggle/${videoFavoriteId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Videos'],
    }),
  }),
})

// NOTE:
// RTK Query updates the redux store and these hooks will be informed about
// their state subscriptions.
// using a query of the same endpoint will also be re-rendered (e.g. components using useGetExercisesQuery())
export const {
  useExercisesQuery,
  useVideoFavoritesQuery,
  useToggleVideoFavoriteMutation,
} = SchreibtischApi
