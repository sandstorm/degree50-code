import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'

export enum ConnectionState {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    UNKNOWN = 'UNKNOWN',
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
    isConnecting: boolean
}

const initialState: PresenceState = {
    teamMemberIds: [],
    teamMembersById: {},
    error: undefined,
    isConnecting: false,
}

const PresenceSlice = createSlice({
    name: 'Presence',
    initialState,
    reducers: {
        setTeamMembers: (
            state: PresenceState,
            action: PayloadAction<PresenceState['teamMembersById']>
        ): PresenceState => ({
            ...state,
            teamMemberIds: Object.keys(action.payload),
            teamMembersById: action.payload,
        }),
        setIsConnecting: (state: PresenceState, action: PayloadAction<boolean>): PresenceState => ({
            ...state,
            isConnecting: action.payload,
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
export const selectTeamMembersById = (state: AppState) => state.presence.teamMembersById
export const selectIsConnecting = (state: AppState) => state.presence.isConnecting

export const selectOnlineTeamMemberIds = createSelector([selectTeamMemberIds, selectTeamMembersById], (allIds, byId) =>
    allIds.filter((memberId) => byId[memberId].connectionState === ConnectionState.CONNECTED)
)
