import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { MediaItem } from '../VideoEditor/Editors/components/types'

export type Solution = {
    annotations: Array<MediaItem>
    videoCodes: Array<MediaItem>
}

const initialState: Solution = {
    annotations: [],
    videoCodes: [],
}

export const solutionSlice = createSlice({
    name: 'solution',
    initialState,
    reducers: {
        setAnnotations: (state, action: PayloadAction<Array<MediaItem>>) => {
            state.annotations = action.payload
        },
        setVideoCodes: (state, action: PayloadAction<Array<MediaItem>>) => {
            state.videoCodes = action.payload
        },
        setSolution: (state, action: PayloadAction<Solution>) => {
            state.annotations = action.payload.annotations
            state.videoCodes = action.payload.videoCodes
        },
    },
})

export const { setAnnotations, setVideoCodes, setSolution } = solutionSlice.actions

export const selectSolution = (state: AppState) => state.solution

export default solutionSlice.reducer
