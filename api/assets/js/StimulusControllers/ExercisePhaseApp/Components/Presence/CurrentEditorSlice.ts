import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TeamMemberId } from './PresenceSlice'

export type CurrentEditorState = {
    currentEditorId?: TeamMemberId
}

const initialState: CurrentEditorState = {
    currentEditorId: undefined,
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

export type CurrentEditorStateSlice = { currentEditor: CurrentEditorState }

export const selectCurrentEditorId = (state: CurrentEditorStateSlice) => state.currentEditor.currentEditorId
