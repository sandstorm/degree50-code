import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { CutList } from '../VideoEditor/Editors/CuttingEditor/types'

// Media item type without methods, so that it is serializable
export type MediaItemType = {
    start: string
    end: string
    text: string
    color: null | string
}

export type Annotation = MediaItemType
export type VideoCode = MediaItemType

export type Solution = {
    annotations: Array<Annotation>
    videoCodes: Array<VideoCode>
    cutlist: CutList
}

const initialState: Solution = {
    annotations: [],
    videoCodes: [],
    cutlist: [],
}

export const solutionSlice = createSlice({
    name: 'solution',
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
        setSolution: (state, action: PayloadAction<Solution>) => {
            state.annotations = action.payload.annotations
            state.videoCodes = action.payload.videoCodes

            // FIXME
            // this is just a placeholder until we have the server side in place
            state.cutlist = action.payload.cutlist || []
        },
    },
})

export const { setAnnotations, setVideoCodes, setSolution, setCutList } = solutionSlice.actions

export const selectSolution = (state: AppState) => state.solution

export default solutionSlice.reducer
