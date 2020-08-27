import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CutList } from 'Components/VideoEditor/Editors/CuttingEditor/types'
import { VideoCodePrototype } from './Editors/VideoCodeEditor/types'

// Media item type without methods, so that it is serializable
export type MediaItemType = {
    start: string
    end: string
    text: string
    memo: string
    color: null | string
}

export type Annotation = MediaItemType
export type VideoCode = MediaItemType
export type Subtitle = MediaItemType

export type VideoListsState = {
    annotations: Array<Annotation>
    videoCodes: Array<VideoCode>
    customVideoCodesPool: Array<VideoCodePrototype>
    cutlist: CutList
    subtitles: Subtitle[]
}

const initialState: VideoListsState = {
    annotations: [],
    videoCodes: [],
    customVideoCodesPool: [],
    cutlist: [],
    subtitles: [],
}

export const videoListsSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {
        setAnnotations: (state, action: PayloadAction<Array<Annotation>>) => {
            state.annotations = action.payload
        },
        setVideoCodes: (state, action: PayloadAction<Array<VideoCode>>) => {
            state.videoCodes = action.payload
        },
        setCutList: (state, action: PayloadAction<CutList>) => {
            state.cutlist = action.payload
        },
        setCustomVideoCodesPool: (state, action: PayloadAction<Array<VideoCodePrototype>>) => {
            state.customVideoCodesPool = action.payload
        },
        setSubtitles: (state, action: PayloadAction<Subtitle[]>) => {
            state.subtitles = action.payload
        },
        setVideoEditor: (state, action: PayloadAction<VideoListsState>) => {
            state.annotations = action.payload?.annotations || []
            state.videoCodes = action.payload?.videoCodes || []
            state.customVideoCodesPool = action.payload?.customVideoCodesPool || []
            state.subtitles = action.payload?.subtitles || []
            state.cutlist = action.payload?.cutlist || []
        },
    },
})

export const { actions } = videoListsSlice

const selectVideoEditorLists = (state: { videoEditor: { lists: VideoListsState } }) => state.videoEditor.lists

export const selectors = {
    selectVideoEditorLists,
}

export default videoListsSlice.reducer
