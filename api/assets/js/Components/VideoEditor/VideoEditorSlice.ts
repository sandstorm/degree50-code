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

export type VideoEditorState = {
    annotations: Array<Annotation>
    videoCodes: Array<VideoCode>
    customVideoCodesPool: Array<VideoCodePrototype>
    cutlist: CutList
}

const initialState: VideoEditorState = {
    annotations: [],
    videoCodes: [],
    customVideoCodesPool: [],
    cutlist: [],
}

export const videoEditorSlice = createSlice({
    name: 'videoEditor',
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
        setVideoEditor: (state, action: PayloadAction<VideoEditorState>) => {
            state.annotations = action.payload?.annotations || []
            state.videoCodes = action.payload?.videoCodes || []
            state.customVideoCodesPool = action.payload?.customVideoCodesPool || []

            // FIXME
            // this is just a placeholder until we have the server side in place
            state.cutlist = action.payload?.cutlist || []
        },
    },
})

export const {
    setAnnotations,
    setVideoCodes,
    setVideoEditor,
    setCutList,
    setCustomVideoCodesPool,
} = videoEditorSlice.actions

export const selectVideoEditor = (state: { videoEditor: VideoEditorState }) => state.videoEditor

export default videoEditorSlice.reducer
