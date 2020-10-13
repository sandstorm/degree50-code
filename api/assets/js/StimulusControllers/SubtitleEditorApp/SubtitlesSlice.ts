import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import { AppState } from './Store/Store'

export type SubtitlesState = {
    video: Video | undefined
    updateUrl: string | undefined
}

const initialState: SubtitlesState = {
    video: undefined,
    updateUrl: undefined,
}

export const subtitlesSlice = createSlice({
    name: 'subtitlesApp',
    initialState,
    reducers: {
        setVideo: (state: SubtitlesState, action: PayloadAction<Video>) => {
            return {
                ...state,
                video: action.payload,
            }
        },
        setUpdateUrl: (state: SubtitlesState, action: PayloadAction<string>) => {
            return {
                ...state,
                updateUrl: action.payload,
            }
        },
    },
})

export const { actions } = subtitlesSlice

const selectVideo = (state: AppState) => state.subtitlesApp.video
const selectUpdateUrl = (state: AppState) => state.subtitlesApp.updateUrl

export const selectors = {
    selectVideo,
    selectUpdateUrl,
}

export default subtitlesSlice.reducer
