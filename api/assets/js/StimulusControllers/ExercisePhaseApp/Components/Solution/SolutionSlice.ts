import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, AppState } from '../../Store/Store'
import axios from 'axios'
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

export const { setAnnotations, setSolution } = solutionSlice.actions

export const selectSolution = (state: AppState) => state.solution

export default solutionSlice.reducer

// THUNKS
export const sendSolutionState = (): AppThunk => async (dispatch, getState) => {
    const solution = getState().solution
    const updateSolutionEndpoint = getState().config.apiEndpoints.updateSolution

    axios
        .post(updateSolutionEndpoint, {
            solution: solution,
        })
        .then(function (response) {
            console.log('Update Solution', response.data)
        })
        .catch(function (error) {
            console.log(error)
        })
}
