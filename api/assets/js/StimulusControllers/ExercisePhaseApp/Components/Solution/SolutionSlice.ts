import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {AppThunk, RootState} from '../../Store/Store';
import {ApiEndpoints} from "../Config/ConfigSlice";

export type Solution = {
    annotations: string
}

const initialState: Solution = {
    annotations: '',
};

export const solutionSlice = createSlice({
    name: 'solution',
    initialState,
    reducers: {
        setAnnotations: (state, action: PayloadAction<string>) => {
            state.annotations = action.payload
        },
        setSolution: (state, action: PayloadAction<Solution>) => {
            state.annotations = action.payload.annotations
        }
    },
});

export const { setAnnotations, setSolution } = solutionSlice.actions;

export const selectSolution = (state: RootState) => state.solution;

export default solutionSlice.reducer;

// THUNKS
export const sendSolutionState = (): AppThunk => async (dispatch, getState) => {
    const solution = getState().solution
    const updateSolutionEndpoint = getState().config.apiEndpoints
    console.log(solution, updateSolutionEndpoint.updateSolution)
    //dispatch(syncStart())
    // send req
    //const response = await (await fetch()).json()
    //dispatch(snycComplete())
}
