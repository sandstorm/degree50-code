import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TeamMemberId } from './PresenceSlice'

export type CurrentEditorState = {
    currentEditorId?: TeamMemberId
    currentEditorTokenRequests: Array<TeamMemberId>
}

const initialState: CurrentEditorState = {
    currentEditorId: undefined,
    currentEditorTokenRequests: [],
}

const CurrentEditorSlice = createSlice({
    name: 'CurrentEditor',
    initialState,
    reducers: {
        setCurrentEditorId: (state: CurrentEditorState, action: PayloadAction<TeamMemberId>): CurrentEditorState => ({
            ...state,
            currentEditorId: action.payload,
        }),
    },
})

export const { setCurrentEditorId } = CurrentEditorSlice.actions
export default CurrentEditorSlice.reducer

export const selectCurrentEditorId = (state: { currentEditor: CurrentEditorState }) =>
    state.currentEditor.currentEditorId
