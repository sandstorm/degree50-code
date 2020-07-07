import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, AppState } from '../../Store/Store'
import Axios from 'axios'

export enum ConnectionState {
    CONNECTED = 'CONNECTED',
    NOT_CONNECTED = 'NOT_CONNECTED',
    CONNECTING = 'CONNECTING',
}

export type TeamMemberId = string
export type TeamMember = {
    id: TeamMemberId
    name: string
    connectionState: ConnectionState
}

export type PresenceState = {
    teamMemberIds: Array<TeamMemberId>
    teamMembersById: Record<TeamMemberId, TeamMember>
    error?: string
    connectionState: ConnectionState
    topic: string
}

export type PresencePayload = Pick<PresenceState, 'teamMemberIds'> & Pick<PresenceState, 'teamMembersById'>

const initialState: PresenceState = {
    teamMemberIds: [],
    teamMembersById: {},
    error: undefined,
    connectionState: ConnectionState.NOT_CONNECTED,
    topic: '',
}

const PresenceSlice = createSlice({
    name: 'Presence',
    initialState,
    reducers: {
        setPresenceState: (state: PresenceState, action: PayloadAction<PresencePayload>): PresenceState => ({
            ...state,
            ...action.payload,
        }),
        setConnectionState: (state: PresenceState, action: PayloadAction<ConnectionState>): PresenceState => ({
            ...state,
            connectionState: action.payload,
        }),
        setError: (state: PresenceState, action: PayloadAction<PresenceState['error']>): PresenceState => ({
            ...state,
            error: action.payload,
        }),
    },
})

export const presenceActions = PresenceSlice.actions
export default PresenceSlice.reducer

// Selectors

export const selectTeamMemberIds = (state: AppState) => state.presence.teamMemberIds
export const selectTeamMemberById = (id: TeamMemberId, state: AppState) => state.presence.teamMembersById[id]
