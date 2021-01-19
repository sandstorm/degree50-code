import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CutList } from 'Components/VideoEditor/Editors/CuttingEditor/types'
import { VideoCodePrototype } from './Editors/VideoCodeEditor/types'
import { timeToSecond } from './Editors/utils'
import { remove, set } from 'immutable'

// Media item type without methods, so that it is serializable
export type MediaItemType = {
    start: string
    end: string
    text: string
    memo: string
    color: null | string
    idFromPrototype: null | string
}

export type AnnotationFromAPI = MediaItemType & { id?: string }
export type Annotation = Omit<AnnotationFromAPI, 'id'> & { id: string }

export type VideoCode = MediaItemType
export type Subtitle = MediaItemType

export type VideoListsState = {
    videoCodes: Array<VideoCode>
    annotations: Array<AnnotationFromAPI>
    customVideoCodesPool: Array<VideoCodePrototype>
    cutList: CutList
    subtitles: Subtitle[]
}

const initialState: VideoListsState = {
    videoCodes: [],
    annotations: [],
    customVideoCodesPool: [],
    cutList: [],
    subtitles: [],
}

// TODO remove annotations after refactoring!

export const videoListsSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {
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
            // WHY:
            // New items are always placed at the current cursor position.
            // This might lead to a situation, where it is placed before another item, which
            // is considered to be an illegal state. Therefore we reorder items in that case.
            const sortedByStarttime = [...action.payload].sort((a, b) => {
                const startA = timeToSecond(a.start)
                const startB = timeToSecond(b.start)

                if (startA < startB) {
                    return -1
                } else if (startA > startB) {
                    return 1
                } else {
                    return 0
                }
            })

            return {
                ...state,
                subtitles: sortedByStarttime,
            }
        },
        setVideoEditor: (_, action: PayloadAction<VideoListsState>) => {
            return {
                videoCodes: action.payload?.videoCodes || [],
                annotations: action.payload?.annotations || [],
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
