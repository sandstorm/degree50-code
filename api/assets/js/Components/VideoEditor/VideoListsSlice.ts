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
    idFromPrototype: null | string
}

export type Annotation = MediaItemType
export type VideoCode = MediaItemType
export type Subtitle = MediaItemType

export type VideoListsState = {
    annotations: Array<Annotation>
    videoCodes: Array<VideoCode>
    customVideoCodesPool: Array<VideoCodePrototype>
    cutList: CutList
    subtitles: Subtitle[]
}

const initialState: VideoListsState = {
    annotations: [],
    videoCodes: [],
    customVideoCodesPool: [],
    cutList: [],
    subtitles: [],
}

export const videoListsSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {
        setAnnotations: (state, action: PayloadAction<Array<Annotation>>) => {
            return {
                ...state,
                annotations: action.payload,
            }
        },
        setVideoCodes: (state, action: PayloadAction<Array<VideoCode>>) => {
            return {
                ...state,
                videoCodes: action.payload,
            }
        },
        setCutList: (state, action: PayloadAction<CutList>) => {
            return {
                ...state,
                cutList: action.payload,
            }
        },
        setCustomVideoCodesPool: (state, action: PayloadAction<Array<VideoCodePrototype>>) => {
            return {
                ...state,
                customVideoCodesPool: action.payload,
            }
        },
        setSubtitles: (state, action: PayloadAction<Subtitle[]>) => {
            return {
                ...state,
                subtitles: action.payload,
            }
        },
        setVideoEditor: (_, action: PayloadAction<VideoListsState>) => {
            return {
                annotations: action.payload?.annotations || [],
                videoCodes: action.payload?.videoCodes || [],
                customVideoCodesPool: action.payload?.customVideoCodesPool || [],
                subtitles: action.payload?.subtitles || [],
                cutList: action.payload?.cutList || [],
            }
        },
    },
})

export const { actions } = videoListsSlice

const selectVideoEditorLists = (state: { videoEditor: { lists: VideoListsState } }) => state.videoEditor.lists

export const selectors = {
    selectVideoEditorLists,
}

export default videoListsSlice.reducer
