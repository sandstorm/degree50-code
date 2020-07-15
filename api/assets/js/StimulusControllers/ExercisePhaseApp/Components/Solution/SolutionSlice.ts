import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { Subtitle } from '../SubtitleEditor/SubtitleEditor'

export type Solution = {
    annotations: Array<Subtitle>
    videoCodes: Array<Subtitle>
}

const initialState: Solution = {
    annotations: [],
    videoCodes: [],
}

export const solutionSlice = createSlice({
    name: 'solution',
    initialState,
    reducers: {
        setAnnotations: (state, action: PayloadAction<Array<Subtitle>>) => {
            state.annotations = action.payload
        },
        setVideoCodes: (state, action: PayloadAction<Array<Subtitle>>) => {
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
